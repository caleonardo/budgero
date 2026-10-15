import { beforeEach, describe, expect, it } from 'vitest';
import type { Account, Budget, Category } from '@budgero/core/browser';
import { switchWorkspaceAndSyncBudgetState } from '@shared/runtime/budget-gate';
import { useUiStore } from './useUiStore';

const budget = (ID: number, SpaceID = 'space-a') =>
  ({
    ID,
    SpaceID,
    Name: `Budget ${ID}`,
    DisplayCurrency: 'USD',
    NumberFormat: '$1,096.56',
  }) as Budget;
const account = { ID: 5, BudgetID: 1, Currency: 'USD' } as Account;
const category = { ID: 9 } as Category;

describe('budget-scoped UI selection', () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedBudget: budget(1),
      selectedAccount: account,
      selectedCategories: [category],
      lastSelectedCategoryId: 9,
    });
  });

  it('clears the selected account and categories when the budget changes', () => {
    useUiStore.getState().setSelectedBudget(budget(2));

    const state = useUiStore.getState();
    expect(state.selectedAccount).toBeNull();
    expect(state.selectedCategories).toEqual([]);
    expect(state.lastSelectedCategoryId).toBeNull();
  });

  it('keeps them when the same budget is refreshed', () => {
    useUiStore.getState().setSelectedBudget({ ...budget(1), Name: 'Renamed' });

    expect(useUiStore.getState().selectedAccount).toBe(account);
    expect(useUiStore.getState().lastSelectedCategoryId).toBe(9);
  });

  it('clears them on a workspace switch even when the budget ID repeats', async () => {
    const runtime = {
      switchSpace: async () => {},
      getActiveSpaceId: () => 'space-b',
      services: () => ({ budgets: { getAllBudgets: () => [budget(1, 'space-b')] } }),
    };

    await switchWorkspaceAndSyncBudgetState({
      runtime: runtime as never,
      queryClient: { setQueryData: () => undefined } as never,
      spaceId: 'space-b',
    });

    expect(useUiStore.getState().selectedAccount).toBeNull();
    expect(useUiStore.getState().selectedCategories).toEqual([]);
  });
});
