import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RecurringTransaction } from '@budgero/core/browser';
import { RecurringTemplateCard } from './RecurringTemplateCard';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: ResizeObserverMock,
  });
});

const longMemo = 'A recurring transaction memo that is much wider than its card'.repeat(4);

const template: RecurringTransaction = {
  id: 1,
  budgetId: 1,
  accountId: 1,
  toAccountId: null,
  categoryId: 1,
  name: 'Monthly bill',
  memo: longMemo,
  amount: 123_000 as RecurringTransaction['amount'],
  direction: 'outflow',
  schedule: {
    startDate: '2026-08-26',
    intervalUnit: 'month',
    intervalCount: 1,
  },
  notifyDaysBefore: 0,
  lastOccurrenceDate: null,
  active: true,
  createdAt: '2026-08-26T00:00:00.000Z',
  updatedAt: '2026-08-26T00:00:00.000Z',
};

describe('RecurringTemplateCard', () => {
  it('truncates long memos and exposes the full text on hover', async () => {
    const user = userEvent.setup();
    render(
      <RecurringTemplateCard
        template={template}
        accountName="Checking"
        categoryName="Bills"
        nextOccurrence={undefined}
        localizer={{ format: (value) => String(value) }}
        isProcessing={false}
        isTogglePending={false}
        onToggleActive={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const memo = screen.getByText(longMemo);
    expect(memo).toHaveClass('truncate');

    await user.hover(memo);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(longMemo);
  });
});
