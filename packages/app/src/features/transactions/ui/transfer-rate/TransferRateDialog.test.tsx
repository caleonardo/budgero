import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransferRateDialog } from './TransferRateDialog';

const mocks = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock('@entities/transaction/api/useTransactions', () => ({
  useTransferRateDetails: () => ({
    data: {
      transferId: 'transfer-1',
      date: '2026-08-30',
      budgetId: 7,
      budgetCurrency: 'USD',
      source: {
        transactionId: 1,
        accountId: 10,
        accountName: 'Euro account',
        currency: 'EUR',
        amount: 100_000,
        budgetAmount: 115_000,
        budgetRate: 1.15,
        rateOverride: false,
      },
      destination: {
        transactionId: 2,
        accountId: 11,
        accountName: 'Dinar account',
        currency: 'RSD',
        amount: 11_700_000,
        budgetAmount: 115_000,
        budgetRate: 0.0098290598,
        rateOverride: false,
      },
      rate: 117,
      transferRateOverride: false,
      hasRateOverride: false,
    },
    isLoading: false,
  }),
  useUpdateTransferRate: () => ({ mutateAsync: mocks.update, isPending: false }),
}));

describe('TransferRateDialog', () => {
  beforeEach(() => mocks.update.mockReset().mockResolvedValue(undefined));

  it('distinguishes the direct transfer rate from both budget rates and edits it', async () => {
    const user = userEvent.setup();
    render(<TransferRateDialog transferId="transfer-1" />);

    await user.click(screen.getByRole('button', { name: /transfer rate/i }));

    expect(screen.getByText('100.00 EUR')).toBeInTheDocument();
    expect(screen.getByText('11700.00 RSD')).toBeInTheDocument();
    expect(screen.getByText('Budget valuation')).toBeInTheDocument();
    expect(screen.getByText(/1 EUR = 1.15 USD/)).toBeInTheDocument();

    const input = screen.getByLabelText('1 EUR equals');
    await user.clear(input);
    await user.type(input, '118.25');
    await user.click(screen.getByRole('button', { name: 'Save rate' }));

    expect(mocks.update).toHaveBeenCalledWith({ transferId: 'transfer-1', rate: 118.25 });
  });
});
