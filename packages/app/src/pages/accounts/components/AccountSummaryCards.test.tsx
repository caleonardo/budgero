import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountSummaryCards } from './AccountSummaryCards';

describe('AccountSummaryCards', () => {
  it('shows a recovery fallback instead of throwing for unsafe stored money', () => {
    render(
      <AccountSummaryCards
        displayBalanceToday={37_509_668_817_561_350_000}
        transactionStats={{ recentCount: 1, totalInflow: 1_000, totalOutflow: 0 }}
        displayLiabilityInfo={null}
        balanceAccountToday={0}
        formatter={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })}
      />
    );

    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
    expect(screen.getByText('$1.00')).toBeInTheDocument();
  });
});
