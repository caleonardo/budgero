import React, { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RecurringTransactionEditor,
  type RecurringTransactionEditorProps,
} from './RecurringTransactionEditor';

// Radix Select needs these in jsdom
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
  // mobile viewport
  Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true, writable: true });
});

const accounts = [
  { ID: 1, Name: 'Checking', Archived: false },
] as unknown as RecurringTransactionEditorProps['accounts'];
const categories = [
  { ID: 7, Name: 'Utilities' },
] as unknown as RecurringTransactionEditorProps['categories'];

function Harness({
  onSubmit,
  rerenderTick,
}: {
  onSubmit: RecurringTransactionEditorProps['onSubmit'];
  rerenderTick?: number;
}) {
  const [open, setOpen] = useState(true);
  // Mirrors RecurringTransactionsSection.openCreateDialog: initialValues held in state.
  const [initialValues] = useState<RecurringTransactionEditorProps['initialValues']>({
    direction: 'outflow',
    active: true,
    accountId: 1,
    categoryId: null,
  });
  return (
    <div data-tick={rerenderTick}>
      <RecurringTransactionEditor
        open={open}
        mode="create"
        onOpenChange={setOpen}
        accounts={accounts}
        categories={categories}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />
    </div>
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  onSubmit: ReturnType<typeof vi.fn>,
  beforeSubmit?: () => Promise<void>
) {
  await screen.findByTestId('recurring-name-input');
  await user.type(screen.getByTestId('recurring-name-input'), 'Insurance');
  await user.type(screen.getByTestId('recurring-amount-input'), '300');

  // category
  await user.click(screen.getByTestId('recurring-category-select'));
  await user.click(await screen.findByRole('option', { name: 'Utilities' }));

  // cadence
  const cadenceTrigger = screen
    .getAllByRole('combobox')
    .find((el) => /monthly/i.test(el.textContent ?? ''))!;
  expect(cadenceTrigger).toBeTruthy();
  await user.click(cadenceTrigger);
  await user.click(await screen.findByRole('option', { name: 'Quarterly' }));
  await waitFor(() => expect(cadenceTrigger).toHaveTextContent('Quarterly'));

  if (beforeSubmit) await beforeSubmit();

  await user.click(screen.getByRole('button', { name: /create recurring transaction/i }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  return onSubmit.mock.calls[0][0];
}

describe('RecurringTransactionEditor (mobile) cadence', () => {
  it('submits month:3 when Quarterly is chosen', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const values = await fillAndSubmit(user, onSubmit);
    expect(values.schedule).toEqual({
      startDate: expect.any(String),
      intervalUnit: 'month',
      intervalCount: 3,
      endDate: null,
      occurrenceCount: null,
    });
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(values.schedule.startDate).toBe(iso);
  });

  it('keeps Quarterly across parent re-renders while open', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(<Harness onSubmit={onSubmit} rerenderTick={0} />);
    const values = await fillAndSubmit(user, onSubmit, async () => {
      for (let i = 1; i <= 5; i += 1) {
        rerender(<Harness onSubmit={onSubmit} rerenderTick={i} />);
        // give any RAF-driven reset a chance to run
        await act(async () => {
          await new Promise((r) => setTimeout(r, 30));
        });
      }
    });
    expect(values.schedule.intervalCount).toBe(3);
  });

  it('submits occurrenceCount when ending after N occurrences', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const values = await fillAndSubmit(user, onSubmit, async () => {
      await user.click(screen.getByTestId('recurring-end-mode-select'));
      await user.click(await screen.findByRole('option', { name: /after n occurrences/i }));
      // Submit is blocked until a count is entered
      expect(screen.getByTestId('recurring-submit')).toBeDisabled();
      await user.type(await screen.findByTestId('recurring-occurrence-count-input'), '12');
      expect(screen.getByTestId('recurring-submit')).toBeEnabled();
    });
    expect(values.schedule.occurrenceCount).toBe(12);
    expect(values.schedule.endDate).toBeNull();
  });
});
