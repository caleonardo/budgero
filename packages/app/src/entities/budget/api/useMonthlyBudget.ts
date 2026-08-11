import { useCallback } from 'react';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import type {
  GetMonthlyBudgetRow,
  AssignmentsByMonthRow,
  ReadyToAssignBreakdown,
} from '@budgero/core/browser';
// Use runtime services directly instead of db-ops wrappers
import { useRuntime, useActiveSpaceId } from '@shared/runtime/runtime-provider';
import { executeSpaceMutation } from '@shared/runtime/mutation-router';
import { useSpaceQuery } from '@shared/api/useSpaceQuery';
import { resolveSpaceKey } from '@shared/lib/query-utils';

/**
 * Fetch the monthly budget breakdown for a given month and budget.
 */
export function useMonthlyBudget(month: string, budgetId: number) {
  const runtime = useRuntime();
  const spaceId = useActiveSpaceId();
  const spaceKey = resolveSpaceKey(spaceId);
  return useQuery<GetMonthlyBudgetRow[]>({
    queryKey: ['monthlyBudget', spaceKey, month, budgetId],
    queryFn: async () => {
      if (!spaceId || !month || !budgetId) {
        return [];
      }
      const services = runtime.services();
      // Don't filter out empty groups - they should be shown
      return services.monthlyBudgets.getMonthlyBudget(month, budgetId);
    },
    enabled: Boolean(spaceId) && Boolean(month) && budgetId > 0,
    staleTime: 1000 * 60 * 5, // cache 5 minutes
    retry: 2, // Retry failed requests twice
    placeholderData: keepPreviousData, // Keep showing old data while fetching new month
  });
}

/**
 * Fetch the "ready to assign" amount for a budget.
 *
 * In cumulative mode this is a static, month-independent figure; in monthly
 * (YNAB-style) mode it is computed through `month`. Callers on the budget page
 * pass the selected month; omit it elsewhere to get the current month.
 */
export function useReadyToAssign(budgetId: number, month?: string) {
  return useSpaceQuery<number>({
    key: ['readyToAssign', budgetId, month ?? 'current'],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.monthlyBudgets.getReadyToAssign(budgetId, month),
    placeholderData: keepPreviousData,
  });
}

/**
 * The component figures behind Ready to Assign (income, assignments, transfers,
 * revaluations, prior cash overspend) plus the active mode — used by the help
 * popover to always show the full math.
 */
export function useReadyToAssignBreakdown(budgetId: number, month?: string) {
  return useSpaceQuery<ReadyToAssignBreakdown>({
    // Keyed under the 'readyToAssign' prefix so every existing
    // ['readyToAssign', '*'] invalidation refreshes the breakdown too.
    key: ['readyToAssign', budgetId, month ?? 'current', 'breakdown'],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.monthlyBudgets.getReadyToAssignBreakdown(budgetId, month),
    placeholderData: keepPreviousData,
  });
}

/**
 * Insert or update a monthly assignment for a category.
 */
export type UpsertAssignmentInput = {
  categoryId: number;
  amount: number;
  month: string;
  budgetId: number;
};
export function useUpsertAssignment() {
  const runtime = useRuntime();
  return useMutation<void, Error, UpsertAssignmentInput>({
    mutationFn: async (input) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'monthlyBudgets.upsertAssignment',
        payload: {
          categoryId: input.categoryId,
          amount: input.amount,
          month: input.month,
          budgetId: input.budgetId,
        },
        meta: { label: 'useUpsertAssignment' },
      });
    },
  });
}

/**
 * Update an existing monthly assignment amount (patch).
 */
export type UpdateAssignmentInput = {
  categoryId: number;
  amount: number;
  month: string;
  budgetId: number;
};
export function useUpdateAssignment() {
  const runtime = useRuntime();
  return useMutation<void, Error, UpdateAssignmentInput>({
    mutationFn: async ({ categoryId, amount, month, budgetId }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'monthlyBudgets.updateAssignment',
        payload: {
          categoryId,
          amount,
          month,
          budgetId,
        },
        meta: { label: 'useUpdateAssignment' },
      });
    },
  });
}

/**
 * Reassign all assignments from one category to another.
 */
