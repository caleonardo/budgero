import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AccountCurrencyChangeMode } from '@entities/account/api/useAccounts';
import { AccountCurrencyChangeDialog } from './AccountCurrencyChangeDialog';

function DialogHarness({ onConfirm }: { onConfirm: () => void }) {
  const [mode, setMode] = useState<AccountCurrencyChangeMode>('convert');
  return (
    <AccountCurrencyChangeDialog
      open
      onOpenChange={() => {}}
      accountName="Travel"
      oldCurrency="USD"
      newCurrency="EUR"
      mode={mode}
      onModeChange={setMode}
      hasLinkedTransfers
      isLoading={false}
      onConfirm={onConfirm}
    />
  );
}

describe('AccountCurrencyChangeDialog', () => {
  it('defaults to value conversion and allows choosing number reinterpretation', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DialogHarness onConfirm={onConfirm} />);

    expect(screen.getByRole('radio', { name: /convert existing amounts/i })).toBeChecked();
    expect(screen.queryByText(/contains transfers/i)).not.toBeInTheDocument();

    await user.click(screen.getByText('Keep the numbers'));

    expect(screen.getByRole('radio', { name: /keep the numbers/i })).toBeChecked();
    expect(screen.getByText(/contains transfers/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Change currency' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
