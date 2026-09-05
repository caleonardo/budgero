import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { useReassignAndDeleteCategory } from './useReassignAndDeleteCategory';

const mocks = vi.hoisted(() => ({
  transactions: vi.fn(),
  assignments: vi.fn(),
  deletion: vi.fn(),
  space: 'space-a',
}));
vi.mock('@entities/category/api/useCategories', () => ({
  useDeleteCategory: () => ({ mutateAsync: mocks.deletion }),
}));
vi.mock('@entities/budget/api/useMonthlyBudget', () => ({
  useReassignAssignments: () => ({ mutateAsync: mocks.assignments }),
}));
vi.mock('@entities/transaction/api/useTransactions', () => ({
  useReassignTransactions: () => ({ mutateAsync: mocks.transactions }),
}));
vi.mock('@shared/runtime/runtime-provider', () => ({
  useRuntime: () => ({
    getActiveSpaceId: () => mocks.space,
    services: () => ({
      categories: {
        getCategory: (id: number) => ({
          ID: id,
          Name: id === 1 ? 'Income' : 'Custom',
          BudgetID: id === 5 ? 8 : 7,
          CategoryGroupID: id === 4 ? 11 : 10,
        }),
        getCategoryGroup: (id: number) => ({ Name: id === 10 ? 'Income' : 'Spending' }),
      },
    }),
  }),
}));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderHook(() => useReassignAndDeleteCategory(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

describe('shared category deletion flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.space = 'space-a';
    mocks.transactions.mockResolvedValue(undefined);
    mocks.assignments.mockResolvedValue(undefined);
    mocks.deletion.mockResolvedValue(undefined);
  });

  it('moves transactions and assignments before deleting the category', async () => {
    const { result } = setup();
    const input = { budgetId: 7, oldCategoryId: 2, newCategoryId: 1 };
    await act(() => result.current.mutateAsync(input));
    expect(mocks.transactions).toHaveBeenCalledWith(input);
    expect(mocks.assignments).toHaveBeenCalledWith(input);
    expect(mocks.deletion).toHaveBeenCalledWith({ budgetId: 7, id: 2 });
    expect(mocks.transactions.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.assignments.mock.invocationCallOrder[0]
    );
    expect(mocks.assignments.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deletion.mock.invocationCallOrder[0]
    );
  });

  it.each([1, 2, 4, 5])(
    'rejects protected, identical, spending, and cross-budget destinations (%s)',
    async (id) => {
      const { result } = setup();
      const input =
        id === 1
          ? { budgetId: 7, oldCategoryId: 1, newCategoryId: 2 }
          : { budgetId: 7, oldCategoryId: 2, newCategoryId: id };
      await act(async () => {
        await expect(result.current.mutateAsync(input)).rejects.toThrow();
      });
      expect(mocks.transactions).not.toHaveBeenCalled();
      expect(mocks.deletion).not.toHaveBeenCalled();
    }
  );

  it('keeps the source when reassignment fails', async () => {
    mocks.assignments.mockRejectedValue(new Error('Save failed'));
    const { result } = setup();
    await act(async () => {
      await expect(
        result.current.mutateAsync({ budgetId: 7, oldCategoryId: 2, newCategoryId: 1 })
      ).rejects.toThrow('Save failed');
    });
    expect(mocks.deletion).not.toHaveBeenCalled();
  });

  it('stops if the active space changes during reassignment', async () => {
    mocks.transactions.mockImplementation(async () => {
      mocks.space = 'space-b';
    });
    const { result } = setup();
    await act(async () => {
      await expect(
        result.current.mutateAsync({ budgetId: 7, oldCategoryId: 2, newCategoryId: 1 })
      ).rejects.toThrow('space changed');
    });
    expect(mocks.assignments).not.toHaveBeenCalled();
    expect(mocks.deletion).not.toHaveBeenCalled();
  });
});
