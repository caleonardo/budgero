import { assertValidExchangeRate, convertScaled } from '@budgero/core/browser';

/** Keep enough decimal places for small FX and crypto rates without rounding on commit. */
export const EXCHANGE_RATE_PRECISION = 15;

export interface ExchangeRateConversionCheck {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  /** Transfer budget-rate edits re-derive native money with the reciprocal rate. */
  reciprocal?: boolean;
}

export function validateExchangeRateConversions(
  rate: number,
  checks: readonly ExchangeRateConversionCheck[]
): string | null {
  try {
    assertValidExchangeRate(rate);
    for (const check of checks) {
      convertScaled(
        check.amount,
        check.reciprocal ? 1 / rate : rate,
        check.fromCurrency,
        check.toCurrency
      );
    }
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid exchange rate.';
  }
}

export function isUnusualExchangeRateChange(
  previousRate: number,
  nextRate: number,
  factor = 1_000
): boolean {
  if (previousRate <= 0 || nextRate <= 0) return false;
  const ratio = nextRate / previousRate;
  return ratio >= factor || ratio <= 1 / factor;
}

export function formatExchangeRate(
  value: number,
  maxFractionDigits = EXCHANGE_RATE_PRECISION
): string {
  if (!Number.isFinite(value)) return '0.00';

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  }).format(value);
}
