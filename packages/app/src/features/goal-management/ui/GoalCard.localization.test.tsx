import { act, cleanup, render } from '@testing-library/react';
import { GoalPurpose, GoalType, type Goal } from '@budgero/core/browser';
import { activateLocale, SUPPORTED_LOCALES } from '@shared/i18n';
import { asMilli } from '@shared/lib/currency/milli';
import { GoalCard } from './GoalCard';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const goal: Goal = {
  ID: 1,
  CategoryID: 1,
  Purpose: GoalPurpose.SPENDING,
  Type: GoalType.MONTHLY,
  Target: asMilli(123000),
  StartDate: '2026-09-01',
};
const props = {
  goal,
  categoryName: 'Test goal',
  currentMonth: '2026-09',
  formatter,
  finances: { available: 80000, assigned: 0, activity: 80000 },
};

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

it.each(SUPPORTED_LOCALES)(
  'renders the actual missing amount in %s goal status and recommendations',
  async (locale) => {
    await activateLocale(locale, false);
    const view = render(<GoalCard {...props} />);
    expect(view.container.textContent).not.toMatch(/[{}]/);
    // Status, recommendation, and the detailed amount all retain the $43 shortfall.
    expect(view.container.textContent?.match(/\$43\.00/g)?.length).toBeGreaterThanOrEqual(3);
    if (locale === 'en') {
      expect(view.container).toHaveTextContent('Need $43.00 more available');
      expect(view.container).toHaveTextContent('Assign $43.00 to reach your target');
    }
  }
);

it('keeps amounts in the budget currency when the display language changes', async () => {
  await activateLocale('en', false);
  const view = render(<GoalCard {...props} />);
  await act(() => activateLocale('de', false));
  expect(view.container).toHaveTextContent('$43.00');
  expect(view.container.textContent).not.toMatch(/[{}]/);
  expect(view.container).not.toHaveTextContent('Need');
});
