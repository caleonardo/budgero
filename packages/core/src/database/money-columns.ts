/**
 * Canonical list of integer-milliunit money columns in the schema.
 * Single source of truth for boundaries that must re-present milliunits as
 * decimals (CSV export). Migration 039 keeps its own frozen pre-rename copy.
 */
export const MONEY_COLUMNS_BY_TABLE: Readonly<Record<string, readonly string[]>> = {
  accounts: ['BalanceNative', 'BalanceConverted'],
  transactions: [
    'InflowConverted',
    'OutflowConverted',
    'InflowNative',
    'OutflowNative',
    'RunningBalanceConverted',
    'RunningBalanceNative',
  ],
  transaction_splits: ['InflowConverted', 'OutflowConverted', 'InflowNative', 'OutflowNative'],
  assignments: ['Amount'],
  goals: ['Target'],
  recurring_transactions: ['Amount'],
  warranties: ['Amount'],
};

/** Flat (table, column) pairs. */
export const MONEY_COLUMNS: readonly (readonly [string, string])[] = Object.entries(
  MONEY_COLUMNS_BY_TABLE
).flatMap(([table, cols]) => cols.map((c) => [table, c] as const));
