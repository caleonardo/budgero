import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Account } from '@budgero/core/browser';
import { ReconcileAccountDialog } from './ReconcileAccountDialog';

const reconcile = vi.fn();
vi.mock('@entities/transaction/api/useTransactions', () => ({
  useReconcileAccount: () => ({ mutateAsync: reconcile, isPending: false }),
}));
vi.mock('@entities/category/api/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const account = {
  ID: 7,
  Name: 'Checking',
  Currency: 'USD',
  Type: 'Checking',
  BudgetID: 3,
  BalanceNative: 1250000,
  UnclearedNative: 250000,
} as unknown as Account;

describe('ReconcileAccountDialog', () => {
  it('fills the actual balance from the cleared balance in one click', async () => {
    const user = userEvent.setup();
    render(<ReconcileAccountDialog account={account} budgetId={3} />);

    await user.click(screen.getByRole('button', { name: 'Reconcile' }));
    expect(screen.queryByText(/Balances match/)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Use the cleared balance as the actual balance' })
    );

    expect(screen.getByText(/Balances match/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reconcile Account' })).toBeEnabled();
  });
});
