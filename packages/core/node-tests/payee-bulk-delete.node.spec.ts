import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalDateString } from '../src/utils/date';
import { NodeSqlJsAdapter, ServiceManager, Services, Category } from '../src';

/**
 * Bulk payee deletion — "mass deleting payees with checkbox's". Deleting a
 * payee also clears it off every transaction that used it, so a partially
 * applied batch would leave the directory and the transactions disagreeing.
 * These pin the batch semantics the UI relies on.
 */
describe('PayeeService.deletePayees', () => {
  let sm: ServiceManager;
  let services: Services;
  let budgetId: number;
  let accountId: number;
  let categoryId: number;

  /** Payees the budget seeds itself — noise for these assertions. */
  let seededNames: Set<string>;

  const today = getLocalDateString();

  async function addTransactionWithPayee(payee: string, memo = 'x') {
    return services.transactions.addTransaction(
      0,
      10,
      accountId,
      categoryId,
      budgetId,
      today,
      memo,
      '',
      payee
    );
  }

  /** Names this test created, sorted, minus whatever the budget seeded. */
  function payeeNames(targetBudgetId = budgetId): string[] {
    return services.payees
      .getPayeesWithUsage(targetBudgetId)
      .map((p) => p.Name)
      .filter((name) => !seededNames.has(name))
      .sort();
  }

  beforeEach(async () => {
    const adapter = await NodeSqlJsAdapter.create();
    sm = new ServiceManager();
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
    categoryId = categories.find((c: Category) => c.Name !== 'Income')?.ID ?? categories[0].ID;

    seededNames = new Set(services.payees.getPayeesWithUsage(budgetId).map((p) => p.Name));
  });

  it('removes every named payee and leaves the rest untouched', async () => {
    await addTransactionWithPayee('Coffee Shop');
    await addTransactionWithPayee('Grocery Store');
    await addTransactionWithPayee('Hardware Store');
    services.payees.addPayee(budgetId, 'Never Used');

    const result = services.payees.deletePayees(budgetId, ['Coffee Shop', 'Never Used']);

    expect(result.deleted).toBe(2);
    expect(payeeNames()).toEqual(['Grocery Store', 'Hardware Store']);
  });

  it('clears the deleted payees off their transactions', async () => {
    const keptId = await addTransactionWithPayee('Grocery Store', 'kept');
    const clearedId = await addTransactionWithPayee('Coffee Shop', 'cleared');

    const result = services.payees.deletePayees(budgetId, ['Coffee Shop']);

    expect(result.cleared).toBe(1);
    expect(services.transactions.getTransactionByID(clearedId).Payee).toBe('');
    expect(services.transactions.getTransactionByID(keptId).Payee).toBe('Grocery Store');
  });

  it('counts every affected transaction across the batch', async () => {
    await addTransactionWithPayee('Coffee Shop');
    await addTransactionWithPayee('Coffee Shop');
    await addTransactionWithPayee('Grocery Store');

    const result = services.payees.deletePayees(budgetId, ['Coffee Shop', 'Grocery Store']);

    expect(result).toEqual({ deleted: 2, cleared: 3 });
  });

  it('ignores blank names and duplicates instead of double-counting', async () => {
    await addTransactionWithPayee('Coffee Shop');

    const result = services.payees.deletePayees(budgetId, [
      'Coffee Shop',
      ' Coffee Shop ',
      '',
      '   ',
    ]);

    expect(result).toEqual({ deleted: 1, cleared: 1 });
    expect(payeeNames()).toEqual([]);
  });

  it('is a no-op for an empty selection', async () => {
    await addTransactionWithPayee('Coffee Shop');

    expect(services.payees.deletePayees(budgetId, [])).toEqual({ deleted: 0, cleared: 0 });
    expect(payeeNames()).toEqual(['Coffee Shop']);
  });

  it('leaves other budgets alone', async () => {
    const otherBudgetId = await services.budgets.createBudget({
      name: 'Other Budget',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: 'dollar',
      create_default_categories: true,
    });
    services.payees.addPayee(budgetId, 'Shared Name');
    services.payees.addPayee(otherBudgetId, 'Shared Name');

    services.payees.deletePayees(budgetId, ['Shared Name']);

    expect(payeeNames()).toEqual([]);
    expect(payeeNames(otherBudgetId)).toEqual(['Shared Name']);
  });

  it('keeps single deletePayee working through the batch path', async () => {
    await addTransactionWithPayee('Coffee Shop');
    await addTransactionWithPayee('Grocery Store');

    expect(services.payees.deletePayee(budgetId, 'Coffee Shop')).toEqual({ cleared: 1 });
    expect(payeeNames()).toEqual(['Grocery Store']);
    expect(services.payees.deletePayee(budgetId, '  ')).toEqual({ cleared: 0 });
  });
});
