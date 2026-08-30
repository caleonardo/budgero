import type { GetTransactionsByAccountRow } from '@budgero/core/browser';

type TransferBudgetState = Pick<
  GetTransactionsByAccountRow,
  'TransferID' | 'AccountOnBudget' | 'TransferAccountOnBudget'
>;

/** Categories for transfers between two on-budget accounts are system-managed. */
export function hasReadOnlyTransferCategory(transaction: TransferBudgetState): boolean {
  return Boolean(
    transaction.TransferID?.trim() &&
      transaction.AccountOnBudget &&
      transaction.TransferAccountOnBudget
  );
}
