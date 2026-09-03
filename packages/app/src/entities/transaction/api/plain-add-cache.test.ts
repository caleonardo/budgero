import { describe, expect, it } from 'vitest';
import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  asMilli,
  type Account,
  type AccountTransactionCursor,
  type AccountTransactionPage,
  type GetTransactionsByAccountRow,
} from '@budgero/core/browser';
import { patchPlainAddTransactionCaches } from './plain-add-cache';

function row(
  ID: number,
  Date: string,
  runningBalance: number,
  amount = 100
): GetTransactionsByAccountRow {
  return {
    ID,
    Date,
    AccountID: 7,
    Account: 'Checking',
    CategoryID: 1,
    Category: 'Groceries',
    Memo: '',
    Reconciled: false,
    InflowConverted: asMilli(amount),
    OutflowConverted: asMilli(0),
    InflowNative: asMilli(amount),
    OutflowNative: asMilli(0),
    RunningBalanceConverted: asMilli(runningBalance),
    RunningBalanceNative: asMilli(runningBalance),
  };
}

describe('patchPlainAddTransactionCaches', () => {
  it('inserts the final row and adjusts later cached balances without refetching', () => {
    const queryClient = new QueryClient();
    const pageKey = ['accountTransactionPages', 'space-1', 7, '2025-01-01', '2025-01-31', 2];
    const historyKey = ['accountBalanceHistory', 'space-1', 7, '2025-01-01', '2025-01-31'];
    const summaryKey = ['accountTransactionSummary', 'space-1', 7, '2025-01-01', '2025-01-31'];
    const accountKey = ['accounts', 'space-1', 3];
    const existingRows = [row(3, '2025-01-03', 300), row(1, '2025-01-01', 100)];
    const pageData: InfiniteData<AccountTransactionPage, AccountTransactionCursor | null> = {
      pages: [{ rows: existingRows, nextCursor: null }],
      pageParams: [null],
    };
    const accounts: Account[] = [
      {
        ID: 7,
        Name: 'Checking',
        Currency: 'USD',
        Type: 'Checking',
        BalanceNative: asMilli(300),
        BalanceConverted: asMilli(300),
        FutureImpactNative: asMilli(0),
        FutureImpactConverted: asMilli(0),
        BudgetID: 3,
        OnBudget: true,
      },
    ];
    queryClient.setQueryData(pageKey, pageData);
    queryClient.setQueryData(historyKey, [
      { Date: '0001-01-01', InflowConverted: asMilli(50), OutflowConverted: asMilli(0) },
      { Date: '2025-01-03', InflowConverted: asMilli(100), OutflowConverted: asMilli(0) },
    ]);
    queryClient.setQueryData(accountKey, accounts);
    queryClient.setQueryData(summaryKey, {
      TransactionCount: 2,
      TransferTransactionCount: 0,
      UncategorizedCount: 0,
      UnsafeTransactionCount: 0,
      TotalInflowConverted: asMilli(200),
      TotalOutflowConverted: asMilli(0),
      TotalInflowNative: asMilli(200),
      TotalOutflowNative: asMilli(0),
    });

    patchPlainAddTransactionCaches(
      queryClient,
      'space-1',
      3,
      row(2, '2025-01-02', 200, 50),
      '2025-01-10'
    );

    const patched = queryClient.getQueryData<typeof pageData>(pageKey);
    expect(
      patched?.pages.flatMap((page) => page.rows).map((transaction) => transaction.ID)
    ).toEqual([3, 2, 1]);
    expect(patched?.pages[0].rows[0].RunningBalanceConverted).toBe(350);
    expect(queryClient.getQueryData<Account[]>(accountKey)?.[0].BalanceNative).toBe(350);
    expect(
      queryClient
        .getQueryData<{ Date: string }[]>(historyKey)
        ?.map((transaction) => transaction.Date)
    ).toEqual(['0001-01-01', '2025-01-02', '2025-01-03']);
    expect(
      queryClient.getQueryData<{ TransactionCount: number }>(summaryKey)?.TransactionCount
    ).toBe(3);
  });

  it('updates visible running balances when a backdated row falls before the cached range', () => {
    const queryClient = new QueryClient();
    const rangeKey = ['accountTransactionRange', 'space-1', 7, '2025-01-01', '2025-01-31'];
    queryClient.setQueryData(rangeKey, [row(3, '2025-01-03', 300)]);

    patchPlainAddTransactionCaches(
      queryClient,
      'space-1',
      3,
      row(2, '2024-12-31', 50, 25),
      '2025-01-10'
    );

    const patched = queryClient.getQueryData<GetTransactionsByAccountRow[]>(rangeKey);
    expect(patched?.map((transaction) => transaction.ID)).toEqual([3]);
    expect(patched?.[0].RunningBalanceConverted).toBe(325);
  });
});
