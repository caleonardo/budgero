export interface ImportProgress {
  step: string;
  progress: number;
  currentItem: string;
  isComplete: boolean;
  error?: string;
}

export interface YNABImportConfig {
  spaceId: string;
  budgetName: string;
  currency: string;
  numberFormat: string;
  badgeIcon: string;
}

export interface YNABImportCategorySummary {
  categoryGroup: string;
  category: string;
  transactionCount: number;
}

export interface YNABSplitTransactionSummary {
  account: string;
  date: string;
  payees: string[];
  partCount: number;
}

export interface YNABImportPreview {
  registerRowCount: number;
  accountCount: number;
  categoryCount: number;
  missingCategories: YNABImportCategorySummary[];
  splitTransactions: YNABSplitTransactionSummary[];
}

export interface YNABImportSummary {
  registerRowsImported: number;
  transactionsCreated: number;
  missingCategoriesCreated: YNABImportCategorySummary[];
  splitTransactionsImported: number;
  /** Present for API imports after every imported account balance has matched YNAB. */
  accountBalancesVerified?: number;
}

export interface YNABImportResult {
  budgetId: number;
  summary: YNABImportSummary;
}

export interface YNABApiCurrencyFormat {
  iso_code: string;
  example_format: string;
  decimal_digits: number;
  decimal_separator: string;
  symbol_first: boolean;
  group_separator: string;
  currency_symbol: string;
  display_symbol: boolean;
}

export interface YNABApiPlanSummary {
  id: string;
  name: string;
  last_modified_on: string;
  first_month: string;
  last_month: string;
  currency_format: YNABApiCurrencyFormat;
}

export interface YNABApiAccount {
  id: string;
  name: string;
  type: string;
  on_budget: boolean;
  closed: boolean;
  deleted: boolean;
  balance: number;
  transfer_payee_id: string;
  note?: string | null;
}

export interface YNABApiCategoryGroup {
  id: string;
  name: string;
  hidden: boolean;
  deleted: boolean;
  internal: boolean;
}

export interface YNABApiCategory {
  id: string;
  category_group_id: string;
  name: string;
  hidden: boolean;
  deleted: boolean;
  internal: boolean;
  note?: string | null;
  budgeted: number;
  activity: number;
  balance: number;
  goal_type?: string | null;
  goal_target?: number | null;
  goal_target_month?: string | null;
  goal_cadence?: number | null;
  goal_cadence_frequency?: number | null;
  goal_creation_month?: string | null;
  goal_needs_whole_amount?: boolean | null;
}

export interface YNABApiMonth {
  month: string;
  deleted: boolean;
  budgeted: number;
  activity: number;
  income: number;
  to_be_budgeted: number;
  categories: YNABApiCategory[];
}

export interface YNABApiPayee {
  id: string;
  name: string;
  transfer_account_id: string | null;
  deleted: boolean;
}

export interface YNABApiTransaction {
  id: string;
  account_id: string;
  date: string;
  amount: number;
  memo: string | null;
  cleared: string;
  approved: boolean;
  payee_id: string | null;
  category_id: string | null;
  transfer_account_id: string | null;
  transfer_transaction_id: string | null;
  deleted: boolean;
}

export interface YNABApiSubtransaction {
  id: string;
  transaction_id: string;
  amount: number;
  memo: string | null;
  payee_id: string | null;
  category_id: string | null;
  transfer_account_id: string | null;
  deleted: boolean;
}

export interface YNABApiPlan extends YNABApiPlanSummary {
  accounts: YNABApiAccount[];
  category_groups: YNABApiCategoryGroup[];
  categories: YNABApiCategory[];
  months: YNABApiMonth[];
  payees: YNABApiPayee[];
  transactions: YNABApiTransaction[];
  subtransactions: YNABApiSubtransaction[];
}

export interface YNABApiPlanSnapshot {
  plan: YNABApiPlan;
  serverKnowledge: number;
}

export interface YNABImportAccountSpec {
  name: string;
  type: string;
  onBudget: boolean;
  archived: boolean;
  ynabAccountId: string;
  /** Authoritative native balance supplied by the YNAB API. */
  expectedBalance?: number;
}

export interface YNABRegisterRow {
  Account: string;
  Flag: string;
  Date: string;
  Payee: string;
  CategoryPath: string;
  CategoryGroup: string;
  Category: string;
  Memo: string;
  Outflow: string;
  Inflow: string;
  Cleared: string;
  /** Stable transfer relationship supplied by the YNAB API import path. */
  TransferID?: string;
}

export interface YNABBudgetRow {
  Month: string;
  CategoryPath: string;
  CategoryGroup: string;
  Category: string;
  Assigned: string;
  Activity: string;
  Available: string;
}

// CSV/PDF Import Types
export interface ImportSource {
  type: 'csv' | 'pdf' | 'ofx' | 'qif' | 'camt';
  file: File;
  fileName: string;
}

export type ParsedRow = Record<string, string>;

export interface ParsedData {
  headers: string[];
  rows: ParsedRow[];
  source: ImportSource;
}

export interface ColumnMapping {
  date?: string;
  amount?: string;
  inflow?: string;
  outflow?: string;
  description?: string;
  memo?: string;
  payee?: string;
  account?: string;
  category?: string;
  [key: string]: string | undefined;
}

export interface ImportTemplate {
  id: string;
  name: string;
  description?: string;
  columnMapping: ColumnMapping;
  numberFormat: string;
  dateFormat: string;
  skipRows?: number;
  createdAt: string;
  updatedAt: string;
}

export type ImportSourceType = 'csv' | 'pdf' | 'ofx' | 'qif' | 'camt';

export interface ImportRunSummary {
  transactionsImported: number;
  accountsCreated: number;
  categoriesCreated: number;
}

export interface ImportRunRecordInput {
  budgetId: number;
  sourceType: ImportSourceType;
  sourceName: string;
  summary: ImportRunSummary;
  transactionIds: number[];
  accountIds: number[];
  categoryIds: number[];
}

export interface ImportRun {
  id: number;
  budgetId: number;
  sourceType: ImportSourceType | string;
  sourceName: string;
  summary: ImportRunSummary;
  transactionIds: number[];
  accountIds: number[];
  categoryIds: number[];
  status: 'completed' | 'undone';
  createdAt: string;
}

export interface ImportRunUndoResult {
  runId: number;
  transactionsRemoved: number;
  accountsRemoved: number;
  categoriesRemoved: number;
  alreadyUndone: boolean;
}
