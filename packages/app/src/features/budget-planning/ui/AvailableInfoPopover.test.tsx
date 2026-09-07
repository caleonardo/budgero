import { render, screen, fireEvent } from '@testing-library/react';
import { asMilli } from '@budgero/core/browser';
import { AvailableInfoPopover } from './AvailableInfoPopover';
import type { BudgetRow } from '../lib/budget-transforms';

vi.mock('@features/budget-planning/lib/useFormatMaskedMilli', () => ({
  useFormatMaskedMilli: () => (amount: number) => (amount / 1000).toFixed(2),
}));
vi.mock('@entities/budget/api/useMonthlyBudget', () => ({
  useUpsertAssignment: () => ({ mutate: vi.fn() }),
}));

it('shows the payment deduction separately from monthly net activity', () => {
  // YNAB observation: $80 funded, $20 paid => Activity and Available are $60.
  const item: BudgetRow = {
    id: 'card',
    name: 'Card',
    assigned: asMilli(0),
    activity: asMilli(60000),
    available: asMilli(60000),
    totalTransactions: 3,
    isGroup: false,
    categoryId: 1,
    fundingBreakdown: [],
    totalFunded: asMilli(80000),
    paymentCalculation: {
      previousAvailable: asMilli(0),
      funded: asMilli(80000),
      payments: asMilli(20000),
      refunds: asMilli(0),
    },
  };
  render(<AvailableInfoPopover item={item} globalLocalizer={new Intl.NumberFormat('en-US')} />);
  fireEvent.click(screen.getByRole('button', { name: 'Available calculation details' }));
  expect(screen.getByText('Payments made:').parentElement).toHaveTextContent('-20.00');
  expect(screen.getByText('Funded from spending:').parentElement).toHaveTextContent('80.00');
  expect(screen.getByText('Available for payment:').parentElement).toHaveTextContent('60.00');
});
