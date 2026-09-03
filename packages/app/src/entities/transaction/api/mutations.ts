import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
// Use runtime services directly instead of db-ops wrappers
import { useRuntime } from '@shared/runtime/runtime-provider';
import { executeSpaceMutation } from '@shared/runtime/mutation-router';
import { useLoading } from '@shared/contexts/LoadingContext';
import { applyOpInvalidations } from '@shared/lib/query-utils';

// Query invalidation for these mutations is driven centrally by the
// MutationExecutor from each op's declared `invalidates` (see
// op-code-registry/domains/transactions.ts), so it runs identically for local
// and remote mutations. Hooks here only carry genuine UI side effects.

/**
 * Valid column names for transaction updates.
 * Matches the normalization in op-code-registry.ts
 */
export type TransactionColumnName =
  | 'InflowConverted'
  | 'OutflowConverted'
  | 'Memo'
  | 'Date'
  | 'CategoryID'
  | 'LabelID'
  | 'AccountID'
  | 'InflowNative'
  | 'OutflowNative'
  | 'Payee'
  | 'ExchangeRate';

/**
 * Add a new transaction.
 */
export type AddTransactionInput = {
  inflow: number;
  outflow: number;
  accountId: number;
  categoryId: number;
  labelId?: number | null;
  budgetId: number;
  date: string;
  memo: string;
  payee?: string;
  transferId: string;
  /** Account-to-budget rate pinned on creation. */
  exchangeRateOverride?: number | null;
};

export type AddTransferLegInput = Omit<AddTransactionInput, 'budgetId' | 'transferId'>;

export type AddTransferInput = {
  budgetId: number;
  transferId: string;
  source: AddTransferLegInput;
  destination: AddTransferLegInput;
};

export type AddTransferResult = {
  sourceId: number;
  destinationId: number;
};

export function useAddTransaction() {
  const { showTransferLoading, hideTransferLoading } = useLoading();
  const runtime = useRuntime();
  const queryClient = useQueryClient();

  return useMutation<number, Error, AddTransactionInput>({
    mutationFn: async (input) => {
      if (input.transferId) {
        showTransferLoading();
      }

      return executeSpaceMutation<number>(runtime, {
        op: 'transactions.add',
        payload: {
          inflow: input.inflow,
          outflow: input.outflow,
          accountId: input.accountId,
          categoryId: input.categoryId,
          labelId: input.labelId ?? null,
          budgetId: input.budgetId,
          date: input.date,
          memo: input.memo,
          payee: input.payee,
          transferId: input.transferId,
          exchangeRateOverride: input.exchangeRateOverride ?? null,
        },
        // Plain adds refresh active views in the background so a large account
        // register does not keep the add dialog pending. Preserve the existing
        // awaited invalidation behavior for legacy transfer calls.
        meta: { label: 'useAddTransaction', skipInvalidate: !input.transferId },
      });
    },
    onSuccess: (_newId, vars) => {
      if (vars.transferId) {
        hideTransferLoading();
      } else {
        applyOpInvalidations(queryClient, 'transactions.add');
      }
    },
    onError: (error, vars) => {
      if (vars.transferId) hideTransferLoading();
      console.error('Transaction failed:', error);
    },
  });
}

/**
 * Add both linked legs of a transfer as one mutation/undo item.
 */
export function useAddTransfer() {
  const { showTransferLoading, hideTransferLoading } = useLoading();
  const runtime = useRuntime();

  return useMutation<AddTransferResult, Error, AddTransferInput>({
    mutationFn: async (input) => {
      showTransferLoading();
      return executeSpaceMutation<AddTransferResult>(runtime, {
        op: 'transactions.addTransfer',
        payload: {
          budgetId: input.budgetId,
          transferId: input.transferId,
          source: input.source,
          destination: input.destination,
        },
        meta: { label: 'useAddTransfer' },
      });
    },
    onSuccess: () => hideTransferLoading(),
    onError: (error) => {
      hideTransferLoading();
      console.error('Transfer failed:', error);
    },
  });
}

export type UpdateTransferRateInput = {
  transferId: string;
  rate: number;
};

