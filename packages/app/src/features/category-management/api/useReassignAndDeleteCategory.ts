import { useMutation } from '@tanstack/react-query';
import { useDeleteCategory } from '@entities/category/api/useCategories';
import { useReassignAssignments } from '@entities/budget/api/useMonthlyBudget';
import { useReassignTransactions } from '@entities/transaction/api/useTransactions';
import { useRuntime } from '@shared/runtime/runtime-provider';

/** The reassignment flow shared by Planning and income category settings. */
export function useReassignAndDeleteCategory() {
  const runtime = useRuntime();
  const transactions = useReassignTransactions();
  const assignments = useReassignAssignments();
  const deletion = useDeleteCategory();

  return useMutation({
    mutationFn: async ({
      budgetId,
      oldCategoryId,
      newCategoryId,
    }: {
      budgetId: number;
      oldCategoryId: number;
      newCategoryId: number;
    }) => {
      const spaceId = runtime.getActiveSpaceId();
      if (!spaceId || !budgetId) throw new Error('Select a budget before deleting categories');
      if (oldCategoryId === newCategoryId)
        throw new Error('Choose a different destination category');
      const { categories } = runtime.services();
      const source = categories.getCategory(oldCategoryId);
      const destination = categories.getCategory(newCategoryId);
      if (source.BudgetID !== budgetId || destination.BudgetID !== budgetId) {
        throw new Error('Both categories must belong to the selected budget');
      }
      if (categories.getCategoryGroup(source.CategoryGroupID).Name === 'Income') {
        if (source.Name === 'Income')
          throw new Error('The system Income category cannot be deleted');
        if (destination.CategoryGroupID !== source.CategoryGroupID) {
          throw new Error(
            'Choose another income category to keep this history classified as income'
          );
        }
      }
      const assertSameSpace = () => {
        if (runtime.getActiveSpaceId() !== spaceId) {
          throw new Error(
            'The active budget space changed. Return to the original budget to finish deleting this category.'
          );
        }
      };
      const input = { budgetId, oldCategoryId, newCategoryId };
      await transactions.mutateAsync(input);
      assertSameSpace();
      await assignments.mutateAsync(input);
      assertSameSpace();
      await deletion.mutateAsync({ id: oldCategoryId, budgetId });
    },
  });
}
