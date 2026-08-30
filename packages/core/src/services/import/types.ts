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
}

export interface YNABImportResult {
  budgetId: number;
  summary: YNABImportSummary;
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
