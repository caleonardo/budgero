import type { DatabaseAdapter } from '../../database/interface.js';
import { ImportDuplicateService, type DuplicateInput } from '../import/duplicate-planner.js';
import { fromDecimalString, subMilli, ZERO_MILLI, type MilliUnits } from '../../money/index.js';
import { getLocalDateString } from '../../utils/date.js';
import { BankSyncQueries } from './queries.js';
import type {
  BankConnection,
  BankImportPlan,
  BankImportPlanInput,
  BankLink,
  BankLinkInput,
  BankReview,
  BankReviewInput,
  BankReviewStatus,
  BankSyncRecordInput,
  SimpleFINTransaction,
} from './types.js';

export * from './types.js';

const MANUAL_MATCH_DAYS = 5;
const REISSUE_DAYS = 3;

export function bankOperationId(
  budgetId: number,
  accountId: number,
  externalAccountId: string,
  transactionId: string
): string {
  return JSON.stringify(['simplefin-v1', budgetId, accountId, externalAccountId, transactionId]);
}

export function simpleFINDate(transaction: SimpleFINTransaction): string {
  return getLocalDateString(new Date((transaction.transacted_at || transaction.posted) * 1000));
}

export function isPostedSimpleFINTransaction(transaction: SimpleFINTransaction): boolean {
  return !transaction.pending && transaction.posted > 0;
}

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return getLocalDateString(new Date(y, m - 1, d + days));
}

export class BankSyncService {
  private queries: BankSyncQueries;

  constructor(private db: DatabaseAdapter) {
    this.queries = new BankSyncQueries(db);
  }

  getConnection(budgetId: number): BankConnection | null {
    return this.queries.getConnection(budgetId);
  }

  saveConnection(budgetId: number, accessUrl: string): BankConnection {
    this.queries.upsertConnection(budgetId, accessUrl);
    return this.queries.getConnection(budgetId)!;
  }

  deleteConnection(budgetId: number): void {
    this.queries.deleteConnection(budgetId);
  }

  listLinks(budgetId: number): BankLink[] {
    return this.queries.listLinks(budgetId);
  }

  saveLink(input: BankLinkInput): void {
    this.queries.upsertLink(input);
  }

  deleteLink(accountId: number): void {
    this.queries.deleteLink(accountId);
  }

  latestTransactionDate(accountId: number): string | null {
    return this.queries.latestTransactionDate(accountId, getLocalDateString());
  }

  recordSync(input: BankSyncRecordInput): void {
    this.queries.recordSync(input);
  }

  listPendingReviews(budgetId: number, accountId?: number): BankReview[] {
    return this.queries.listPendingReviews(budgetId, accountId);
  }

  addReviews(reviews: BankReviewInput[]): void {
    this.queries.addReviews(reviews);
  }

  setReviewStatus(id: number, status: BankReviewStatus): void {
    this.queries.setReviewStatus(id, status);
  }

  planImport(input: BankImportPlanInput): BankImportPlan {
    const { budgetId, accountId, currency, link } = input;
    const reviewed = this.queries.reviewedOperationIds(budgetId, accountId);
    let skipped = 0;
    const rows: DuplicateInput[] = [];
    for (const transaction of input.transactions) {
      const date = simpleFINDate(transaction);
      if (!isPostedSimpleFINTransaction(transaction) || date < link.ImportFrom) continue;
      const amount: MilliUnits = fromDecimalString(transaction.amount.replace(/^\+/, ''));
      if (amount === 0) continue;
      const sourceKey = JSON.stringify(['simplefin-v1', link.ExternalAccountID, transaction.id]);
      const description = transaction.description?.trim() ?? '';
      const payee = transaction.payee?.trim() || description;
      const row: DuplicateInput = {
        index: rows.length,
        valid: true,
        budgetId,
        accountId,
        currency,
        operationId: bankOperationId(budgetId, accountId, link.ExternalAccountID, transaction.id),
        fileRowKey: sourceKey,
        sourceKey,
        date,
        inflow: amount > 0 ? amount : ZERO_MILLI,
        outflow: amount < 0 ? subMilli(ZERO_MILLI, amount) : ZERO_MILLI,
        payee,
        memo: transaction.memo?.trim() || (payee === description ? '' : description),
      };
      if (reviewed.has(row.operationId) || input.wasImported(row)) skipped++;
      else rows.push({ ...row, index: rows.length });
    }

    const fetchedKeys = new Set(
      input.transactions.map((tx) =>
        JSON.stringify(['simplefin-v1', link.ExternalAccountID, tx.id])
      )
    );
    const sourcePrefix = `${JSON.stringify(['simplefin-v1', link.ExternalAccountID]).slice(0, -1)},`;
    const fetchedFrom = input.transactions.map(simpleFINDate).sort()[0] ?? '';
    const orphans = this.queries
      .bankImportedRows(budgetId, accountId, sourcePrefix)
      .filter(
        (row) => !fetchedKeys.has(row.identity.sourceKey ?? '') && row.identity.date >= fetchedFrom
      );
    const rekeys: BankImportPlan['rekeys'] = [];
    const normalized = (s: string) => s.trim().toLowerCase();

    const plans = new ImportDuplicateService(this.db).plan(rows);
    const claimed = this.queries.pendingCandidateIds(budgetId, accountId);
    const imports: BankImportPlan['imports'] = [];
    const reviews: BankReviewInput[] = [];
    for (const [i, plan] of plans.entries()) {
      const { index: _index, valid: _valid, budgetId: _b, accountId: _a, ...identity } = rows[i];
      const review = (candidateTransactionId: number) => {
        claimed.add(candidateTransactionId);
        reviews.push({ budgetId, accountId, identity, candidateTransactionId });
      };
      if (plan.status === 'already-imported') {
        skipped++;
        continue;
      }
      // Same-date/amount hints are for files; bank rows carry real IDs, so only a reused ID needs review.
      const reusedId = plan.status === 'needs-review' && plan.reason.startsWith('Repeated bank');
      if (reusedId && plan.candidates[0]) {
        review(plan.candidates[0].id);
        continue;
      }
      const reissued = orphans.findIndex(
        (row) =>
          row.identity.date >= shiftDate(identity.date, -REISSUE_DAYS) &&
          row.identity.date <= shiftDate(identity.date, REISSUE_DAYS) &&
          row.identity.inflow === identity.inflow &&
          row.identity.outflow === identity.outflow &&
          normalized(row.identity.payee) === normalized(identity.payee)
      );
      if (reissued >= 0) {
        rekeys.push({ identity, transactionId: orphans[reissued].transactionId });
        orphans.splice(reissued, 1);
        continue;
      }
      const manual = this.queries
        .findManualMatches(
          budgetId,
          accountId,
          identity.inflow,
          identity.outflow,
          shiftDate(identity.date, -MANUAL_MATCH_DAYS),
          shiftDate(identity.date, MANUAL_MATCH_DAYS)
        )
        .find((match) => !claimed.has(match.id));
      if (manual) review(manual.id);
      else imports.push(identity);
    }
    return { imports, reviews, rekeys, skipped };
  }
}