export type ReassignAssignmentsInput = {
  newCategoryId: number;
  oldCategoryId: number;
  budgetId: number;
};
export function useReassignAssignments() {
  const runtime = useRuntime();
  return useMutation<void, Error, ReassignAssignmentsInput>({
    mutationFn: async ({ newCategoryId, oldCategoryId, budgetId }) => {
      await executeSpaceMutation<void>(runtime, {
        op: 'monthlyBudgets.reassignAssignment',
        payload: {
          newCategoryId,
          oldCategoryId,
          budgetId,
        },
        meta: { label: 'useReassignAssignments' },
      });
    },
  });
}

export const useAssignmentsByMonthForCategories = (
  categoryIds: number[],
  startMonth: string,
  endMonth: string,
  budgetId: number
) => {
  const normalizedCategoryIds = categoryIds.length
    ? Array.from(new Set(categoryIds)).sort((a, b) => a - b)
    : [];

  return useSpaceQuery<AssignmentsByMonthRow[]>({
    key: [
      'assignmentsByMonthForCategories',
      normalizedCategoryIds.join('_'),
      startMonth,
      endMonth,
      budgetId,
    ],
    enabled:
      normalizedCategoryIds.length > 0 && Boolean(startMonth) && Boolean(endMonth) && budgetId > 0,
    queryFn: (services) =>
      services.monthlyBudgets.getAssignmentsByMonthForCategories(
        normalizedCategoryIds,
        startMonth,
        endMonth,
        budgetId
      ),
  });
};

interface CategoryAssignmentHelpers {
  lastMonth: Record<number, number>;
  average: Record<number, number>;
}

export const useCategoryAssignmentHelpers = (categoryIds: number[], month: string) => {
  const normalizedCategoryIds = categoryIds.length
    ? Array.from(new Set(categoryIds)).sort((a, b) => a - b)
    : [];

  return useSpaceQuery<CategoryAssignmentHelpers>({
    key: ['categoryAssignmentHelpers', normalizedCategoryIds.join('_'), month],
    enabled: normalizedCategoryIds.length > 0 && Boolean(month),
    queryFn: (services) => {
      const lastMonthValues = normalizedCategoryIds.map((categoryId) =>
        services.monthlyBudgets.getAssignedLastMonth(month, categoryId)
      );

      const averageValues = normalizedCategoryIds.map((categoryId) =>
        services.monthlyBudgets.getAverageAssigned(categoryId)
      );

      const lastMonth: Record<number, number> = {};
      normalizedCategoryIds.forEach((categoryId, index) => {
        lastMonth[categoryId] = lastMonthValues[index] ?? 0;
      });

      const average: Record<number, number> = {};
      normalizedCategoryIds.forEach((categoryId, index) => {
        average[categoryId] = averageValues[index] ?? 0;
      });

      return { lastMonth, average };
    },
  });
};

/**
 * Hook to get total assigned amount for budget pace calculation
 * Only includes categories that are NOT excluded from budget pace
 */
export const useTotalAssignedForBudgetPace = (months: string[], budgetId: number) => {
  return useSpaceQuery({
    key: ['totalAssignedForBudgetPace', months.join('_'), budgetId],
    enabled: months.length > 0 && budgetId > 0,
    queryFn: (services) => services.monthlyBudgets.getTotalAssignedForBudgetPace(months, budgetId),
  });
};

/**
 * Hook for batch upserting multiple assignments at once
 * Much faster than individual upserts for bulk operations
 */
export const useBatchUpsertAssignments = () => {
  const runtime = useRuntime();

  return useMutation({
    mutationFn: async (
      assignments: { categoryId: number; amount: number; month: string; budgetId: number }[]
    ) => {
      const mutationManager = runtime.mutationsRouter();
      await mutationManager.execute<void>({
        op: 'monthlyBudgets.batchUpsertAssignments',
        payload: {
          assignments,
        },
        meta: { label: 'useBatchUpsertAssignments' },
      });
    },
  });
};

/**
 * Hook that provides a callable function to check if reducing a category's
 * assignment would cause overspending in future months.
 */
export function useFutureOverspendingCheck() {
  const runtime = useRuntime();

  const checkOverspending = useCallback(
    (
      categoryId: number,
      reductionAmount: number,
      currentMonth: string,
      budgetId: number
    ): { month: string; currentAvailable: number; projectedAvailable: number }[] => {
      const services = runtime.services();
      return services.monthlyBudgets.checkFutureOverspending(
        categoryId,
        reductionAmount,
        currentMonth,
        budgetId
      );
    },
    [runtime]
  );

  return { checkOverspending };
}
