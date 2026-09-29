import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClearedToggle } from './ClearedToggle';

const mutate = vi.fn();
vi.mock('@entities/transaction/api/useTransactions', () => ({
  useSetTransactionsCleared: () => ({ mutate, isPending: false }),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  cleanup();
  mutate.mockReset();
});

describe('ClearedToggle', () => {
  it('marks an uncleared transaction cleared', async () => {
    const user = userEvent.setup();
    render(<ClearedToggle transactionId={7} cleared={false} />);

    const toggle = screen.getByRole('button', { name: 'Uncleared — mark as cleared' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);

    expect(mutate).toHaveBeenCalledWith({ ids: [7], cleared: true }, expect.any(Object));
  });

  it('marks a cleared transaction uncleared', async () => {
    const user = userEvent.setup();
    render(<ClearedToggle transactionId={7} cleared />);

    const toggle = screen.getByRole('button', { name: 'Cleared — mark as uncleared' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);

    expect(mutate).toHaveBeenCalledWith({ ids: [7], cleared: false }, expect.any(Object));
  });
});
