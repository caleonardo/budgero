import { describe, it, expect, beforeEach } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, Services, Category } from '../src';

/**
 * Category memory: "Autofill category from the payee's last transaction".
 * The add-transaction form pre-fills the category with whatever the payee was
 * filed under most recently — so the lookup has to agree with a human's idea
 * of "last time", and stay quiet when there is no real history.
 */
describe('PayeeService.getLastCategoryForPayee', () => {
  let services: Services;
  let budgetId: number;
  let accountId: number;
  let groceriesId: number;
  let diningId: number;
  let uncategorizedId: number;

  async function addTransaction(opts: {
    payee: string;
    categoryId: number;
    date: string;
    memo?: string;
  }) {
    return services.transactions.addTransaction(
      0,
      10,
      accountId,
      opts.categoryId,
      budgetId,
      opts.date,
      opts.memo ?? 'memo',
      '',
      opts.payee
    );
  }

  beforeEach(async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter);
    services = sm.getServices();

    budgetId = await services.budgets.createBudget({
      name: 'Test Budget',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: 'dollar',
      create_default_categories: true,
    });

    const account = await services.accounts.createAccount(
      'Test Checking',
      budgetId,
      'checking',
      'USD',
      5000
    );
    accountId = account.ID;

    const categories = services.categories.getAllCategories(budgetId);
    const byName = (name: string) => categories.find((c: Category) => c.Name === name);
    uncategorizedId = byName('Uncategorized')!.ID;
    groceriesId =
      byName('Groceries')?.ID ??
      categories.find((c: Category) => !['Income', 'Uncategorized'].includes(c.Name))!.ID;
    diningId = categories.find(
      (c: Category) => ![groceriesId, uncategorizedId].includes(c.ID) && c.Name !== 'Income'
    )!.ID;
  });

  it("returns the category from the payee's most recent transaction", async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: groceriesId, date: '2026-01-10' });
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-03-02' });

    const memory = services.payees.getLastCategoryForPayee(budgetId, 'Corner Cafe');

    expect(memory?.CategoryID).toBe(diningId);
    expect(memory?.Date).toBe('2026-03-02');
  });

  it('breaks same-day ties with the newest row', async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: groceriesId, date: '2026-03-02' });
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-03-02' });

    expect(services.payees.getLastCategoryForPayee(budgetId, 'Corner Cafe')?.CategoryID).toBe(
      diningId
    );
  });

  it('matches the payee case-insensitively and ignores surrounding space', async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-03-02' });

    expect(services.payees.getLastCategoryForPayee(budgetId, 'corner cafe')?.CategoryID).toBe(
      diningId
    );
    expect(services.payees.getLastCategoryForPayee(budgetId, '  CORNER CAFE  ')?.CategoryID).toBe(
      diningId
    );
  });

  it('returns null for an unknown or blank payee', async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-03-02' });

    expect(services.payees.getLastCategoryForPayee(budgetId, 'Brand New Shop')).toBeNull();
    expect(services.payees.getLastCategoryForPayee(budgetId, '')).toBeNull();
    expect(services.payees.getLastCategoryForPayee(budgetId, '   ')).toBeNull();
  });

  it('skips Uncategorized — that means the user never chose', async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-01-10' });
    await addTransaction({ payee: 'Corner Cafe', categoryId: uncategorizedId, date: '2026-03-02' });

    // Falls back to the most recent transaction that has a real category.
    expect(services.payees.getLastCategoryForPayee(budgetId, 'Corner Cafe')?.CategoryID).toBe(
      diningId
    );
  });

  it('returns null when the only history is Uncategorized', async () => {
    await addTransaction({
      payee: 'Mystery Shop',
      categoryId: uncategorizedId,
      date: '2026-03-02',
    });

    expect(services.payees.getLastCategoryForPayee(budgetId, 'Mystery Shop')).toBeNull();
  });

  it('ignores split transactions, which have no single category', async () => {
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-01-10' });
    const splitId = await addTransaction({
      payee: 'Corner Cafe',
      categoryId: groceriesId,
      date: '2026-03-02',
    });
    await services.splits.upsertSplits(splitId, [
      { CategoryID: groceriesId, Memo: '', InflowConverted: 0, OutflowConverted: 5, OrderIndex: 0 },
      { CategoryID: diningId, Memo: '', InflowConverted: 0, OutflowConverted: 5, OrderIndex: 1 },
    ]);

    // The newer split row is skipped, so the older plain transaction wins.
    expect(services.payees.getLastCategoryForPayee(budgetId, 'Corner Cafe')?.Date).toBe(
      '2026-01-10'
    );
  });

  it('does not leak history across budgets', async () => {
    const otherBudgetId = await services.budgets.createBudget({
      name: 'Other Budget',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: 'dollar',
      create_default_categories: true,
    });
    await addTransaction({ payee: 'Corner Cafe', categoryId: diningId, date: '2026-03-02' });

    expect(services.payees.getLastCategoryForPayee(otherBudgetId, 'Corner Cafe')).toBeNull();
  });
});

describe('user_meta.SuggestCategoryFromPayee', () => {
  it('defaults to on and round-trips both ways', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter);
    const services = sm.getServices();

    expect(services.userMeta.getSuggestCategoryFromPayee()).toBe(true);

    services.userMeta.setSuggestCategoryFromPayee(false);
    expect(services.userMeta.getSuggestCategoryFromPayee()).toBe(false);

    services.userMeta.setSuggestCategoryFromPayee(true);
    expect(services.userMeta.getSuggestCategoryFromPayee()).toBe(true);
  });
});
