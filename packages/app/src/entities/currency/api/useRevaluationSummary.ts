import { useSpaceQuery } from '@shared/api/useSpaceQuery';

export interface RevaluationSummary {
  total: number;
  last30Days: number;
  lastDate: string | null;
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
