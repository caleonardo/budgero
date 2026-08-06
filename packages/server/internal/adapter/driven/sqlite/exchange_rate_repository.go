package sqlite

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"budgero-server/internal/adapter/driven/sqlite/sqlc"
	"budgero-server/internal/port/driven/repository"
)

// ExchangeRateRepository implements repository.ExchangeRateRepository using SQLite.
type ExchangeRateRepository struct {
	queries *sqlc.Queries
}

// NewExchangeRateRepository creates a new ExchangeRateRepository.
func NewExchangeRateRepository(queries *sqlc.Queries) *ExchangeRateRepository {
	return &ExchangeRateRepository{queries: queries}
}

var _ repository.ExchangeRateRepository = (*ExchangeRateRepository)(nil)

// GetRate retrieves the exchange rate between two currencies on an exact date.
func (r *ExchangeRateRepository) GetRate(ctx context.Context, baseCurrency, targetCurrency, rateDate string) (float64, error) {
	rate, err := r.queries.GetExchangeRate(ctx, sqlc.GetExchangeRateParams{
		BaseCurrency:   baseCurrency,
		TargetCurrency: targetCurrency,
		RateDate:       rateDate,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, fmt.Errorf("rate not found for %s/%s on %s", baseCurrency, targetCurrency, rateDate)
		}
		return 0, err
	}
	return rate, nil
}

// GetLatestRateOnOrBefore returns the most recent rate at or before rateDate.
func (r *ExchangeRateRepository) GetLatestRateOnOrBefore(ctx context.Context, baseCurrency, targetCurrency, rateDate string) (rate float64, actualDate string, err error) {
	row, err := r.queries.GetLatestExchangeRateOnOrBefore(ctx, sqlc.GetLatestExchangeRateOnOrBeforeParams{
		BaseCurrency:   baseCurrency,
		TargetCurrency: targetCurrency,
		RateDate:       rateDate,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "", fmt.Errorf("no rate for %s/%s on or before %s", baseCurrency, targetCurrency, rateDate)
		}
		return 0, "", err
	}
	return row.Rate, row.RateDate, nil
}

// UpsertRate creates or updates an exchange rate for a currency pair and date.
func (r *ExchangeRateRepository) UpsertRate(ctx context.Context, baseCurrency, targetCurrency, rateDate string, rate float64) error {
	return r.queries.UpsertExchangeRate(ctx, sqlc.UpsertExchangeRateParams{
		BaseCurrency:   baseCurrency,
		TargetCurrency: targetCurrency,
		RateDate:       rateDate,
		Rate:           rate,
	})
}

// ListRates returns all exchange rates for a base currency on a specific date.
func (r *ExchangeRateRepository) ListRates(ctx context.Context, baseCurrency, rateDate string) (map[string]float64, error) {
	rows, err := r.queries.ListExchangeRates(ctx, sqlc.ListExchangeRatesParams{
		BaseCurrency: baseCurrency,
		RateDate:     rateDate,
	})
	if err != nil {
		return nil, err
	}

	rates := make(map[string]float64, len(rows))
	for _, row := range rows {
		rates[row.TargetCurrency] = row.Rate
	}
	return rates, nil
}
