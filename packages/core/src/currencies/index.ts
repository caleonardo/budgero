/**
 * Currency registry: kind, storage scale, and display precision per code.
 *
 * Fiat amounts are stored as integer milliunits (scale 1000). Crypto amounts
 * are stored at satoshi-level precision (scale 1e8) — milliunits would make
 * 0.001 BTC the smallest representable amount. A global 1e8 scale is not an
 * option: JS safe integers (~9e15) would cap balances at ~90M units, which
 * high-denomination fiat budgets (IDR, VND) exceed. Only crypto codes are
 * enumerated; every unknown code is treated as fiat at the default scale.
 */

import { ValidationError } from '../types/index.js';

export type CurrencyKind = 'fiat' | 'crypto';

export interface CurrencyInfo {
  code: string;
  kind: CurrencyKind;
  /** Integer storage units per major unit (1000 = milliunits, 1e8 = sats). */
  scale: number;
  /** Decimal places shown in amount displays. */
  displayDecimals: number;
  name: string;
}

/** Storage scale for every fiat currency (integer milliunits). */
export const FIAT_SCALE = 1000;

/** Storage scale for every crypto currency (satoshi-level). At 1e8 the JS
 * safe-integer ceiling still allows ~90M whole coins — above any supply
 * that matters here. */
export const CRYPTO_SCALE = 100_000_000;

/** Largest integer storage value JavaScript can represent exactly. */
export const MAX_SAFE_STORAGE_AMOUNT = Number.MAX_SAFE_INTEGER;

/** Whether a database/domain amount preserves the exact-integer money invariant. */
export function isSafeStorageAmount(value: number): boolean {
  return Number.isSafeInteger(value);
}

/** Validate a dimensionless exchange rate before it participates in money arithmetic. */
export function assertValidExchangeRate(rate: number): void {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new ValidationError(
      'Exchange rate must be a finite number greater than zero.',
      'exchangeRate'
    );
  }
}

/** Curated crypto set. Codes must exist in the exchange-api dataset. */
const CRYPTO_CURRENCIES: Readonly<Record<string, string>> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin',
  BNB: 'BNB',
  XRP: 'XRP',
  SOL: 'Solana',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  TRX: 'TRON',
  DOT: 'Polkadot',
  LTC: 'Litecoin',
  AVAX: 'Avalanche',
  LINK: 'Chainlink',
  XLM: 'Stellar',
  XMR: 'Monero',
  ATOM: 'Cosmos',
  UNI: 'Uniswap',
  BCH: 'Bitcoin Cash',
  ETC: 'Ethereum Classic',
  FIL: 'Filecoin',
  NEAR: 'NEAR Protocol',
  ARB: 'Arbitrum',
  OP: 'Optimism',
  DAI: 'Dai',
};

/** ISO 4217 zero-decimal fiat currencies. */
const ZERO_DECIMAL_FIAT = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'ISK',
  'JPY',
  'KMF',
  'KRW',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

/** ISO 4217 three-decimal fiat currencies. */
const THREE_DECIMAL_FIAT = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

export function isCryptoCurrency(code: string): boolean {
  return Object.hasOwn(CRYPTO_CURRENCIES, code.toUpperCase());
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = code.toUpperCase();
  const cryptoName = CRYPTO_CURRENCIES[upper];
  if (cryptoName) {
    return {
      code: upper,
      kind: 'crypto',
      scale: CRYPTO_SCALE,
      displayDecimals: 8,
      name: cryptoName,
    };
  }
  const displayDecimals = ZERO_DECIMAL_FIAT.has(upper) ? 0 : THREE_DECIMAL_FIAT.has(upper) ? 3 : 2;
  return { code: upper, kind: 'fiat', scale: FIAT_SCALE, displayDecimals, name: upper };
}

export function getCurrencyScale(code: string): number {
  return getCurrencyInfo(code).scale;
}

export function listCryptoCurrencies(): CurrencyInfo[] {
  return Object.keys(CRYPTO_CURRENCIES).map((code) => getCurrencyInfo(code));
}

/** Integer storage units → decimal major units for a currency. */
export function scaledToDecimal(amount: number, code: string): number {
  return amount / getCurrencyScale(code);
}

/** Decimal major units → integer storage units for a currency. */
export function decimalToScaled(value: number, code: string): number {
  return Math.round(value * getCurrencyScale(code));
}

/** Convert an integer amount between two currencies' storage scales:
 * round(amount × rate × toScale/fromScale). The single sanctioned
 * cross-scale money×rate boundary. */
export function convertScaled(
  amount: number,
  rate: number,
  fromCurrency: string,
  toCurrency: string
): number {
  assertValidExchangeRate(rate);
  if (!isSafeStorageAmount(amount)) {
    throw new ValidationError(
      'The source amount is outside the supported exact money range. Repair this transaction before converting it.',
      'amount'
    );
  }
  const converted = Math.round(
    amount * rate * (getCurrencyScale(toCurrency) / getCurrencyScale(fromCurrency))
  );
  if (!isSafeStorageAmount(converted)) {
    throw new ValidationError(
      'This exchange rate would create an amount too large to store safely. Check the decimal point.',
      'exchangeRate'
    );
  }
  return converted;
}
