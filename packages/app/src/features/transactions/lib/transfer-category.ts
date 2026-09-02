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

/** Off-budget transfer legs may choose Transfers (RTA) or a regular category. */
export function transferHasOffBudgetLeg(transaction: TransferBudgetState): boolean {
  if (!transaction.TransferID?.trim()) return false;
  const isOffBudget = (value: boolean | number | null | undefined) =>
    value != null && Number(value) === 0;
  return (
    isOffBudget(transaction.AccountOnBudget) || isOffBudget(transaction.TransferAccountOnBudget)
  );
}
