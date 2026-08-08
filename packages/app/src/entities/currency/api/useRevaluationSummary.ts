import { useSpaceQuery } from '@shared/api/useSpaceQuery';

export interface RevaluationSummary {
  total: number;
  last30Days: number;
  lastDate: string | null;
}

export interface RevaluationHistoryRow {
  Date: string;
  OldRate: number | null;
  NewRate: number;
  DeltaConverted: number;
}

/**
 * Journaled rate true-up impact for a foreign-currency account: how much of
 * its converted balance comes from market moves rather than transactions.
 */
export function useRevaluationSummary(accountId: number) {
  return useSpaceQuery<RevaluationSummary>({
    key: ['revaluationSummary', accountId],
    enabled: Boolean(accountId),
    queryFn: (services) => services.currency.getRevaluationSummary(accountId),
  });
}

/** Daily revaluation rows for an account (last 90 days, oldest first). */
export function useRevaluationHistory(accountId: number) {
  return useSpaceQuery<RevaluationHistoryRow[]>({
    key: ['revaluationSummary', accountId, 'history'],
    enabled: Boolean(accountId),
    queryFn: (services) => services.currency.getRevaluationHistory(accountId),
  });
}

export interface BudgetRevaluationRow {
  AccountID: number;
  Date: string;
  DeltaConverted: number;
}

/** All revaluation rows for a budget (oldest first) — for history reconstruction. */
export function useBudgetRevaluations(budgetId: number) {
  return useSpaceQuery<BudgetRevaluationRow[]>({
    key: ['revaluationSummary', 'budgetRows', budgetId],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.currency.getBudgetRevaluations(budgetId),
  });
}

/** Total market-change delta included in Ready to Assign (on-budget accounts). */
export function useBudgetRevaluationTotal(budgetId: number | undefined) {
  return useSpaceQuery<number>({
    key: ['revaluationSummary', 'budgetTotal', budgetId ?? 0],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.currency.getBudgetRevaluationTotal(budgetId!),
  });
}
