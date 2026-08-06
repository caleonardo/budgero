// Package currencyapi fetches daily fiat and crypto exchange rates from the
// fawazahmed0/exchange-api dataset: static, key-less JSON with ~350 currency
// codes, published once per day. Self-hosters can mirror the files and point
// CURRENCY_API_BASE_URL at their copy for a fully offline setup.
package currencyapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"budgero-server/internal/port/driven/external"
)

const (
	// DefaultBaseURL is the public jsDelivr CDN. "{date}" is substituted with
	// a YYYY-MM-DD dataset date.
	DefaultBaseURL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{date}/v1"

	// fallbackBaseURL is the dataset's secondary host, tried only when the
	// primary is the default public CDN (a private mirror must not silently
	// fall back to the public internet).
	fallbackBaseURL = "https://{date}.currency-api.pages.dev/v1"

	// EarliestDate is the first date the dataset serves; older requests clamp.
	EarliestDate = "2024-03-06"

	// maxWalkbackDays bounds the search for the nearest earlier daily file
	// when the requested date has no published dataset (upstream gaps,
	// clock-ahead clients).
	maxWalkbackDays = 7

	dateLayout = "2006-01-02"
)

var errNotFound = errors.New("dataset not published for date")

// Client fetches rates from the exchange-api dataset.
type Client struct {
	baseURL    string
	isDefault  bool
	httpClient *http.Client
}

// New creates a Client. An empty baseURL selects the public jsDelivr CDN.
func New(baseURL string) *Client {
	trimmed := strings.TrimSpace(baseURL)
	if trimmed == "" {
		trimmed = DefaultBaseURL
	}
	return &Client{
		baseURL:    trimmed,
		isDefault:  trimmed == DefaultBaseURL,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

var _ external.CurrencyProvider = (*Client)(nil)

// GetRates fetches all rates for a base currency on a date (YYYY-MM-DD).
// Dates before EarliestDate clamp to it; missing daily files walk back up to
// maxWalkbackDays. Returns uppercase target codes and the dataset date served.
func (c *Client) GetRates(ctx context.Context, baseCurrency, date string) (rates map[string]float64, servedDate string, err error) {
	day, err := time.Parse(dateLayout, date)
	if err != nil {
		return nil, "", fmt.Errorf("invalid rate date %q: %w", date, err)
	}
	earliest, _ := time.Parse(dateLayout, EarliestDate)
	if day.Before(earliest) {
		day = earliest
	}

	var lastErr error
	for i := 0; i <= maxWalkbackDays; i++ {
		d := day.AddDate(0, 0, -i)
		if d.Before(earliest) {
			break
		}
		rates, servedDate, err := c.fetchDay(ctx, baseCurrency, d.Format(dateLayout))
		if err == nil {
			return rates, servedDate, nil
		}
		lastErr = err
		if !errors.Is(err, errNotFound) {
			break
		}
	}
	return nil, "", fmt.Errorf("currency api: no dataset within %d days of %s: %w", maxWalkbackDays, date, lastErr)
}

func (c *Client) fetchDay(ctx context.Context, baseCurrency, date string) (rates map[string]float64, servedDate string, err error) {
	urls := []string{c.endpoint(c.baseURL, baseCurrency, date)}
	if c.isDefault {
		urls = append(urls, c.endpoint(fallbackBaseURL, baseCurrency, date))
	}

	var lastErr error
	for _, u := range urls {
		rates, servedDate, err := c.fetchURL(ctx, u, baseCurrency, date)
		if err == nil {
			return rates, servedDate, nil
		}
		lastErr = err
		if errors.Is(err, errNotFound) {
			// A missing dataset is missing on every host; walk back instead.
			return nil, "", err
		}
	}
	return nil, "", lastErr
}

func (c *Client) endpoint(baseURL, baseCurrency, date string) string {
	resolved := strings.ReplaceAll(baseURL, "{date}", date)
	return fmt.Sprintf("%s/currencies/%s.min.json", resolved, strings.ToLower(baseCurrency))
}

func (c *Client) fetchURL(ctx context.Context, url, baseCurrency, date string) (rates map[string]float64, servedDate string, err error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, http.NoBody)
	if err != nil {
		return nil, "", err
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode == http.StatusNotFound || resp.StatusCode == http.StatusForbidden {
		return nil, "", fmt.Errorf("%w: %s", errNotFound, date)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("currency api %s: unexpected status %d", url, resp.StatusCode)
	}

	var payload map[string]json.RawMessage
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, "", fmt.Errorf("currency api %s: invalid response: %w", url, err)
	}

	servedDate = date
	if raw, ok := payload["date"]; ok {
		var d string
		if err := json.Unmarshal(raw, &d); err == nil && d != "" {
			servedDate = d
		}
	}

	raw, ok := payload[strings.ToLower(baseCurrency)]
	if !ok {
		return nil, "", fmt.Errorf("currency api %s: base %s missing from response", url, baseCurrency)
	}
	var decoded map[string]float64
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return nil, "", fmt.Errorf("currency api %s: invalid rates payload: %w", url, err)
	}

	rates = make(map[string]float64, len(decoded))
	for code, rate := range decoded {
		rates[strings.ToUpper(code)] = rate
	}
	return rates, servedDate, nil
}
