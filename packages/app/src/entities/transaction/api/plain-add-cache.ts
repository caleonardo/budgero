import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';
import {
  asMilli,
  type Account,
  type AccountBalanceHistoryTransaction,
  type AccountTransactionCursor,
  type AccountTransactionPage,
  type AccountTransactionSummary,
  type GetTransactionsByAccountRow,
} from '@budgero/core/browser';

function compareRegisterRows(
  left: GetTransactionsByAccountRow,
  right: GetTransactionsByAccountRow
): number {
  if (left.Date !== right.Date) return left.Date > right.Date ? -1 : 1;
  return right.ID - left.ID;
}

function isAfterInsertedRow(
  row: GetTransactionsByAccountRow,
  inserted: GetTransactionsByAccountRow
) {
  return row.Date > inserted.Date || (row.Date === inserted.Date && row.ID > inserted.ID);
}

function patchRunningBalance(
  row: GetTransactionsByAccountRow,
  inserted: GetTransactionsByAccountRow,
  convertedDelta: number,
  nativeDelta: number
): GetTransactionsByAccountRow {
  if (row.ID === inserted.ID || row.IsProjected || !isAfterInsertedRow(row, inserted)) return row;
  return {
    ...row,
    RunningBalanceConverted:
      row.RunningBalanceConverted == null
        ? row.RunningBalanceConverted
        : asMilli(row.RunningBalanceConverted + convertedDelta),
    RunningBalanceNative:
      row.RunningBalanceNative == null
        ? row.RunningBalanceNative
        : asMilli(row.RunningBalanceNative + nativeDelta),
  };
}

function patchRows(
  rows: GetTransactionsByAccountRow[],
  inserted: GetTransactionsByAccountRow,
  includeInserted: boolean
): GetTransactionsByAccountRow[] {
  const convertedDelta = inserted.InflowConverted - inserted.OutflowConverted;
  const nativeDelta =
    (inserted.InflowNative ?? inserted.InflowConverted) -
    (inserted.OutflowNative ?? inserted.OutflowConverted);
  const patched = rows.map((row) =>
    patchRunningBalance(row, inserted, convertedDelta, nativeDelta)
  );
  if (includeInserted && !patched.some((row) => row.ID === inserted.ID)) {
    let low = 0;
    let high = patched.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (compareRegisterRows(patched[middle], inserted) <= 0) low = middle + 1;
      else high = middle;
    }
    patched.splice(low, 0, inserted);
  }
  return patched;
}

function isRowInQueryRange(row: GetTransactionsByAccountRow, queryKey: QueryKey): boolean {
  const fromDate = typeof queryKey[3] === 'string' ? queryKey[3] : '';
  const toDate = typeof queryKey[4] === 'string' ? queryKey[4] : '';
  return (!fromDate || row.Date >= fromDate) && (!toDate || row.Date <= toDate);
}

function cursorFor(row: GetTransactionsByAccountRow | undefined): AccountTransactionCursor | null {
  return row ? { Date: row.Date, ID: row.ID } : null;
}

function patchInfinitePages(
  data: InfiniteData<AccountTransactionPage, AccountTransactionCursor | null>,
  inserted: GetTransactionsByAccountRow,
  includeInserted: boolean,
  pageSize: number
): InfiniteData<AccountTransactionPage, AccountTransactionCursor | null> {
  const originalRows = data.pages.flatMap((page) => page.rows);
  const hadMore = data.pages.at(-1)?.nextCursor != null;
  let rows = patchRows(originalRows, inserted, includeInserted);
  if (hadMore && rows.length > originalRows.length) rows = rows.slice(0, originalRows.length);

  const pages: AccountTransactionPage[] = [];
  for (let index = 0; index < rows.length; index += pageSize) {
    const pageRows = rows.slice(index, index + pageSize);
    const isLast = index + pageSize >= rows.length;
    pages.push({
      rows: pageRows,
      nextCursor: !isLast || hadMore ? cursorFor(pageRows.at(-1)) : null,
    });
  }
  if (pages.length === 0) pages.push({ rows: [], nextCursor: null });

  const pageParams = pages.map((_, index) => {
    if (index === 0) return null;
    return cursorFor(pages[index - 1].rows.at(-1));
  });
  return { pages, pageParams };
}

function patchBalanceHistory(
  rows: AccountBalanceHistoryTransaction[],
  inserted: GetTransactionsByAccountRow,
  queryKey: QueryKey
): AccountBalanceHistoryTransaction[] {
  const fromDate = String(queryKey[3] ?? '');
  const toDate = String(queryKey[4] ?? '');
  const convertedDelta = inserted.InflowConverted - inserted.OutflowConverted;
  if (inserted.Date < fromDate) {
    if (rows[0]?.Date === '0001-01-01') {
      return rows.map((row, index) =>
        index === 0
          ? { ...row, InflowConverted: asMilli(row.InflowConverted + convertedDelta) }
          : row
      );
    }
    return [
      {
        Date: '0001-01-01',
        InflowConverted: asMilli(convertedDelta),
        OutflowConverted: asMilli(0),
      },
      ...rows,
    ];
  }
  if (inserted.Date > toDate) return rows;
  const next = [
    ...rows,
    {
      Date: inserted.Date,
      InflowConverted: inserted.InflowConverted,
      OutflowConverted: inserted.OutflowConverted,
    },
  ];
  return next.sort((left, right) => left.Date.localeCompare(right.Date));
}

