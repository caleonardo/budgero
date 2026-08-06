package external

import "context"

// CurrencyProvider defines methods for fetching exchange rates from external APIs.
type CurrencyProvider interface {
	// GetRates fetches all exchange rates for a base currency on a specific
	// date (YYYY-MM-DD). Returns uppercase target currency codes mapped to
	// their rates, plus the dataset date actually served — which may be
	// earlier than requested (upstream gaps, historical floor clamps).
	GetRates(ctx context.Context, baseCurrency, date string) (map[string]float64, string, error)
}