export function useUpdateTransferRate() {
  const runtime = useRuntime();
  return useMutation<void, Error, UpdateTransferRateInput>({
    mutationFn: async ({ transferId, rate }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.updateTransferRate',
        payload: { transferId, rate, transferRateOverride: true },
        meta: { label: 'useUpdateTransferRate' },
      });
    },
  });
}

/**
 * Update a transaction column.
 */
export type UpdateTransactionColumnInput = {
  transactionId: number;
  /** Column name - will be normalized by op-code-registry */
  column: TransactionColumnName | string;
  value: string | number | null;
  accountId: number;
  /** Suppress query invalidation (batch callers invalidate once at the end). */
  skipInvalidate?: boolean;
};

const AMOUNT_COLUMNS = new Set([
  'InflowConverted',
  'OutflowConverted',
  'InflowNative',
  'OutflowNative',
]);

// Amount edits change balances, budgets, and analytics, but cannot change the
// payee or label directories. Keeping those active queries out of this hot path
// avoids rebuilding every row's editor data after each numeric commit.
const AMOUNT_UPDATE_INVALIDATIONS: string[][] = [
  ['transactions'],
  ['transactionsByCategoryAndMonth', '*'],
  ['allTransactions', '*'],
  ['allTransactionsDetailed', '*'],
  ['allTransactionsAnalytics', '*'],
  ['uncategorizedTransactions', '*'],
  ['allAccountsMonthlyTransactions', '*'],
  ['accounts'],
  ['monthlyBudget', '*'],
  ['readyToAssign'],
  ['monthlySpending', '*'],
  ['monthlyBalance', '*'],
  ['spendingByDates', '*'],
  ['spendingByDatesByCategories', '*'],
  ['spendingByCategoriesInGroup', '*'],
  ['balanceByDates', '*'],
  ['analyticsPeriodSummary', '*'],
  ['topSpendingCategories', '*'],
  ['incomeExpenseByPeriod', '*'],
  ['onBudgetBalance'],
  ['onBudgetBalanceByDates'],
  ['spendingByLabels', '*'],
];

export function useUpdateTransactionColumn() {
  const runtime = useRuntime();
  return useMutation<void, Error, UpdateTransactionColumnInput>({
    mutationFn: async ({ transactionId, column, value, skipInvalidate }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.updateColumn',
        payload: {
          id: transactionId,
          columnName: column,
          newValue: value,
        },
        invalidates: AMOUNT_COLUMNS.has(column) ? AMOUNT_UPDATE_INVALIDATIONS : undefined,
        meta: { label: 'useUpdateTransactionColumn', skipInvalidate },
      });
    },
  });
}

/**
 * Reconcile an account - marks transactions as reconciled and updates reconciled_at timestamp
 */
export type ReconcileAccountInput = {
  accountId: number;
  reconcileDate?: string;
};

export function useReconcileAccount() {
  const runtime = useRuntime();
  return useMutation<void, Error, ReconcileAccountInput>({
    mutationFn: async (input) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.reconcile',
        payload: {
          accountId: input.accountId,
          reconcileDate: input.reconcileDate,
        },
        meta: { label: 'useReconcileAccount' },
      });
    },
  });
}

/**
 * Delete a transaction.
 */
export type DeleteTransactionInput = {
  transactionId: number;
  accountId: number;
  /** Suppress query invalidation (batch callers invalidate once at the end). */
  skipInvalidate?: boolean;
};

export function useDeleteTransaction() {
  const runtime = useRuntime();
  return useMutation<void, Error, DeleteTransactionInput>({
    mutationFn: async ({ transactionId, skipInvalidate }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.delete',
        payload: {
          id: transactionId,
        },
        meta: { label: 'useDeleteTransaction', skipInvalidate },
      });
    },
  });
}

/**
 * Delete multiple transactions in one mutation and persistence cycle.
 */
export type DeleteTransactionsInput = {
  transactionIds: number[];
};

