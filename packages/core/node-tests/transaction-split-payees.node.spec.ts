import { beforeEach, describe, expect, it } from 'vitest';
import { asMilli, NodeSqlJsAdapter, ServiceManager, type Services } from '../src';

describe('split transaction payees', () => {
  let adapter: NodeSqlJsAdapter;
  let services: Services;
  let budgetId: number;
  let accountId: number;
  let firstCategoryId: number;
  let secondCategoryId: number;
  let parentId: number;

  beforeEach(async () => {
    adapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter);
    services = manager.getServices();

    budgetId = await services.budgets.createBudget({
      name: 'Split payees',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    accountId = (
      await services.accounts.createAccount('Checking', budgetId, 'checking', 'USD', asMilli(0))
    ).ID;
    const spendingCategories = services.categories
      .getAllCategories(budgetId)
      .filter((category) => !['Income', 'Uncategorized', 'Transfers'].includes(category.Name));
    firstCategoryId = spendingCategories[0].ID;
    secondCategoryId = spendingCategories[1].ID;
    parentId = await services.transactions.addTransaction(
      asMilli(0),
      asMilli(200_000),
      accountId,
      firstCategoryId,
      budgetId,
      '2026-08-30',
      'Parent memo',
      '',
      'Parent payee'
    );
  });

  async function saveDistinctPayees() {
    await services.splits.upsertSplits(parentId, [
      {
        CategoryID: firstCategoryId,
        Memo: 'First memo',
        Payee: 'First shop',
        InflowConverted: asMilli(0),
        OutflowConverted: asMilli(100_000),
        InflowNative: asMilli(0),
        OutflowNative: asMilli(100_000),
        OrderIndex: 0,
      },
      {
        CategoryID: secondCategoryId,
        Memo: 'Second memo',
        Payee: 'Second shop',
        InflowConverted: asMilli(0),
        OutflowConverted: asMilli(100_000),
        InflowNative: asMilli(0),
        OutflowNative: asMilli(100_000),
        OrderIndex: 1,
      },
    ]);
  }

  it('migrates the split table and round-trips a payee on every line', async () => {
    const columns = adapter.exec('PRAGMA table_info(transaction_splits)')[0]?.values ?? [];
    expect(columns.some((column) => column[1] === 'Payee')).toBe(true);

    await saveDistinctPayees();

    expect(
      services.splits.getSplits(parentId).map((split) => ({
        payee: split.Payee,
        memo: split.Memo,
        categoryId: split.CategoryID,
        amount: split.OutflowNative,
      }))
    ).toEqual([
      {
        payee: 'First shop',
        memo: 'First memo',
        categoryId: firstCategoryId,
        amount: 100_000,
      },
      {
        payee: 'Second shop',
        memo: 'Second memo',
        categoryId: secondCategoryId,
        amount: 100_000,
      },
    ]);
  });

  it('uses line payees in expanded transactions, analytics, and category memory', async () => {
    await saveDistinctPayees();

    const expanded = services.transactions
      .getAllTransactionsAnalytics(budgetId)
      .filter((transaction) => transaction.ID === parentId);
    expect(expanded.map((transaction) => transaction.Payee)).toEqual(['First shop', 'Second shop']);

    const spending = services.analytics.getSpendingByPayees(
      '2026-08-01',
      '2026-08-31',
      budgetId
    ) as { Payee: string; Spending: number }[];
    expect(spending.find((row) => row.Payee === 'First shop')?.Spending).toBe(100_000);
    expect(spending.find((row) => row.Payee === 'Second shop')?.Spending).toBe(100_000);
    const directory = services.payees.getPayeesWithUsage(budgetId);
    expect(directory.find((payee) => payee.Name === 'First shop')?.UsageCount).toBe(1);
    expect(directory.find((payee) => payee.Name === 'Second shop')?.UsageCount).toBe(1);
    expect(services.payees.getLastCategoryForPayee(budgetId, 'Second shop')?.CategoryID).toBe(
      secondCategoryId
    );
  });

  it('inherits a parent payee for blank legacy lines and includes line payees in rename/delete', async () => {
    await services.splits.upsertSplits(parentId, [
      {
        CategoryID: firstCategoryId,
        Memo: 'Inherited',
        InflowConverted: asMilli(0),
        OutflowConverted: asMilli(100_000),
        InflowNative: asMilli(0),
        OutflowNative: asMilli(100_000),
        OrderIndex: 0,
      },
      {
        CategoryID: secondCategoryId,
        Memo: 'Explicit',
        Payee: 'Line shop',
        InflowConverted: asMilli(0),
        OutflowConverted: asMilli(100_000),
        InflowNative: asMilli(0),
        OutflowNative: asMilli(100_000),
        OrderIndex: 1,
      },
    ]);

    const expanded = services.transactions
      .getAllTransactionsAnalytics(budgetId)
      .filter((transaction) => transaction.ID === parentId);
    expect(expanded.map((transaction) => transaction.Payee)).toEqual(['Parent payee', 'Line shop']);

    expect(services.payees.renamePayee(budgetId, 'Line shop', 'Renamed shop')).toEqual({
      updated: 1,
    });
    expect(services.splits.getSplits(parentId)[1].Payee).toBe('Renamed shop');
    expect(services.payees.deletePayee(budgetId, 'Renamed shop')).toEqual({ cleared: 1 });
    expect(services.splits.getSplits(parentId)[1].Payee).toBe('');
  });
});
