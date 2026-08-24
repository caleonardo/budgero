import { useMemo } from 'react';
import type { Account } from '@budgero/core/browser';
import { useUiStore } from '@shared/store/useUiStore';
import { useAllTransactionsAnalytics } from '@entities/transaction/api/queries';
import { useAccounts } from '@entities/account/api/useAccounts';
import { useCategories, useCategoryGroups } from '@entities/category/api/useCategories';
import { useLabels } from '@entities/label/api/useLabels';
import { isLiabilityType } from '@entities/account/model/accountTypes';
import {
  filterTransactions,
  INCOME_GROUP_NAME,
  TRANSFERS_GROUP_NAME,
  type AnalyticsAccount,
  type AnalyticsFilters,
  type AnalyticsTxn,
} from './analytics-model';

export interface AnalyticsData {
  budgetId: number;
  isLoading: boolean;
  /** All adapted transactions (unfiltered, real only — projections dropped). */
  allTxns: AnalyticsTxn[];
  /** Transactions with the current filters applied. */
  txns: AnalyticsTxn[];
  accounts: AnalyticsAccount[];
  onBudgetAccountIds: Set<number>;
  categories: { id: number; name: string; groupId: number }[];
  categoryGroups: { id: number; name: string }[];
  labels: { id: number; name: string; color: string }[];
  payees: string[];
}

/**
 * Adapt every account whose history still belongs to the budget. Archived
 * accounts are intentionally included: archiving hides an account from daily
 * navigation and transaction-entry pickers, but must not erase it from
 * historical reports.
 */
export function adaptAnalyticsAccounts(rawAccounts: Account[]): AnalyticsAccount[] {
  return rawAccounts
    .filter((account) => !account.Deleted)
    .map((account) => ({
      id: account.ID,
      name: account.Name,
      type: account.Type,
      onBudget: account.OnBudget,
      isLiability: isLiabilityType(account.Type),
      currentBalance: account.BalanceConverted ?? account.BalanceNative ?? 0,
    }));
}

export function useAnalyticsData(filters: AnalyticsFilters): AnalyticsData {
  const budgetId = useUiStore((state) => state.selectedBudget?.ID || 0);
  const { data: rawTxns, isLoading: txnsLoading } = useAllTransactionsAnalytics(budgetId);
  const { data: rawAccounts, isLoading: accountsLoading } = useAccounts(budgetId);
  const { data: rawCategories } = useCategories(budgetId);
  const { data: rawGroups } = useCategoryGroups(budgetId);
  const { labels: rawLabels } = useLabels(budgetId);

  const categoryGroups = useMemo(
    () => (rawGroups ?? []).map((group) => ({ id: group.ID, name: group.Name })),
    [rawGroups]
  );

  const categories = useMemo(
    () =>
      (rawCategories ?? []).map((category) => ({
        id: category.ID,
        name: category.Name,
        groupId: category.CategoryGroupID,
      })),
    [rawCategories]
  );

  const groupNameByCategoryId = useMemo(() => {
    const groupNames = new Map(categoryGroups.map((group) => [group.id, group.name]));
    return new Map(
      categories.map((category) => [category.id, groupNames.get(category.groupId) ?? ''])
    );
  }, [categories, categoryGroups]);

  const accounts = useMemo(() => adaptAnalyticsAccounts(rawAccounts ?? []), [rawAccounts]);

  const onBudgetAccountIds = useMemo(
    () => new Set(accounts.filter((account) => account.onBudget).map((account) => account.id)),
    [accounts]
  );

  const allTxns = useMemo<AnalyticsTxn[]>(() => {
    if (!rawTxns) return [];
    const adapted: AnalyticsTxn[] = [];
    for (const row of rawTxns) {
      if (row.IsProjected) continue;
      const date = row.Date.slice(0, 10);
      const groupName = row.CategoryID ? (groupNameByCategoryId.get(row.CategoryID) ?? '') : '';
      adapted.push({
        id: row.ID,
        date,
        monthKey: date.slice(0, 7),
        accountId: row.AccountID ?? 0,
        categoryId: row.CategoryID || null,
        category: row.Category ?? '',
        groupName,
        payee: row.Payee ?? '',
        labelId: row.LabelID ?? null,
        label: row.Label ?? '',
        labelColor: row.LabelColor ?? null,
        inflow: row.InflowConverted,
        outflow: row.OutflowConverted,
        isTransfer: Boolean(row.TransferID) || groupName === TRANSFERS_GROUP_NAME,
        isIncome: groupName === INCOME_GROUP_NAME,
      });
    }
    return adapted;
  }, [rawTxns, groupNameByCategoryId]);

  const txns = useMemo(() => filterTransactions(allTxns, filters), [allTxns, filters]);

  const payees = useMemo(() => {
    const names = new Set<string>();
    for (const txn of allTxns) {
      if (txn.payee) names.add(txn.payee);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [allTxns]);

  const labels = useMemo(
    () => rawLabels.map((label) => ({ id: label.ID, name: label.Name, color: label.Color })),
    [rawLabels]
  );

  return {
    budgetId,
    isLoading: txnsLoading || accountsLoading,
    allTxns,
    txns,
    accounts,
    onBudgetAccountIds,
    categories,
    categoryGroups,
    labels,
    payees,
  };
}
