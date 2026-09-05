import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IncomeCategoriesCard } from './IncomeCategoriesCard';

const state = vi.hoisted(() => ({
  budget: { ID: 7, Name: 'Household' },
  create: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
  pending: false,
}));
vi.mock('@shared/store/useUiStore', () => ({
  useUiStore: (selector: (state: unknown) => unknown) => selector({ selectedBudget: state.budget }),
}));
vi.mock('@shared/runtime/runtime-provider', () => ({ useActiveSpaceId: () => 'demo-space' }));
vi.mock('@entities/category/api/useCategories', () => ({
  useCategoryGroups: () => ({ data: [{ ID: 10, Name: 'Income', BudgetID: 7 }], isPending: false }),
  useCategories: () => ({
    data: [
      { ID: 1, Name: 'Income', CategoryGroupID: 10, BudgetID: 7 },
      { ID: 2, Name: 'Salary', CategoryGroupID: 10, BudgetID: 7 },
      { ID: 3, Name: 'Freelance', CategoryGroupID: 10, BudgetID: 7 },
      { ID: 4, Name: 'Groceries', CategoryGroupID: 11, BudgetID: 7 },
      { ID: 5, Name: 'Other budget salary', CategoryGroupID: 10, BudgetID: 8 },
    ],
    isPending: false,
  }),
  useAddCategory: () => ({ mutateAsync: state.create, isPending: state.pending }),
  useUpdateCategoryName: () => ({ mutateAsync: state.rename, isPending: false }),
}));
vi.mock('@features/category-management/api/useReassignAndDeleteCategory', () => ({
  useReassignAndDeleteCategory: () => ({ mutateAsync: state.remove, isPending: false }),
}));

describe('Income category settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom does not implement the scrolling used by Radix Select's focus management.
    Element.prototype.scrollIntoView = vi.fn();
    state.pending = false;
    state.create.mockResolvedValue(9);
    state.rename.mockResolvedValue(undefined);
  });

  it('explains that categories are optional and keeps the system category read-only', () => {
    render(<IncomeCategoriesCard />);
    expect(screen.getByText(/Optional: give income sources/)).toHaveTextContent(
      'Ready to Assign in the same way'
    );
    expect(screen.getByText('Income', { exact: true })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rename Income' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Income' })).not.toBeInTheDocument();
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    expect(screen.queryByText('Other budget salary')).not.toBeInTheDocument();
  });

  it('adds trimmed names to this budget’s Income group and rejects duplicate names', async () => {
    render(<IncomeCategoriesCard />);
    const input = screen.getByLabelText('New income category');
    fireEvent.change(input, { target: { value: ' salary ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add category' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
    expect(state.create).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '  Rental income  ' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        budgetId: 7,
        groupId: 10,
        name: 'Rental income',
        note: '',
      })
    );
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('renames custom categories but prevents taking the default Income name', async () => {
    render(<IncomeCategoriesCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Rename Salary' }));
    const input = screen.getByLabelText('Category name');
    fireEvent.change(input, { target: { value: 'Income' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
    expect(state.rename).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '  Main salary ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    await waitFor(() =>
      expect(state.rename).toHaveBeenCalledWith({ budgetId: 7, id: 2, name: 'Main salary' })
    );
  });

  it('uses the shared deletion dialog and requires an income destination', async () => {
    render(<IncomeCategoriesCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Salary' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Your income totals will stay the same');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    fireEvent.click(screen.getByRole('combobox', { name: 'Destination category' }));
    expect(await screen.findByRole('option', { name: 'Income' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Freelance' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Salary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Groceries' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Freelance' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() =>
      expect(state.remove).toHaveBeenCalledWith({ budgetId: 7, oldCategoryId: 2, newCategoryId: 3 })
    );
  });
});
