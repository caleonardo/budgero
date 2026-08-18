import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import type { Category } from '@budgero/core/browser';
import { asMilli } from '@shared/lib/currency/milli';
import type { BudgetRow } from '../../lib/budget-transforms';
import { useCategorySelection } from './useCategorySelection';

const row = (categoryId: number, isGroup = false): BudgetRow => ({
  id: isGroup ? `g${categoryId}` : `c${categoryId}`,
  name: `Row ${categoryId}`,
  assigned: asMilli(0),
  activity: asMilli(0),
  available: asMilli(0),
  totalTransactions: 0,
  isGroup,
  categoryId: isGroup ? -1 : categoryId,
  categoryGroupId: 1,
  parentId: isGroup ? undefined : 'g1',
});

function useHarness() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [lastSelectedCategoryId, setLastSelectedCategoryId] = useState<number | null>(null);
  const data = [row(1, true), row(1), row(2), row(3), row(4)];
  const sel = useCategorySelection({
    orderedData: data,
    selectedCategories,
    setSelectedCategories,
    lastSelectedCategoryId,
    setLastSelectedCategoryId,
    highlightedCategoryId: null,
    disableSelection: false,
    budgetId: 1,
    selectedBudgetId: 1,
  });
  return { ...sel, selectedCategories, data };
}

describe('useCategorySelection', () => {
  it('shift-click extends from the last selected row to the clicked row', () => {
    const { result } = renderHook(() => useHarness());
    act(() => result.current.handleCategorySelect({}, result.current.data[1]));
    expect(result.current.selectedCategories.map((c) => c.ID)).toEqual([1]);
    act(() => result.current.handleCategorySelect({ shiftKey: true }, result.current.data[3]));
    expect(result.current.selectedCategories.map((c) => c.ID)).toEqual([1, 2, 3]);
    // ctrl-click adds one more
    act(() => result.current.handleCategorySelect({ ctrlKey: true }, result.current.data[4]));
    expect(result.current.selectedCategories.map((c) => c.ID)).toEqual([1, 2, 3, 4]);
  });

  it('shift-click with nothing selected before selects the clicked row and anchors there', () => {
    const { result } = renderHook(() => useHarness());
    act(() => result.current.handleCategorySelect({ shiftKey: true }, result.current.data[2]));
    expect(result.current.selectedCategories.map((c) => c.ID)).toEqual([2]);
    act(() => result.current.handleCategorySelect({ shiftKey: true }, result.current.data[4]));
    expect(result.current.selectedCategories.map((c) => c.ID)).toEqual([2, 3, 4]);
  });
});
