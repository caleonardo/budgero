import { render, screen } from '@testing-library/react';
import { asMilli, type Account, type Category } from '@budgero/core/browser';
import { DialogDescription, DialogTitle } from '@shared/ui/dialog';
import { RecurringTransactionEditor } from './RecurringTransactionEditor';

const addTransactionFormSpy = vi.fn();

vi.mock('@features/transactions/ui/add-transaction/AddTransactionForm', () => ({
  AddTransactionForm: (props: unknown) => {
    addTransactionFormSpy(props);
    return (
      <div data-testid="shared-add-transaction-form">
        <DialogTitle>Recurring transaction</DialogTitle>
        <DialogDescription>Recurring transaction details</DialogDescription>
      </div>
    );
  },
}));

const accounts = [{ ID: 1, Name: 'Checking', BudgetID: 42, Archived: false }] as Account[];
const categories = [{ ID: 7, Name: 'Utilities', BudgetID: 42 }] as Category[];

describe('RecurringTransactionEditor', () => {
  beforeEach(() => addTransactionFormSpy.mockClear());

  it('adapts recurring templates to the shared transaction form', () => {
    render(
      <RecurringTransactionEditor
        open
        mode="edit"
        onOpenChange={vi.fn()}
        budgetId={42}
        accounts={accounts}
        categories={categories}
        initialValues={{
          name: 'Power company',
          memo: 'Monthly bill',
          amount: asMilli(30_000),
          direction: 'outflow',
          accountId: 1,
          categoryId: 7,
          schedule: {
            startDate: '2026-08-30',
            intervalUnit: 'month',
            intervalCount: 1,
          },
          active: true,
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByTestId('shared-add-transaction-form')).toBeInTheDocument();
    expect(addTransactionFormSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        budgetId: 42,
        recurring: expect.objectContaining({
          initialEnabled: true,
          locked: true,
          mode: 'edit',
          initialValues: expect.objectContaining({
            name: 'Power company',
            categoryName: 'Utilities',
          }),
        }),
      })
    );
  });

  it('does not mount a second form while closed', () => {
    render(
      <RecurringTransactionEditor
        open={false}
        mode="create"
        onOpenChange={vi.fn()}
        budgetId={42}
        accounts={accounts}
        categories={categories}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByTestId('shared-add-transaction-form')).not.toBeInTheDocument();
  });
});
