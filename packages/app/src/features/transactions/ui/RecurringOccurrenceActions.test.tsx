import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecurringOccurrenceActions } from './RecurringOccurrenceActions';

const markReady = vi.fn();
const skip = vi.fn();
vi.mock('@entities/recurring/api/useRecurringTransactions', () => ({
  useMarkRecurringOccurrenceReady: () => ({ mutate: markReady, isPending: false }),
  useSkipRecurringOccurrence: () => ({ mutate: skip, isPending: false }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  markReady.mockReset();
  skip.mockReset();
});

describe('RecurringOccurrenceActions', () => {
  it('marks the occurrence ready or skips it', async () => {
    const user = userEvent.setup();
    render(<RecurringOccurrenceActions occurrenceId={12} />);

    await user.click(screen.getByRole('button', { name: 'Mark ready' }));
    expect(markReady).toHaveBeenCalledWith({ occurrenceId: 12 }, expect.any(Object));

    await user.click(screen.getByRole('button', { name: 'Skip this time' }));
    expect(skip).toHaveBeenCalledWith({ id: 12 }, expect.any(Object));
  });
});
