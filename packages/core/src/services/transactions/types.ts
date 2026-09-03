/**
 * Transactions service type definitions
 * These types use PascalCase for API consistency
 */

import type { MilliUnits } from '../../money/index.js';

/**
 * Transaction type - represents a financial transaction
 */
export interface Transaction {
  ID: number;
  CategoryID: number;
  AccountID: number;
  LabelID?: number | null;
  TransferID?: string;
  Date: string;
  Month: string;
  Memo: string;
  Reconciled: boolean;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  InflowNative?: MilliUnits;
  OutflowNative?: MilliUnits;
  ExchangeRate?: number | null;
  ExchangeRateOverride?: boolean;
  AccountOnBudget?: boolean;
  TransferAccountOnBudget?: boolean | null;
  RunningBalanceConverted: MilliUnits;
  RunningBalanceNative?: MilliUnits;
  BudgetID: number;
  // Additional fields from Wails version
  Amount?: MilliUnits;
  Cleared?: string;
  Payee?: string;
  TransferAccountID?: string;
  Label?: string | null;
  LabelColor?: string | null;
  AccountName?: string;
  CategoryName?: string;
  Subtransactions?: TransactionSplit[];
}

/**
 * Transaction view types for different queries
 */
export interface GetTransactionsByAccountRow {
  ID: number;
  Date: string;
  CategoryID: number;
  Category: string;
  LabelID?: number | null;
  Label?: string | null;
  LabelColor?: string | null;
  Memo: string;
  Reconciled: boolean;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  InflowNative?: MilliUnits;
  OutflowNative?: MilliUnits;
  ExchangeRate?: number | null;
  ExchangeRateOverride?: boolean;
  AccountOnBudget?: boolean;
  TransferAccountOnBudget?: boolean | null;
  RunningBalanceConverted: MilliUnits | null;
  RunningBalanceNative?: MilliUnits | null;
  TransferID?: string;
  /** Only populated by budget-wide queries (getAllTransactionsDetailed) */
  AccountID?: number;
  Account?: string;
  Payee?: string;
  /** True for scheduled recurring occurrences shown as non-editable projected rows */
  IsProjected?: boolean;
  /** True when the running balance includes projected rows and is an estimate */
  RunningBalanceProjected?: boolean;
}

/** Stable keyset used to continue an account register ordered by Date/ID descending. */
export interface AccountTransactionCursor {
  Date: string;
  ID: number;
}

export interface AccountTransactionPageOptions {
  limit?: number;
  cursor?: AccountTransactionCursor | null;
  fromDate?: string;
  toDate?: string;
}

export interface AccountTransactionPage {
  rows: GetTransactionsByAccountRow[];
  nextCursor: AccountTransactionCursor | null;
}

/** Aggregate values needed by the account register without materializing every row. */
export interface AccountTransactionSummary {
  TransactionCount: number;
  TransferTransactionCount: number;
  UncategorizedCount: number;
  UnsafeTransactionCount: number;
  TotalInflowConverted: MilliUnits;
  TotalOutflowConverted: MilliUnits;
  TotalInflowNative: MilliUnits;
  TotalOutflowNative: MilliUnits;
}

export interface AccountBalanceHistoryTransaction {
  Date: string;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
}

export interface GetTransactionsByAccountAndMonthRow {
  ID: number;
  Date: string;
  CategoryID?: number;
  Category: string;
  LabelID?: number | null;
  Label?: string | null;
  LabelColor?: string | null;
  Memo: string;
  Reconciled: boolean;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  InflowNative?: MilliUnits;
  OutflowNative?: MilliUnits;
  ExchangeRate?: number | null;
  ExchangeRateOverride?: boolean;
  AccountOnBudget?: boolean;
  TransferAccountOnBudget?: boolean | null;
  RunningBalanceConverted: MilliUnits | null;
  RunningBalanceNative?: MilliUnits | null;
  TransferID?: string;
  Account?: string;
  Payee?: string;
}

export interface GetAllTransactions {
  ID: number;
  AccountId: number;
  AccountName: string;
  Date: string;
  CategoryID: number;
  Category: string;
  LabelID?: number | null;
  Label?: string | null;
  LabelColor?: string | null;
  Memo: string;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  RunningBalanceConverted: MilliUnits;
  TransferID?: string;
  Payee?: string;
}

export interface GetTransactionsByCategoryAndMonthRow {
  ID: number;
  Date: string;
  Memo: string;
  LabelID?: number | null;
  Label?: string | null;
  LabelColor?: string | null;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  RunningBalanceConverted: MilliUnits | null;
  AccountID: number;
  Account: string;
  Category: string;
  CategoryID: number | null;
  Payee?: string;
  ExchangeRate?: number | null;
  ExchangeRateOverride?: boolean;
}

/**
 * TransactionSplit type - represents a split transaction line
 * Updated to use PascalCase to match database schema
 */
export interface TransactionSplit {
  ID: number;
  TransactionID: number;
  CategoryID?: number | null;
  TransferAccountID?: number | null;
  Memo: string;
  /** Empty means inherit the parent transaction payee. */
  Payee?: string;
  InflowConverted: MilliUnits;
  OutflowConverted: MilliUnits;
  InflowNative?: MilliUnits | null;
  OutflowNative?: MilliUnits | null;
  PairID?: string | null;
  OrderIndex: number;
  CategoryName?: string;
  TransferAccountName?: string;
}

export interface PayeeListItem {
  Name: string;
  UsageCount: number;
  Source: 'saved' | 'transaction' | 'both';
}

/** The category a payee was last filed under, with the date it came from. */
export interface PayeeCategoryMemory {
  CategoryID: number;
  CategoryName: string;
  Date: string;
}

export interface LabelListItem {
  ID: number;
  Name: string;
  Color: string;
  UsageCount: number;
}
