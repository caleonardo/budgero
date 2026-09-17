import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { activateLocale } from '@shared/i18n';
import { Dialog } from '@shared/ui/dialog';
import { TransactionFormHeader } from './TransactionFormHeader';

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

describe('TransactionFormHeader', () => {
  it('translates the default heading and updates it when the language changes', async () => {
    await activateLocale('de', false);
    render(
      <Dialog open>
        <TransactionFormHeader
          rememberLast={false}
          onRememberLastChange={vi.fn()}
          recurringEnabled={false}
          onRecurringEnabledChange={vi.fn()}
        />
      </Dialog>
    );
    expect(
      screen.getByRole('heading', { name: 'Neue Transaktion hinzufügen' })
    ).toBeInTheDocument();
    await act(() => activateLocale('fr', false));
    expect(screen.getByRole('heading', { name: 'Ajouter une transaction' })).toBeInTheDocument();
  });

  it('allows a new transaction to be changed into a recurring template', async () => {
    const user = userEvent.setup();
    const onRecurringEnabledChange = vi.fn();

    render(
      <Dialog open>
        <TransactionFormHeader
          rememberLast
          onRememberLastChange={vi.fn()}
          recurringEnabled={false}
          onRecurringEnabledChange={onRecurringEnabledChange}
        />
      </Dialog>
    );

    await user.click(screen.getByLabelText('Make recurring'));

    expect(onRecurringEnabledChange).toHaveBeenCalledWith(true);
  });

  it('keeps recurring mode locked while editing a template', () => {
    render(
      <Dialog open>
        <TransactionFormHeader
          rememberLast={false}
          onRememberLastChange={vi.fn()}
          recurringEnabled
          onRecurringEnabledChange={vi.fn()}
          recurringLocked
          showRememberLast={false}
        />
      </Dialog>
    );

    expect(screen.getByLabelText('Make recurring')).toBeDisabled();
    expect(screen.queryByLabelText(/remember last/i)).not.toBeInTheDocument();
  });
});
