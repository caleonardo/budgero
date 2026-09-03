import { useMemo } from 'react';
import { computeDailyBalances } from '@entities/account/lib/history';
import { useSpaceQuery } from '@shared/api/useSpaceQuery';
import { formatDateISO } from '@shared/lib/date-utils';
import type { AccountBalanceHistoryTransaction } from '@budgero/core/browser';

export interface AccountBalancePoint {
  date: string;
  balance: number;
}

/**
 * Historical balance data for an account over a specified period, derived
 * from the account's transactions (running balance per day).
 *
 * The query returns only the requested window plus its opening balance; the
 * space-scoped cache is patched on plain adds and invalidated by other writes.
 */
export function useAccountBalanceHistory(accountId: number, periodMonths = 6) {
  const range = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - periodMonths);
    return { start, end, fromDate: formatDateISO(start), toDate: formatDateISO(end) };
  }, [periodMonths]);
  const { data: transactions, isLoading } = useSpaceQuery<AccountBalanceHistoryTransaction[]>({
    key: ['accountBalanceHistory', accountId, range.fromDate, range.toDate],
    enabled: Boolean(accountId),
    queryFn: (services) =>
      services.transactions.getAccountBalanceHistory(accountId, range.fromDate, range.toDate),
  });

  const data = useMemo<AccountBalancePoint[] | undefined>(() => {
    if (!accountId || !transactions) return undefined;

    return computeDailyBalances(transactions, range.start, range.end);
  }, [accountId, range, transactions]);

  return { data, isLoading };
}
