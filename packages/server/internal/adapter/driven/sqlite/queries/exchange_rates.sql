-- name: GetExchangeRate :one
SELECT rate FROM exchange_rates
WHERE base_currency = ? AND target_currency = ? AND rate_date = ?;

-- name: GetLatestExchangeRateOnOrBefore :one
SELECT rate, rate_date FROM exchange_rates
WHERE base_currency = ? AND target_currency = ? AND rate_date <= ?
ORDER BY rate_date DESC
LIMIT 1;

-- name: UpsertExchangeRate :exec
INSERT INTO exchange_rates (base_currency, target_currency, rate_date, rate, updated_at)
VALUES (?, ?, ?, ?, datetime('now'))
ON CONFLICT(base_currency, target_currency, rate_date) DO UPDATE SET
    rate = excluded.rate,
    updated_at = datetime('now');

-- name: ListExchangeRates :many
SELECT * FROM exchange_rates
WHERE base_currency = ? AND rate_date = ?;

-- name: ListRecentRatePairs :many
SELECT DISTINCT base_currency, target_currency FROM exchange_rates
WHERE rate_date >= ?;
