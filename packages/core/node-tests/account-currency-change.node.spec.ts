import { describe, expect, it } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager } from '../src';
import { getLocalDateString } from '../src/utils/date';

async function createServices() {
  const adapter = await NodeSqlJsAdapter.create();
  const manager = new ServiceManager();
  await manager.initialize(adapter);
  return manager.getServices();
}

describe('account currency change modes', () => {
  it('converts native amounts by default and preserves their budget value', async () => {
    const services = await createServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Convert account currency',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const today = getLocalDateString();
    await services.currency.saveRate('USD', 'EUR', 1 / 1.2, today, budgetId);
    await services.currency.saveRate('EUR', 'USD', 1.2, today, budgetId);

    const account = await services.accounts.createAccount(
      'Actually EUR',
      budgetId,
      'checking',
      'USD',
      10_000
    );

    await services.accounts.updateAccount(account.ID, account.Name, account.Type, 'EUR');

    const updated = services.accounts.getAccount(account.ID);
    const [openingBalance] = services.transactions.getTransactionsByAccount(account.ID);
    expect(updated.Currency).toBe('EUR');
    expect(updated.BalanceNative).toBe(8_333);
    expect(updated.BalanceConverted).toBe(10_000);
    expect(openingBalance.InflowNative).toBe(8_333);
    expect(openingBalance.InflowConverted).toBe(10_000);
  });

  it('can reinterpret native amounts and recalculate their budget value', async () => {
    const services = await createServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Correct mislabeled currency',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const today = getLocalDateString();
    await services.currency.saveRate('EUR', 'USD', 1.2, today, budgetId);

    const account = await services.accounts.createAccount(
      'Actually EUR',
      budgetId,
      'checking',
      'USD',
      10_000
    );

    await services.accounts.updateAccount(
      account.ID,
      account.Name,
      account.Type,
      'EUR',
      undefined,
      undefined,
      'reinterpret'
    );

    const updated = services.accounts.getAccount(account.ID);
    const [openingBalance] = services.transactions.getTransactionsByAccount(account.ID);
    expect(updated.Currency).toBe('EUR');
    expect(updated.BalanceNative).toBe(10_000);
    expect(updated.BalanceConverted).toBe(12_000);
    expect(openingBalance.InflowNative).toBe(10_000);
    expect(openingBalance.InflowConverted).toBe(12_000);
    expect(openingBalance.RunningBalanceNative).toBe(10_000);
    expect(openingBalance.RunningBalanceConverted).toBe(12_000);
  });

  it('preserves the displayed number when old and new currencies use different storage scales', async () => {
    const services = await createServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Correct mislabeled crypto currency',
      display_currency: 'USD',
      badge_icon: 'bitcoin',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const today = getLocalDateString();
    await services.currency.saveRate('BTC', 'USD', 50_000, today, budgetId);

    const account = await services.accounts.createAccount(
      'Actually BTC',
      budgetId,
      'checking',
      'USD',
      10_000
    );

    await services.accounts.updateAccount(
      account.ID,
      account.Name,
      'crypto',
      'BTC',
      undefined,
      undefined,
      'reinterpret'
    );

    const updated = services.accounts.getAccount(account.ID);
    const [openingBalance] = services.transactions.getTransactionsByAccount(account.ID);
    expect(updated.BalanceNative).toBe(1_000_000_000); // 10 BTC in sat-scale storage
    expect(updated.BalanceConverted).toBe(500_000_000); // USD 500,000 in milliunits
    expect(openingBalance.InflowNative).toBe(1_000_000_000);
  });

  it('reinterprets only the selected account and leaves a linked transfer leg unchanged', async () => {
    const services = await createServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Mislabeled transfer account',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const today = getLocalDateString();
    await services.currency.saveRate('EUR', 'USD', 1.2, today, budgetId);

    const source = await services.accounts.createAccount(
      'USD source',
      budgetId,
      'checking',
      'USD',
      20_000
    );
    const destination = await services.accounts.createAccount(
      'Actually EUR',
      budgetId,
      'checking',
      'USD',
      0
    );
    const transferCategory = services.categories.getCategoryByName('Transfers', budgetId);
    if (!transferCategory) throw new Error('Transfers category missing');

    const transferId = 'currency-correction-transfer';
    const sourceLegId = await services.transactions.addTransaction(
      0,
      10_000,
      source.ID,
      transferCategory.ID,
      budgetId,
      today,
      'to EUR',
      transferId
    );
    const destinationLegId = await services.transactions.addTransaction(
      10_000,
      0,
      destination.ID,
      transferCategory.ID,
      budgetId,
      today,
      'from USD',
      transferId
    );

    await services.accounts.updateAccount(
      destination.ID,
      destination.Name,
      destination.Type,
      'EUR',
      undefined,
      undefined,
      'reinterpret'
    );

    const sourceLeg = services.transactions.getTransactionByID(sourceLegId);
    const destinationLeg = services.transactions.getTransactionByID(destinationLegId);
    expect(sourceLeg.OutflowNative).toBe(10_000);
    expect(sourceLeg.OutflowConverted).toBe(10_000);
    expect(destinationLeg.InflowNative).toBe(10_000);
    expect(destinationLeg.InflowConverted).toBe(12_000);
    expect(services.accounts.getAccount(source.ID).BalanceNative).toBe(10_000);
    expect(services.accounts.getAccount(destination.ID).BalanceNative).toBe(10_000);
  });
});
