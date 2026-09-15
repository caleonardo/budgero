import { describe, expect, it } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager } from '../src';

async function open(data?: Uint8Array) {
  const adapter = await NodeSqlJsAdapter.create(data);
  const manager = new ServiceManager();
  await manager.initialize(adapter);
  return { adapter, userMeta: manager.getServices().userMeta };
}

describe('calendar week start persistence', () => {
  it('upgrades an existing workspace without changing other preferences, and survives reopening', async () => {
    const original = await open();
    original.userMeta.setAllowOverAssignment(true);
    // Recreate the schema before the week-start preference was introduced.
    original.adapter.exec('ALTER TABLE user_meta DROP COLUMN WeekStartsOn');
    original.adapter.exec('DELETE FROM schema_migrations WHERE version = 64');
    const olderBackup = await original.adapter.backup();
    original.adapter.close();

    const upgraded = await open(olderBackup);
    expect(upgraded.userMeta.getWeekStartsOn()).toBe(0);
    expect(upgraded.userMeta.getAllowOverAssignment()).toBe(true);
    upgraded.userMeta.setWeekStartsOn(1);
    const backup = await upgraded.adapter.backup();
    upgraded.adapter.close();

    const reopened = await open(backup);
    expect(reopened.userMeta.getWeekStartsOn()).toBe(1);
    expect(reopened.userMeta.getAllowOverAssignment()).toBe(true);
    expect(() => reopened.userMeta.setWeekStartsOn(7 as 0)).toThrow();
    expect(reopened.userMeta.getWeekStartsOn()).toBe(1);
    reopened.userMeta.setWeekStartsOn(0);
    expect(reopened.userMeta.getWeekStartsOn()).toBe(0);
    reopened.adapter.close();
  });
});

describe('weekly analytics', () => {
  it('moves Sunday into the selected week consistently across report totals', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter);
    const { budgets, accounts, categories, transactions, analytics, userMeta } =
      manager.getServices();
    const budgetId = await budgets.createBudget({
      name: 'Weeks',
      display_currency: 'USD',
      badge_icon: 'coin',
      number_format: '1,234.56',
      create_default_categories: false,
    });
    const account = await accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0,
      {},
      true
    );
    const group = categories.addCategoryGroup('Expenses', budgetId);
    const category = categories.addCategory(group, budgetId, 'Food');
    await transactions.addTransaction(
      0,
      1000,
      account.ID,
      category,
      budgetId,
      '2023-01-01',
      'Sunday'
    );
    await transactions.addTransaction(
      0,
      2000,
      account.ID,
      category,
      budgetId,
      '2023-01-02',
      'Monday'
    );

    for (const weekStartsOn of [0, 1] as const) {
      userMeta.setWeekStartsOn(weekStartsOn);
      const totals = analytics.getIncomeExpenseByPeriod(
        '2023-01-01',
        '2023-01-07',
        budgetId,
        'week'
      );
      const spending = analytics.getSpendingTotalsByPeriod(
        '2023-01-01',
        '2023-01-07',
        budgetId,
        'week'
      );
      const byCategory = analytics.getCategoryTotalsByPeriod(
        '2023-01-01',
        '2023-01-07',
        budgetId,
        'week'
      );
      const expected =
        weekStartsOn === 0
          ? [['2023-01-01', '2023-01-07', 3000]]
          : [
              ['2022-12-26', '2023-01-01', 1000],
              ['2023-01-02', '2023-01-08', 2000],
            ];
      expect(totals.map((r) => [r.PeriodStart, r.PeriodEnd, r.TotalExpense])).toEqual(expected);
      expect(spending.map((r) => [r.PeriodStart, r.PeriodEnd, r.TotalSpending])).toEqual(expected);
      expect(byCategory.map((r) => [r.PeriodStart, r.PeriodEnd, r.TotalOutflow])).toEqual(expected);
    }
    adapter.close();
  });
});
