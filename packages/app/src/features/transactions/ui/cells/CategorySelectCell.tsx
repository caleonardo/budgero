import * as React from 'react';
import { SearchableCategorySelect } from '@features/category-management/ui/SearchableCategorySelect';
import { useUiStore } from '@shared/store/useUiStore';
import type { Category, CategoryGroup, GetMonthlyBudgetRow } from '@budgero/core/browser';

interface CategorySelectCellProps {
  categoryID: number;
  onCommit: (newVal: number) => void;
  triggerClassName?: string;
  budgetId?: number;
  categories?: Category[];
  categoryGroups?: CategoryGroup[];
  monthlyRows?: GetMonthlyBudgetRow[];
  readyToAssignAmount?: number;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CategorySelectCell({
  categoryID,
  onCommit,
  triggerClassName,
  budgetId,
  categories,
  categoryGroups,
  monthlyRows,
  readyToAssignAmount,
  defaultOpen,
  onOpenChange,
}: CategorySelectCellProps) {
  const [selectedValue, setSelectedValue] = React.useState(categoryID);
  const { selectedBudget } = useUiStore();

  React.useEffect(() => {
    setSelectedValue(categoryID);
  }, [categoryID]);

  const handleChange = (newCategoryID: number) => {
    setSelectedValue(newCategoryID);
    onCommit(newCategoryID);
  };

  return (
    <SearchableCategorySelect
      budgetId={budgetId ?? selectedBudget?.ID ?? 0}
      selectedCategoryId={selectedValue}
      onCategorySelect={handleChange}
      triggerClassName={triggerClassName}
      popoverContentClassName="!w-[280px] !min-w-[280px]"
      categories={categories}
      categoryGroups={categoryGroups}
      monthlyRows={monthlyRows}
      readyToAssignAmount={readyToAssignAmount}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    />
  );
}
