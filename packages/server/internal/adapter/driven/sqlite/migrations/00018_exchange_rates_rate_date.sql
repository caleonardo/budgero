-- Daily rate keying: the monthly exchange-rate cache becomes date-keyed
-- (YYYY-MM-DD). Existing monthly rows are preserved as first-of-month dates.
-- +goose Up
ALTER TABLE exchange_rates RENAME COLUMN month TO rate_date;
UPDATE exchange_rates SET rate_date = rate_date || '-01' WHERE length(rate_date) = 7;

-- +goose Down
DELETE FROM exchange_rates WHERE substr(rate_date, 9, 2) != '01';
UPDATE exchange_rates SET rate_date = substr(rate_date, 1, 7);
ALTER TABLE exchange_rates RENAME COLUMN rate_date TO month;
