import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';

function isoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

async function setup() {
  const adapter = await NodeSqlJsAdapter.create();
  const sm = new ServiceManager();
  await sm.initialize(adapter as DatabaseAdapter);
  const services = sm.getServices();

  const budgetId = await services.budgets.createBudget({
    name: 'Schedule change',
    display_currency: 'USD',
    badge_icon: 'dollar',
    number_format: '123,456.78',
    create_default_categories: true,
  });

  const account = await services.accounts.createAccount(
    'Checking',
    budgetId,
    'checking',
    'USD',
    0,
    {},
    true
  );

  const groupId = services.categories.addCategoryGroup('Bills Group', budgetId);
  const categoryId = services.categories.addCategory(groupId, budgetId, 'Utilities');

  return { services, budgetId, account, categoryId };
}

describe('RecurringTransactionService schedule changes', () => {
  it('replaces pending occurrences when the frequency changes (monthly → quarterly)', async () => {
    const { services, budgetId, account, categoryId } = await setup();
    const today = new Date();
    const start = isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 15)));

    const template = await services.recurring.createRecurringTransaction({
      budgetId,
      accountId: account.ID,
      categoryId,
      name: 'Insurance',
      amount: 300,
      direction: 'outflow',
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 1 },
    });

    const monthly = services.recurring.listOccurrences(budgetId, { status: 'scheduled' });
    expect(monthly.length).toBeGreaterThanOrEqual(5);

    await services.recurring.updateRecurringTransaction(template.id, {
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 3 },
    });

    const quarterly = services.recurring
      .listOccurrences(budgetId, { status: 'scheduled' })
      .map((o) => o.dueDate)
      .sort();

    expect(quarterly[0]).toBe(start);
    for (let i = 1; i < quarterly.length; i += 1) {
      expect(monthDiff(quarterly[i - 1], quarterly[i])).toBe(3);
    }
    expect(quarterly.length).toBeGreaterThanOrEqual(2);
    expect(quarterly.length).toBeLessThanOrEqual(3);
  });

  it('keeps posted/skipped occurrences and continues the new rhythm from the start date', async () => {
    const { services, budgetId, account, categoryId } = await setup();
    const today = new Date();
    const start = isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));

    const template = await services.recurring.createRecurringTransaction({
      budgetId,
      accountId: account.ID,
      categoryId,
      name: 'Rent',
      amount: 1000,
      direction: 'outflow',
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 1 },
    });

    const first = services.recurring
      .listOccurrences(budgetId, { status: 'scheduled' })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    await services.recurring.skipOccurrence(first.id);

    await services.recurring.updateRecurringTransaction(template.id, {
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 2 },
    });

    const skipped = services.recurring.listOccurrences(budgetId, { status: 'skipped' });
    expect(skipped.map((o) => o.dueDate)).toEqual([start]);

    const pending = services.recurring
      .listOccurrences(budgetId, { status: 'scheduled' })
      .map((o) => o.dueDate)
      .sort();
    // Skipped occurrence was on `start`; next on the bi-monthly rhythm is start + 2 months.
    expect(monthDiff(start, pending[0])).toBe(2);
    for (let i = 1; i < pending.length; i += 1) {
      expect(monthDiff(pending[i - 1], pending[i])).toBe(2);
    }
  });
});

describe('RecurringTransactionService series limits', () => {
  it('stops after occurrenceCount, counting from the start date', async () => {
    const { services, budgetId, account, categoryId } = await setup();
    const today = new Date();
    const start = isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));

    const template = await services.recurring.createRecurringTransaction({
      budgetId,
      accountId: account.ID,
      categoryId,
      name: 'Loan',
      amount: 250,
      direction: 'outflow',
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 1, occurrenceCount: 3 },
    });
    expect(template.schedule.occurrenceCount).toBe(3);

    const dates = services.recurring
      .listOccurrences(budgetId)
      .map((o) => o.dueDate)
      .sort();
    expect(dates).toHaveLength(3);
    expect(dates[0]).toBe(start);
    expect(monthDiff(dates[0], dates[2])).toBe(2);

    // Skipping one and regenerating must not add a 4th.
    const first = services.recurring.listOccurrences(budgetId, { status: 'scheduled' })[0];
    await services.recurring.skipOccurrence(first.id);
    services.recurring.ensureOccurrencesThrough(
      budgetId,
      isoDate(new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1)))
    );
    expect(services.recurring.listOccurrences(budgetId)).toHaveLength(3);
  });

  it('stops at endDate and shrinks a series when the end is edited earlier', async () => {
    const { services, budgetId, account, categoryId } = await setup();
    const today = new Date();
    const start = isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
    const endMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 4, 1));
    const end = isoDate(endMonth);

    const template = await services.recurring.createRecurringTransaction({
      budgetId,
      accountId: account.ID,
      categoryId,
      name: 'Course',
      amount: 90,
      direction: 'outflow',
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 1, endDate: end },
    });
    expect(services.recurring.listOccurrences(budgetId)).toHaveLength(5);

    await services.recurring.updateRecurringTransaction(template.id, {
      schedule: { startDate: start, intervalUnit: 'month', intervalCount: 1, occurrenceCount: 2 },
    });
    const dates = services.recurring
      .listOccurrences(budgetId)
      .map((o) => o.dueDate)
      .sort();
    expect(dates).toEqual([
      start,
      isoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1))),
    ]);
  });

  it('rejects an end date before the start and a non-positive count', async () => {
    const { services, budgetId, account, categoryId } = await setup();
    const base = {
      budgetId,
      accountId: account.ID,
      categoryId,
      name: 'Bad',
      amount: 1,
      direction: 'outflow' as const,
    };
    await expect(
      services.recurring.createRecurringTransaction({
        ...base,
        schedule: { startDate: '2026-09-01', intervalUnit: 'month', endDate: '2026-08-01' },
      })
    ).rejects.toThrow(/End date/);
    await expect(
      services.recurring.createRecurringTransaction({
        ...base,
        schedule: { startDate: '2026-09-01', intervalUnit: 'month', occurrenceCount: 0 },
      })
    ).rejects.toThrow(/Occurrence count/);
  });
});
