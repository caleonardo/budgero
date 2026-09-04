import type { GetTransactionsByAccountAndMonthRow } from '@budgero/core/browser';

export function getBiggestOnBudgetOutflows(
  transactions: GetTransactionsByAccountAndMonthRow[],
  limit = 5
): GetTransactionsByAccountAndMonthRow[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.AccountOnBudget !== false &&
        Number(transaction.AccountOnBudget) !== 0 &&
        (transaction.OutflowConverted || 0) > 0 &&
        !transaction.TransferID
    )
    .sort((a, b) => (b.OutflowConverted || 0) - (a.OutflowConverted || 0))
    .slice(0, limit);
}
