import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { asMilli, NodeSqlJsAdapter, ServiceManager, type Services } from '../src';

describe('Income category management', () => {
  let db: NodeSqlJsAdapter;
  let services: Services;
  let budgetId: number;
  let groupId: number;
  let incomeId: number;

  beforeEach(async () => {
    db = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(db);
    services = manager.getServices();
    budgetId = await services.budgets.createBudget({
      name: 'Household',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: false,
    });
    groupId = services.categories.getCategoryGroupByName('Income', budgetId)!.ID;
    incomeId = services.categories.getCategoriesByGroup(budgetId, groupId)[0].ID;
  });
  afterEach(() => db.close());

  it('adds and renames custom sources while rejecting blank and duplicate income names', () => {
    const { categories } = services;
    const salary = categories.addCategory(groupId, budgetId, '  Salary  ');
    expect(categories.getCategory(salary).Name).toBe('Salary');
    categories.updateCategoryName(salary, '  Freelance ');
    expect(categories.getCategory(salary).Name).toBe('Freelance');
    expect(() => categories.addCategory(groupId, budgetId, ' ')).toThrow('cannot be empty');
    expect(() => categories.addCategory(groupId, budgetId, ' freelance ')).toThrow(
      'already exists'
    );
    expect(() => categories.updateCategoryName(salary, ' income ')).toThrow('already exists');
    expect(() => categories.updateCategoryName(salary, ' ')).toThrow('cannot be empty');
    expect(() => categories.addCategory(groupId, budgetId + 100, 'Salary')).toThrow(
      'selected budget'
    );
    categories.deleteCategory(salary);
    expect(categories.getCategoriesByGroup(budgetId, groupId).map((item) => item.Name)).toEqual([
      'Income',
    ]);
  });

  it('protects the default Income category and its group through every edit/delete route', () => {
    const { categories } = services;
    const spendingGroup = categories.addCategoryGroup('Spending', budgetId);
    expect(() => categories.updateCategoryName(incomeId, 'Salary')).toThrow('system Income');
    expect(() => categories.updateCategory(incomeId, spendingGroup, 'Salary', '')).toThrow(
      'system Income'
    );
    expect(() => categories.moveCategoryToNewGroup(spendingGroup, incomeId)).toThrow(
      'system Income'
    );
    expect(() => categories.updateCategoryExcludeFromBudgetPace(incomeId, true)).toThrow(
      'system Income'
    );
    expect(() => categories.deleteCategory(incomeId)).toThrow('system Income');
    expect(() => categories.updateCategoryGroup(groupId, 'Earnings')).toThrow('system Income');
    expect(() => categories.deleteCategoryGroup(groupId)).toThrow('system Income');
    expect(categories.getCategory(incomeId).Name).toBe('Income');
  });

  it.each(['cumulative', 'monthly'] as const)(
    'counts custom income equally in %s mode and keeps totals after reassignment/deletion',
    async (mode) => {
      const { categories, accounts, transactions, monthlyBudgets, budgets } = services;
      budgets.updateRtaMode(budgetId, mode);
      const salary = categories.addCategory(groupId, budgetId, 'Salary');
      const other = categories.addCategory(groupId, budgetId, 'Freelance');
      const account = await accounts.createAccount('Checking', budgetId, 'checking', 'USD', 0);
      for (const [categoryId, amount] of [
        [salary, 2_000_000],
        [other, 500_000],
        [incomeId, 100_000],
      ]) {
        await transactions.addTransaction(
          asMilli(amount),
          0,
          account.ID,
          categoryId,
          budgetId,
          '2024-02-05',
          ''
        );
      }
      expect(monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(2_600_000);
      categories.updateCategoryName(salary, 'Main salary');
      expect(monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(2_600_000);
      // Match the existing Planning flow, including merging assignments from the same month.
      monthlyBudgets.upsertMonthlyAssignment(salary, asMilli(20_000), '2024-02', budgetId);
      monthlyBudgets.upsertMonthlyAssignment(other, asMilli(30_000), '2024-02', budgetId);
      const before = monthlyBudgets.getReadyToAssign(budgetId, '2024-02');
      transactions.reassignTransactions(other, salary);
      monthlyBudgets.reassignAssignment(other, salary);
      categories.deleteCategory(salary);
      expect(monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(before);
      expect(monthlyBudgets.getMonthlyAssignmentValue(other, '2024-02', budgetId)).toBe(50_000);
      expect(transactions.getAllTransactions(budgetId)).toHaveLength(3);
    }
  );

  it('reassigns split lines and scheduled transactions before deleting a source', async () => {
    const { categories, accounts, transactions, splits, recurring } = services;
    const salary = categories.addCategory(groupId, budgetId, 'Salary');
    const account = await accounts.createAccount('Checking', budgetId, 'checking', 'USD', 0);
    const parent = await transactions.addTransaction(
      asMilli(300_000),
      0,
      account.ID,
      salary,
      budgetId,
      '2024-02-05',
      ''
    );
    await splits.upsertSplits(parent, [
      {
        CategoryID: salary,
        Memo: 'Salary',
        InflowConverted: asMilli(200_000),
        OutflowConverted: asMilli(0),
        OrderIndex: 0,
      },
      {
        CategoryID: incomeId,
        Memo: 'Other',
        InflowConverted: asMilli(100_000),
        OutflowConverted: asMilli(0),
        OrderIndex: 1,
      },
    ]);
    const template = await recurring.createRecurringTransaction({
      budgetId,
      accountId: account.ID,
      categoryId: salary,
      name: 'Payday',
      amount: asMilli(200_000),
      direction: 'inflow',
      schedule: { startDate: '2024-03-01', intervalUnit: 'month' },
    });
    const before = splits.getSplits(parent);
    transactions.reassignTransactions(incomeId, salary);
    categories.deleteCategory(salary);
    expect(splits.getSplits(parent)).toEqual(
      before.map((split) => ({ ...split, CategoryID: incomeId, CategoryName: 'Income' }))
    );
    expect(recurring.getRecurringTransaction(template.id).categoryId).toBe(incomeId);
    expect(db.exec('PRAGMA foreign_key_check')).toEqual([]);
  });

  it('rejects reassignment into another budget before touching transaction history', async () => {
    const otherBudget = await services.budgets.createBudget({
      name: 'Other',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
    });
    const otherIncome = services.categories.getCategoryByName('Income', otherBudget)!.ID;
    expect(() => services.transactions.reassignTransactions(otherIncome, incomeId)).toThrow(
      'same budget'
    );
  });
});