function patchTransactionSummary(
  summary: AccountTransactionSummary,
  inserted: GetTransactionsByAccountRow
): AccountTransactionSummary {
  const nativeInflow = inserted.InflowNative ?? inserted.InflowConverted;
  const nativeOutflow = inserted.OutflowNative ?? inserted.OutflowConverted;
  const isUncategorized =
    inserted.Category !== 'Split' &&
    (!inserted.CategoryID || !inserted.Category || inserted.Category === 'Uncategorized');
  const isUnsafe = [
    inserted.InflowConverted,
    inserted.OutflowConverted,
    inserted.InflowNative,
    inserted.OutflowNative,
    inserted.RunningBalanceConverted,
    inserted.RunningBalanceNative,
  ].some((value) => value != null && !Number.isSafeInteger(value));
  return {
    ...summary,
    TransactionCount: summary.TransactionCount + 1,
    TransferTransactionCount: summary.TransferTransactionCount + (inserted.TransferID ? 1 : 0),
    UncategorizedCount: summary.UncategorizedCount + (isUncategorized ? 1 : 0),
    UnsafeTransactionCount: summary.UnsafeTransactionCount + (isUnsafe ? 1 : 0),
    TotalInflowConverted: asMilli(summary.TotalInflowConverted + inserted.InflowConverted),
    TotalOutflowConverted: asMilli(summary.TotalOutflowConverted + inserted.OutflowConverted),
    TotalInflowNative: asMilli(summary.TotalInflowNative + nativeInflow),
    TotalOutflowNative: asMilli(summary.TotalOutflowNative + nativeOutflow),
  };
}

/**
 * Apply the authoritative post-rule row to account-register caches. This keeps
 * a plain add visible immediately and avoids refetching an 18k-row register.
 */
export function patchPlainAddTransactionCaches(
  queryClient: QueryClient,
  spaceKey: string,
  budgetId: number,
  row: GetTransactionsByAccountRow,
  today: string
): void {
  const accountId = row.AccountID;
  if (!accountId) return;

  queryClient.setQueriesData<GetTransactionsByAccountRow[]>(
    {
      predicate: (query) =>
        query.queryKey[0] === 'transactions' &&
        query.queryKey[1] === spaceKey &&
        query.queryKey[2] === accountId,
    },
    (previous) => (previous ? patchRows(previous, row, true) : previous)
  );

  const accountQueries = queryClient.getQueryCache().findAll({
    predicate: (query) => query.queryKey[1] === spaceKey && query.queryKey[2] === accountId,
  });
  for (const query of accountQueries) {
    if (query.queryKey[0] === 'accountTransactionRange') {
      queryClient.setQueryData<GetTransactionsByAccountRow[]>(query.queryKey, (previous) =>
        previous ? patchRows(previous, row, isRowInQueryRange(row, query.queryKey)) : previous
      );
    }
    if (query.queryKey[0] === 'accountTransactionPages') {
      queryClient.setQueryData<
        InfiniteData<AccountTransactionPage, AccountTransactionCursor | null>
      >(query.queryKey, (previous) => {
        if (!previous) return previous;
        const pageSize = Number(query.queryKey[5]) || 200;
        return patchInfinitePages(previous, row, isRowInQueryRange(row, query.queryKey), pageSize);
      });
    }
    if (query.queryKey[0] === 'accountBalanceHistory') {
      queryClient.setQueryData<AccountBalanceHistoryTransaction[]>(query.queryKey, (previous) =>
        previous ? patchBalanceHistory(previous, row, query.queryKey) : previous
      );
    }
    if (
      query.queryKey[0] === 'accountTransactionSummary' &&
      isRowInQueryRange(row, query.queryKey)
    ) {
      queryClient.setQueryData<AccountTransactionSummary>(query.queryKey, (previous) =>
        previous ? patchTransactionSummary(previous, row) : previous
      );
    }
  }

  const convertedDelta = row.InflowConverted - row.OutflowConverted;
  const nativeDelta =
    (row.InflowNative ?? row.InflowConverted) - (row.OutflowNative ?? row.OutflowConverted);
  queryClient.setQueriesData<Account[]>(
    {
      predicate: (query) =>
        query.queryKey[0] === 'accounts' &&
        query.queryKey[1] === spaceKey &&
        query.queryKey[2] === budgetId,
    },
    (previous) =>
      previous?.map((account) =>
        account.ID === accountId
          ? {
              ...account,
              BalanceNative: asMilli(account.BalanceNative + nativeDelta),
              BalanceConverted: asMilli(
                (account.BalanceConverted ?? account.BalanceNative) + convertedDelta
              ),
              FutureImpactNative:
                row.Date > today
                  ? asMilli((account.FutureImpactNative ?? 0) + nativeDelta)
                  : account.FutureImpactNative,
              FutureImpactConverted:
                row.Date > today
                  ? asMilli((account.FutureImpactConverted ?? 0) + convertedDelta)
                  : account.FutureImpactConverted,
            }
          : account
      )
  );
}
