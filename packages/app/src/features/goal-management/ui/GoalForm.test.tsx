import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalType, GoalPurpose, type Goal } from '@budgero/core/browser';
import { asMilli } from '@shared/lib/currency/milli';
import { GoalForm } from './GoalForm';

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const yearlyGoal: Goal = {
  ID: 7,
  Type: GoalType.TARGET_DATE,
  Purpose: GoalPurpose.SAVINGS,
  CategoryID: 3,
  Target: asMilli(300_000),
  StartDate: '2026-01-01',
  TargetDate: '2026-12-31',
  Recurring: true,
  CycleMonths: null,
};

function renderForm(goal: Goal | null, onSave = vi.fn().mockResolvedValue(undefined)) {
  render(
    <GoalForm
      goal={goal}
      categoryId={3}
      categoryName="Insurance"
      budgetId={1}
      currentMonth="2026-08"
      formatter={formatter}
      onSave={onSave}
      onCancel={() => {}}
    />
  );
  return onSave;
}

async function pickRepeat(user: ReturnType<typeof userEvent.setup>, optionName: RegExp) {
  await user.click(screen.getByTestId('goal-repeat-select'));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('GoalForm repeats control', () => {
  it('pre-fills Yearly for a legacy recurring goal and can switch to Quarterly', async () => {
    const user = userEvent.setup();
    const onSave = renderForm(yearlyGoal);
    expect(screen.getByTestId('goal-repeat-select')).toHaveTextContent('Yearly');

    await pickRepeat(user, /quarterly/i);
    // Live preview from the core cycle function: viewing Aug 2026 with a Dec 31 anchor
    expect(screen.getByTestId('goal-cycle-preview')).toHaveTextContent('Jul 2026 – Sep 2026');
    expect(screen.getByTestId('goal-cycle-preview')).toHaveTextContent('September 30th, 2026');

    await user.click(screen.getByRole('button', { name: /save|update|create/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toMatchObject({ Recurring: true, CycleMonths: 3 });
  });

  it('custom cadence: blocks invalid values and submits a valid one', async () => {
    const user = userEvent.setup();
    const onSave = renderForm(yearlyGoal);
    await pickRepeat(user, /every n months/i);
    const input = await screen.findByTestId('goal-repeat-custom-input');

    await user.type(input, '1');
    // Native constraint validation (min=2) blocks the submit before our handler.
    expect((input as HTMLInputElement).validity.valid).toBe(false);
    await user.click(screen.getByRole('button', { name: /save|update|create/i }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByTestId('goal-cycle-preview')).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '4');
    expect(screen.getByTestId('goal-cycle-preview')).toHaveTextContent('Repeats every 4 months');
    await user.click(screen.getByRole('button', { name: /save|update|create/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toMatchObject({ Recurring: true, CycleMonths: 4 });
  });

  it('Never → Recurring false and CycleMonths null', async () => {
    const user = userEvent.setup();
    const onSave = renderForm({ ...yearlyGoal, CycleMonths: 6 });
    expect(screen.getByTestId('goal-repeat-select')).toHaveTextContent('Every 6 months');
    await pickRepeat(user, /never/i);
    expect(screen.queryByTestId('goal-cycle-preview')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /save|update|create/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toMatchObject({ Recurring: false, CycleMonths: null });
  });
});
