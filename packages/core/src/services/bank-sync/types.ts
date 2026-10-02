import type { ImportIdentity } from '../import/duplicate-planner.js';

/** SimpleFIN protocol payloads — https://www.simplefin.org/protocol.html */
export interface SimpleFINOrganization {
  domain?: string;
  'sfin-url': string;
  name?: string;
  url?: string;
  id?: string;
}

export interface SimpleFINTransaction {
  id: string;
  /** Unix seconds; 0 while pending. */
  posted: number;
  amount: string;
  description: string;
  payee?: string;
  memo?: string;
  transacted_at?: number;
  pending?: boolean;
}

export interface SimpleFINAccount {
  org: SimpleFINOrganization;
  id: string;
  name: string;
  currency: string;
  balance: string;
  'available-balance'?: string;
  'balance-date': number;
  transactions?: SimpleFINTransaction[];
}

export interface SimpleFINAccountSet {
  errors: string[];
  accounts: SimpleFINAccount[];
}

export type BankProvider = 'simplefin';

export interface BankConnection {
  ID: number;
  BudgetID: number;
  Provider: BankProvider;
  AccessURL: string;
  LastSyncAt: string | null;
  LastError: string | null;
  CreatedAt: string;
}

export interface BankLink {
  ID: number;
  BudgetID: number;
  AccountID: number;
  ExternalAccountID: string;
  ExternalName: string;
  OrgName: string;
  /** YYYY-MM-DD; bank rows dated earlier are never imported. */
  ImportFrom: string;
  LastSyncAt: string | null;
  LastBalance: number | null;
  LastBalanceDate: string | null;
}

export interface BankLinkInput {
  budgetId: number;
  accountId: number;
  externalAccountId: string;
  externalName: string;
  orgName: string;
  importFrom: string;
}

export interface BankSyncRecordInput {
  budgetId: number;
  at: string;
  error: string | null;
  links: { accountId: number; balance: number; balanceDate: string }[];
}

export type BankReviewStatus = 'pending' | 'resolved' | 'dismissed';

export interface BankReviewInput {
  budgetId: number;
  accountId: number;
  identity: ImportIdentity;
  candidateTransactionId: number | null;
}

export interface BankReview {
  ID: number;
  BudgetID: number;
  AccountID: number;
  OperationID: string;
  identity: ImportIdentity;
  candidate: {
    id: number;
    date: string;
    inflow: number;
    outflow: number;
    payee: string;
    memo: string;
  } | null;
  CreatedAt: string;
}

export interface BankImportPlanInput {
  budgetId: number;
  accountId: number;
  currency: string;
  link: Pick<BankLink, 'ExternalAccountID' | 'ImportFrom'>;
  transactions: SimpleFINTransaction[];
  /** True when this bank row was imported before, even if the ledger copy was deleted since. */
  wasImported: (identity: ImportIdentity) => boolean;
}

export interface BankImportPlan {
  imports: ImportIdentity[];
  reviews: BankReviewInput[];
  /** Rows the bank re-issued under a new ID: attach the new identity instead of importing. */
  rekeys: { identity: ImportIdentity; transactionId: number }[];
  skipped: number;
}
