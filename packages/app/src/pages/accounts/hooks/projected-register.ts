import { asMilli } from '@budgero/core/browser';
import type { GetTransactionsByAccountRow, ProjectedTransactionRow } from '@budgero/core/browser';

/**
 * Maps a projected recurring occurrence into the account-register row shape.
 * IDs are negative (negated occurrence ID), so they never collide with real
 * transactions.
 */
function toRegisterRow(p: ProjectedTransactionRow): GetTransactionsByAccountRow {
  return {
    ID: p.ID,
    Date: p.Date,
    CategoryID: p.CategoryID ?? 0,
    Category: p.Category ?? 'Uncategorized',
    Memo: p.Memo,
    Payee: p.Payee,
    Reconciled: false,
    InflowConverted: p.InflowConverted,
    OutflowConverted: p.OutflowConverted,
    InflowNative: p.InflowNative,
    OutflowNative: p.OutflowNative,
    RunningBalanceConverted: null,
    RunningBalanceNative: null,
    Account: p.Account,
    IsProjected: true,
  };
}

/** Ascending sort: by date, real rows before projected rows on the same day, then by ID. */
function compareAsc(a: GetTransactionsByAccountRow, b: GetTransactionsByAccountRow): number {
  if (a.Date !== b.Date) return a.Date < b.Date ? -1 : 1;
  const aProjected = a.IsProjected ? 1 : 0;
  const bProjected = b.IsProjected ? 1 : 0;
  if (aProjected !== bProjected) return aProjected - bProjected;
  return Math.abs(a.ID) - Math.abs(b.ID);
}

/**
 * Merges projected recurring occurrences into the (date-filtered) register
 * rows and recomputes the running balance from the first projected row
 * onward. The headline/sidebar balance is untouched — only the register's
 * balance column becomes a projection, flagged via RunningBalanceProjected.
 *
 * `allRealRows` (unfiltered, Date DESC) anchors the starting balance when the
 * first row of the merged set is itself a projection.
 */
export function mergeProjectedTransactions(
  realRows: GetTransactionsByAccountRow[],
  allRealRows: GetTransactionsByAccountRow[],
  projected: ProjectedTransactionRow[]
): GetTransactionsByAccountRow[] {
  if (!projected.length) return realRows;

  const merged = [...realRows, ...projected.map(toRegisterRow)].sort(compareAsc);
  const firstProjectedIdx = merged.findIndex((row) => row.IsProjected);

  // Anchor balances from the last untouched row, or from history when the
  // merged set starts with a projection.
  let runningBudget: number;
  let runningOriginal: number;
  if (firstProjectedIdx > 0) {
    const anchor = merged[firstProjectedIdx - 1];
    runningBudget = anchor.RunningBalanceConverted ?? 0;
    runningOriginal = anchor.RunningBalanceNative ?? anchor.RunningBalanceConverted ?? 0;
  } else {
    const firstDate = merged[0].Date;
    // allRealRows is Date DESC, so the first match is the latest prior row
    const anchor = allRealRows.find((row) => row.Date <= firstDate);
    runningBudget = anchor?.RunningBalanceConverted ?? 0;
    runningOriginal = anchor?.RunningBalanceNative ?? anchor?.RunningBalanceConverted ?? 0;
  }

  for (let i = firstProjectedIdx; i < merged.length; i++) {
    const row = merged[i];
    runningBudget += (row.InflowConverted ?? 0) - (row.OutflowConverted ?? 0);
    runningOriginal +=
      (row.InflowNative ?? row.InflowConverted ?? 0) -
      (row.OutflowNative ?? row.OutflowConverted ?? 0);
    merged[i] = {
      ...row,
      RunningBalanceConverted: asMilli(runningBudget),
      RunningBalanceNative: asMilli(runningOriginal),
      RunningBalanceProjected: true,
    };
  }

  return merged.reverse();
}
