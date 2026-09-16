import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { activateLocale } from '@shared/i18n';
import { FromAccountSelect, ToAccountSelect } from './AccountSelect';

const accounts = [
  { ID: 1, Name: 'Daily Checking', Currency: 'USD' },
  { ID: 2, Name: 'Emergency Savings', Currency: 'USD' },
  { ID: 3, Name: 'Travel Card', Currency: 'EUR' },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserverMock {
      observe() {}

      unobserve() {}

      disconnect() {}
    },
  });
});

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

describe('transaction account selectors', () => {
  it('translates empty account prompts for expenses and transfers', async () => {
    await activateLocale('de', false);
    const props = { value: '', onChange: vi.fn(), accounts, isLoading: false };
    const view = render(<FromAccountSelect {...props} transactionType="outflow" />);
    expect(screen.getByRole('combobox', { name: 'Konto auswählen' })).toBeInTheDocument();
    view.rerender(<FromAccountSelect {...props} transactionType="transfer" />);
    expect(screen.getByRole('combobox', { name: 'Ausgangskonto auswählen' })).toBeInTheDocument();
    view.rerender(<ToAccountSelect {...props} excludeAccountId="1" />);
    expect(screen.getByRole('combobox', { name: 'Zielkonto auswählen' })).toBeInTheDocument();
  });

  it('searches account names and selects the matching source account', () => {
    const onChange = vi.fn();
    render(
      <FromAccountSelect
        value=""
        onChange={onChange}
        accounts={accounts}
        isLoading={false}
        transactionType="outflow"
      />
    );

    fireEvent.click(screen.getByTestId('transaction-from-account-select'));
    fireEvent.change(screen.getByPlaceholderText('Search accounts…'), {
      target: { value: 'emergency' },
    });

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Emergency Savings')).toBeInTheDocument();
    expect(within(listbox).queryByText('Daily Checking')).not.toBeInTheDocument();

    fireEvent.click(within(listbox).getByText('Emergency Savings'));
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('keeps the source account out of the searchable transfer destination list', () => {
    render(
      <ToAccountSelect
        value=""
        onChange={vi.fn()}
        accounts={accounts}
        excludeAccountId="1"
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByTestId('transaction-to-account-select'));
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).queryByText('Daily Checking')).not.toBeInTheDocument();
    expect(within(listbox).getByText('Emergency Savings')).toBeInTheDocument();
  });
});
