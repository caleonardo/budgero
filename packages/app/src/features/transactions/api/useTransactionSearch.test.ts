import { describe, expect, it } from 'vitest';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import { parseSearchQuery } from '@shared/lib/search-query-parser';
import { filterTransactions } from './useTransactionSearch';

const row = (ID: number, extra: Partial<GetTransactionsByAccountRow>) =>
  ({
    ID,
    Date: '2026-09-01',
    Memo: '',
    Payee: '',
    Category: 'Food',
    CategoryID: 1,
    InflowConverted: 0,
    OutflowConverted: 1_000,
    RunningBalanceConverted: null,
    Reconciled: false,
    Cleared: false,
    ...extra,
  }) as GetTransactionsByAccountRow;

const rows = [
  row(1, {}),
  row(2, { Cleared: true }),
  row(3, { Cleared: true, Reconciled: true }),
  row(-4, { IsProjected: true, Cleared: undefined }),
];

const ids = (query: string) =>
  filterTransactions(
    rows,
    parseSearchQuery(query, [], []),
    false,
    (tx) => tx.InflowConverted,
    (tx) => tx.OutflowConverted
  ).map((tx) => tx.ID);

describe('filterTransactions cleared status', () => {
  it('treats reconciled rows as cleared and never matches projected rows', () => {
    expect(ids('uncleared')).toEqual([1]);
    expect(ids('cleared')).toEqual([2, 3]);
    expect(ids('reconciled')).toEqual([3]);
  });
});
