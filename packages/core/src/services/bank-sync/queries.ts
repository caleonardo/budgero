import type { DatabaseAdapter } from '../../database/interface.js';
import { allRows, getRow, run } from '../../database/sql.js';
import type { ImportIdentity } from '../import/duplicate-planner.js';
import type {
  BankConnection,
  BankLink,
  BankLinkInput,
  BankReview,
  BankReviewInput,
  BankReviewStatus,
  BankSyncRecordInput,
} from './types.js';

interface BankReviewRow {
  ID: number;
  BudgetID: number;
  AccountID: number;
  OperationID: string;
  IdentityJSON: string;
  CreatedAt: string;
  CandidateID: number | null;
  CandidateDate: string | null;
  CandidateInflow: number | null;
  CandidateOutflow: number | null;
  CandidatePayee: string | null;
  CandidateMemo: string | null;
}

export class BankSyncQueries {
  constructor(private db: DatabaseAdapter) {}

  getConnection(budgetId: number): BankConnection | null {
    return (
      getRow<BankConnection>(
        this.db,
        'SELECT * FROM bank_connections WHERE BudgetID = ?',
        budgetId
      ) ?? null
    );
  }

  upsertConnection(budgetId: number, accessUrl: string): void {
    run(
      this.db,
      `INSERT INTO bank_connections (BudgetID, Provider, AccessURL) VALUES (?, 'simplefin', ?)
      ON CONFLICT(BudgetID) DO UPDATE SET AccessURL = excluded.AccessURL, LastError = NULL`,
      budgetId,
      accessUrl
    );
  }

  deleteConnection(budgetId: number): void {
    run(this.db, 'DELETE FROM bank_reviews WHERE BudgetID = ?', budgetId);
    run(this.db, 'DELETE FROM bank_links WHERE BudgetID = ?', budgetId);
    run(this.db, 'DELETE FROM bank_connections WHERE BudgetID = ?', budgetId);
  }

  listLinks(budgetId: number): BankLink[] {
    return allRows<BankLink>(
      this.db,
      'SELECT * FROM bank_links WHERE BudgetID = ? ORDER BY ID',
      budgetId
    );
  }

  upsertLink(input: BankLinkInput): void {
    run(
      this.db,
      'DELETE FROM bank_links WHERE BudgetID = ? AND ExternalAccountID = ? AND AccountID <> ?',
      input.budgetId,
      input.externalAccountId,
      input.accountId
    );
    run(
      this.db,
      `INSERT INTO bank_links (BudgetID, AccountID, ExternalAccountID, ExternalName, OrgName, ImportFrom)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(AccountID) DO UPDATE SET
        ExternalAccountID = excluded.ExternalAccountID,
        ExternalName = excluded.ExternalName,
        OrgName = excluded.OrgName,
        ImportFrom = excluded.ImportFrom,
        LastSyncAt = NULL,
        LastBalance = NULL,
        LastBalanceDate = NULL`,
      input.budgetId,
      input.accountId,
      input.externalAccountId,
      input.externalName,
      input.orgName,
      input.importFrom
    );
  }

  deleteLink(accountId: number): void {
    run(this.db, "DELETE FROM bank_reviews WHERE AccountID = ? AND Status = 'pending'", accountId);
    run(this.db, 'DELETE FROM bank_links WHERE AccountID = ?', accountId);
  }

  recordSync(input: BankSyncRecordInput): void {
    run(
      this.db,
      'UPDATE bank_connections SET LastSyncAt = ?, LastError = ? WHERE BudgetID = ?',
      input.at,
      input.error,
      input.budgetId
    );
    for (const link of input.links) {
      run(
        this.db,
        `UPDATE bank_links SET LastSyncAt = ?, LastBalance = ?, LastBalanceDate = ?
        WHERE BudgetID = ? AND AccountID = ?`,
        input.at,
        link.balance,
        link.balanceDate,
        input.budgetId,
        link.accountId
      );
    }
  }

  reviewedOperationIds(budgetId: number, accountId: number): Set<string> {
    return new Set(
      allRows<{ OperationID: string }>(
        this.db,
        'SELECT OperationID FROM bank_reviews WHERE BudgetID = ? AND AccountID = ?',
        budgetId,
        accountId
      ).map((row) => row.OperationID)
    );
  }