export function useDeleteTransactions() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  const transactionRoots = new Set([
    'transactions',
    'allTransactions',
    'allTransactionsDetailed',
    'allTransactionsAnalytics',
    'uncategorizedTransactions',
    'allAccountsMonthlyTransactions',
  ]);

  type TransactionSnapshot = { key: QueryKey; data: unknown };

  return useMutation<void, Error, DeleteTransactionsInput, { snapshots: TransactionSnapshot[] }>({
    mutationFn: async ({ transactionIds }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.deleteBatch',
        payload: {
          ids: transactionIds,
        },
        meta: { label: 'useDeleteTransactions', skipInvalidate: true },
      });
    },
    onMutate: async ({ transactionIds }) => {
      const matchesTransactionRoot = (query: { queryKey: readonly unknown[] }) =>
        transactionRoots.has(String(query.queryKey[0] ?? ''));
      await queryClient.cancelQueries({ predicate: matchesTransactionRoot });

      const cachedQueries = queryClient.getQueriesData({ predicate: matchesTransactionRoot });
      const snapshots = cachedQueries.map(([key, data]) => ({ key, data }));
      const selectedIds = new Set(transactionIds);
      const transferIds = new Set<string>();

      for (const [, data] of cachedQueries) {
        if (!Array.isArray(data)) continue;
        for (const row of data) {
          if (
            row &&
            typeof row === 'object' &&
            selectedIds.has(Number((row as { ID?: unknown }).ID))
          ) {
            const transferId = (row as { TransferID?: unknown }).TransferID;
            if (typeof transferId === 'string' && transferId) transferIds.add(transferId);
          }
        }
      }

      for (const [key, data] of cachedQueries) {
        if (!Array.isArray(data)) continue;
        queryClient.setQueryData(
          key,
          data.filter((row) => {
            if (!row || typeof row !== 'object') return true;
            const candidate = row as { ID?: unknown; TransferID?: unknown };
            if (selectedIds.has(Number(candidate.ID))) return false;
            return !(
              typeof candidate.TransferID === 'string' && transferIds.has(candidate.TransferID)
            );
          })
        );
      }

      return { snapshots };
    },
    onError: (_error, _input, context) => {
      for (const snapshot of context?.snapshots ?? []) {
        queryClient.setQueryData(snapshot.key, snapshot.data);
      }
    },
    onSuccess: () => {
      applyOpInvalidations(queryClient, 'transactions.deleteBatch');
    },
  });
}

/**
 * Move a transaction to a new category.
 */
export type MoveTransactionToNewCategoryInput = {
  transactionId: number;
  newCategoryId: number;
  accountId: number;
  /** Suppress query invalidation (batch callers invalidate once at the end). */
  skipInvalidate?: boolean;
};

export function useMoveTransactionToNewCategory() {
  const runtime = useRuntime();
  return useMutation<void, Error, MoveTransactionToNewCategoryInput>({
    mutationFn: async ({ transactionId, newCategoryId, skipInvalidate }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.moveToNewCategory',
        payload: {
          transactionId,
          newCategoryId,
        },
        meta: { label: 'useMoveTransactionToNewCategory', skipInvalidate },
      });
    },
  });
}

/**
 * Move a transaction to a new account.
 */
export type MoveTransactionToNewAccountInput = {
  transactionId: number;
  newAccountId: number;
  /** Suppress query invalidation (batch callers invalidate once at the end). */
  skipInvalidate?: boolean;
};

export function useMoveTransactionToNewAccount() {
  const runtime = useRuntime();
  return useMutation<void, Error, MoveTransactionToNewAccountInput>({
    mutationFn: async ({ transactionId, newAccountId, skipInvalidate }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.moveToNewAccount',
        payload: {
          transactionId,
          newAccountId,
        },
        meta: { label: 'useMoveTransactionToNewAccount', skipInvalidate },
      });
    },
  });
}

/**
 * Reassign multiple transactions to a new category.
 */
export type ReassignTransactionsInput = {
  newCategoryId: number;
  oldCategoryId: number;
  budgetId: number;
};

export function useReassignTransactions() {
  const runtime = useRuntime();
  return useMutation<void, Error, ReassignTransactionsInput>({
    mutationFn: async ({ newCategoryId, oldCategoryId }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'transactions.reassign',
        payload: {
          newCategoryId,
          oldCategoryId,
        },
        meta: { label: 'useReassignTransactions' },
      });
    },
  });
}
