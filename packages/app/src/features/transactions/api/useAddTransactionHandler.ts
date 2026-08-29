/**
 * Shared hook for handling add transaction logic.
 * Extracted from useTransactionTable to be used by both desktop and mobile layouts.
 */

import { useCallback } from 'react';
import { useUiStore } from '@shared/store/useUiStore';
import {
  useAddTransaction,
  useAddTransfer,
  type AddTransferResult,
} from '@entities/transaction/api/useTransactions';
import { useCategories } from '@entities/category/api/useCategories';

interface UseAddTransactionHandlerOptions {
  onDialogClose: () => void;
}

export interface AddTransferRequest {
  date: Date | null;
  transferId: string;
  memo: string;
  labelId: number | null;
  source: {
    category: string;
    payee: string;
    amount: number;
    accountId: number;
    exchangeRateOverride?: number | null;
  };
  destination: {
    category: string;
    payee: string;
    amount: number;
    accountId: number;
    exchangeRateOverride?: number | null;
  };
  keepDialogOpen?: boolean;
}

export function useAddTransactionHandler({ onDialogClose }: UseAddTransactionHandlerOptions) {
  const selectedAccount = useUiStore((state) => state.selectedAccount);
  const selectedBudget = useUiStore((state) => state.selectedBudget);

  const { data: categories = [] } = useCategories(
    selectedAccount?.BudgetID || selectedBudget?.ID || 0
  );

  const addTransactionMutation = useAddTransaction();
  const addTransferMutation = useAddTransfer();

  const handleAddTransaction = useCallback(
    async (
      date: Date | null,
      category: string,
      memo: string,
      payee: string,
      outflow: number,
      inflow: number,
      accountId: number,
      labelId: number | null,
      transferId: string | null,
      keepDialogOpen?: boolean,
      exchangeRateOverride?: number | null
    ): Promise<number> => {
      const categoryObject = categories.find((cat) => cat.Name === category);
      const categoryId = categoryObject?.ID || 0;

      // Don't perform optimistic update - let React Query handle the data flow
      // This prevents the data from getting out of sync

      if (!transferId) {
        transferId = '';
      }
      const transactionDate = date
        ? date.toLocaleDateString('en-CA') // -> "2025-09-26"
        : new Date().toLocaleDateString('en-CA');
      const id = await addTransactionMutation.mutateAsync({
        inflow,
        outflow,
        accountId,
        categoryId,
        labelId,
        budgetId: selectedAccount?.BudgetID || selectedBudget?.ID || 0,
        date: transactionDate,
        memo,
        payee,
        transferId,
        exchangeRateOverride,
      });

      // Only close dialog if not keeping it open for "Add Another"
      if (!keepDialogOpen) {
        onDialogClose();
      }
      return id;
    },
    [categories, selectedAccount, selectedBudget, addTransactionMutation, onDialogClose]
  );

  const handleAddTransfer = useCallback(
    async (request: AddTransferRequest): Promise<AddTransferResult> => {
      const sourceCategoryId =
        categories.find((category) => category.Name === request.source.category)?.ID || 0;
      const destinationCategoryId =
        categories.find((category) => category.Name === request.destination.category)?.ID || 0;
      const transactionDate = request.date
        ? request.date.toLocaleDateString('en-CA')
        : new Date().toLocaleDateString('en-CA');
      const budgetId = selectedAccount?.BudgetID || selectedBudget?.ID || 0;

      const result = await addTransferMutation.mutateAsync({
        budgetId,
        transferId: request.transferId,
        source: {
          inflow: 0,
          outflow: request.source.amount,
          accountId: request.source.accountId,
          categoryId: sourceCategoryId,
          labelId: request.labelId,
          date: transactionDate,
          memo: request.memo,
          payee: request.source.payee,
          exchangeRateOverride: request.source.exchangeRateOverride,
        },
        destination: {
          inflow: request.destination.amount,
          outflow: 0,
          accountId: request.destination.accountId,
          categoryId: destinationCategoryId,
          labelId: request.labelId,
          date: transactionDate,
          memo: request.memo,
          payee: request.destination.payee,
          exchangeRateOverride: request.destination.exchangeRateOverride,
        },
      });

      if (!request.keepDialogOpen) onDialogClose();
      return result;
    },
    [categories, selectedAccount, selectedBudget, addTransferMutation, onDialogClose]
  );

  return {
    handleAddTransaction,
    handleAddTransfer,
    addTransactionMutation,
    addTransferMutation,
    categories,
  };
}
