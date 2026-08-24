import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CurrencyConversionNotice } from './CurrencyConversionNotice';

vi.mock('@shared/hooks/useIsMobile', () => ({ useIsMobile: () => false }));

describe('CurrencyConversionNotice', () => {
  it('shows the optional received amount and can restore the suggested conversion', async () => {
    const onReceivedAmountChange = vi.fn();
    render(
      <CurrencyConversionNotice
        amount={1_000_000}
        convertedAmount={910_000}
        isLoadingRate={false}
        fromCurrency="USD"
        toCurrency="EUR"
        canUseCurrencyApi
        exchangeRate={0.91}
        receivedAmount={900_000}
        onReceivedAmountChange={onReceivedAmountChange}
        onEditingChange={vi.fn()}
        localizer={new Intl.NumberFormat('en-US')}
      />
    );

    expect(screen.getByText('Received amount (EUR)')).toBeInTheDocument();
    expect(screen.getByTestId('transfer-received-amount')).toBeInTheDocument();
    expect(screen.getByText(/implied exchange rate/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Use suggested' }));
    expect(onReceivedAmountChange).toHaveBeenCalledWith(null);
  });
});
