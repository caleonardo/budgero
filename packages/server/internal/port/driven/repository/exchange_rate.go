package repository

import "context"

// ExchangeRateRepository defines methods for exchange rate persistence.
// Rates are keyed by day (YYYY-MM-DD).
type ExchangeRateRepository interface {
	// GetRate gets the exchange rate for a currency pair on an exact date.
	GetRate(ctx context.Context, baseCurrency, targetCurrency, rateDate string) (float64, error)

	// GetLatestRateOnOrBefore returns the most recent rate at or before the
	// given date, plus the date it was stored under.
	GetLatestRateOnOrBefore(ctx context.Context, baseCurrency, targetCurrency, rateDate string) (float64, string, error)

	// UpsertRate inserts or updates an exchange rate for a date.
	UpsertRate(ctx context.Context, baseCurrency, targetCurrency, rateDate string, rate float64) error

	// ListRates lists all exchange rates for a base currency on a date.
	ListRates(ctx context.Context, baseCurrency, rateDate string) (map[string]float64, error)
}