  pendingCandidateIds(budgetId: number, accountId: number): Set<number> {
    return new Set(
      allRows<{ CandidateTransactionID: number }>(
        this.db,
        `SELECT CandidateTransactionID FROM bank_reviews
        WHERE BudgetID = ? AND AccountID = ? AND Status = 'pending' AND CandidateTransactionID IS NOT NULL`,
        budgetId,
        accountId
      ).map((row) => row.CandidateTransactionID)
    );
  }

  addReviews(reviews: BankReviewInput[]): void {
    for (const review of reviews) {
      run(
        this.db,
        `INSERT INTO bank_reviews (BudgetID, AccountID, OperationID, IdentityJSON, CandidateTransactionID)
        VALUES (?, ?, ?, ?, ?) ON CONFLICT(OperationID) DO NOTHING`,
        review.budgetId,
        review.accountId,
        review.identity.operationId,
        JSON.stringify(review.identity),
        review.candidateTransactionId
      );
    }
  }

  setReviewStatus(id: number, status: BankReviewStatus): void {
    run(this.db, 'UPDATE bank_reviews SET Status = ? WHERE ID = ?', status, id);
  }

  listPendingReviews(budgetId: number, accountId?: number): BankReview[] {
    const rows = allRows<BankReviewRow>(
      this.db,
      `SELECT r.ID, r.BudgetID, r.AccountID, r.OperationID, r.IdentityJSON, r.CreatedAt,
        t.ID as CandidateID, t.Date as CandidateDate, t.InflowNative as CandidateInflow,
        t.OutflowNative as CandidateOutflow, COALESCE(t.Payee, '') as CandidatePayee,
        COALESCE(t.Memo, '') as CandidateMemo
      FROM bank_reviews r LEFT JOIN transactions t ON t.ID = r.CandidateTransactionID
      WHERE r.BudgetID = ? AND r.Status = 'pending' AND (? IS NULL OR r.AccountID = ?)
      ORDER BY r.AccountID, r.ID`,
      budgetId,
      accountId ?? null,
      accountId ?? null
    );
    return rows.map((row) => ({
      ID: row.ID,
      BudgetID: row.BudgetID,
      AccountID: row.AccountID,
      OperationID: row.OperationID,
      identity: JSON.parse(row.IdentityJSON) as ImportIdentity,
      candidate:
        row.CandidateID === null
          ? null
          : {
              id: row.CandidateID,
              date: row.CandidateDate ?? '',
              inflow: row.CandidateInflow ?? 0,
              outflow: row.CandidateOutflow ?? 0,
              payee: row.CandidatePayee ?? '',
              memo: row.CandidateMemo ?? '',
            },
      CreatedAt: row.CreatedAt,
    }));
  }

  latestTransactionDate(accountId: number, today: string): string | null {
    return (
      getRow<{ Latest: string | null }>(
        this.db,
        'SELECT MAX(Date) as Latest FROM transactions WHERE AccountID = ? AND Date <= ?',
        accountId,
        today
      )?.Latest ?? null
    );
  }

  bankImportedRows(
    budgetId: number,
    accountId: number,
    sourcePrefix: string
  ): { transactionId: number; identity: ImportIdentity }[] {
    return allRows<{ TransactionID: number; IdentityJSON: string }>(
      this.db,
      `SELECT p.TransactionID, p.IdentityJSON FROM import_provenance p
      JOIN transactions t ON t.ID = p.TransactionID
      WHERE p.BudgetID = ? AND t.AccountID = ? AND substr(p.SourceKey, 1, length(?)) = ?`,
      budgetId,
      accountId,
      sourcePrefix,
      sourcePrefix
    ).map((row) => ({
      transactionId: row.TransactionID,
      identity: JSON.parse(row.IdentityJSON) as ImportIdentity,
    }));
  }

  /** Manually entered rows (no import provenance) that a bank row could be the cleared copy of. */
  findManualMatches(
    budgetId: number,
    accountId: number,
    inflow: number,
    outflow: number,
    from: string,
    to: string
  ): { id: number; date: string }[] {
    return allRows<{ id: number; date: string }>(
      this.db,
      `SELECT t.ID as id, t.Date as date FROM transactions t
      WHERE t.BudgetID = ? AND t.AccountID = ? AND t.InflowNative = ? AND t.OutflowNative = ?
        AND t.Date BETWEEN ? AND ? AND t.Reconciled = 0
        AND NOT EXISTS (SELECT 1 FROM import_provenance p WHERE p.TransactionID = t.ID)
      ORDER BY t.Date, t.ID`,
      budgetId,
      accountId,
      inflow,
      outflow,
      from,
      to
    );
  }
}
