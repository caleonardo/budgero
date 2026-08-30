import { describe, expect, it } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, type DatabaseAdapter } from '../src';

async function createForeignTransferFixture() {
  const adapter: DatabaseAdapter = await NodeSqlJsAdapter.create();
  const manager = new ServiceManager();
  await manager.initialize(adapter);
  const services = manager.getServices();
  const budgetId = await services.budgets.createBudget({
    name: 'Three currencies',
    display_currency: 'USD',
    badge_icon: 'dollar',
    number_format: '123,456.78',
    create_default_categories: true,
  });
  const rsd = await services.accounts.createAccount('RSD account', budgetId, 'checking', 'RSD', 0);
  const eur = await services.accounts.createAccount('EUR account', budgetId, 'checking', 'EUR', 0);
  const date = '2026-08-30';

  await services.currency.saveRate('RSD', 'USD', 0.01, date, budgetId);
  await services.currency.saveRate('EUR', 'USD', 1.25, date, budgetId);
  await services.currency.saveRate('RSD', 'EUR', 0.008, date, budgetId);

  const transferId = 'rsd-to-eur';
  await services.transactions.addTransaction(
    0,
    25_000,
    rsd.ID,
    0,
    budgetId,
    date,
    'RSD to EUR',
    transferId
  );
  await services.transactions.addTransaction(
    200,
    0,
    eur.ID,
    0,
    budgetId,
    date,
    'RSD to EUR',
    transferId
  );

  return { adapter, services, budgetId, transferId };
}

describe('direct transfer rates', () => {
  it('exposes and atomically edits the direct rate by updating the received amount', async () => {
    const { adapter, services, transferId } = await createForeignTransferFixture();

    const before = services.transactions.getTransferRateDetails(transferId);
    expect(before?.rate).toBeCloseTo(0.008, 10);
    expect(before?.source.currency).toBe('RSD');
    expect(before?.destination.currency).toBe('EUR');

    // Simulate a previously corrupted transfer where both legs accidentally
    // received the EUR→USD budget rate. Editing the direct rate must re-resolve
    // each account's own budget rate instead of preserving that corruption.
    adapter
      .prepare('UPDATE transactions SET ExchangeRate = 1.25 WHERE TransferID = ?')
      .run(transferId);

    const updated = await services.transactions.updateTransferRate(transferId, 0.01);
    expect(updated.rate).toBeCloseTo(0.01, 10);
    expect(updated.source.amount).toBe(25_000);
    expect(updated.destination.amount).toBe(250);
    expect(updated.source.budgetAmount).toBe(250);
    expect(updated.destination.budgetAmount).toBe(313);
    expect(updated.source.budgetRate).toBeCloseTo(0.01, 10);
    expect(updated.destination.budgetRate).toBeCloseTo(1.25, 10);
    expect(updated.source.rateOverride).toBe(false);
    expect(updated.destination.rateOverride).toBe(false);
    expect(updated.transferRateOverride).toBe(true);
    expect(updated.hasRateOverride).toBe(true);
  });

  it('automatically reapplies a custom foreign-to-foreign rate to an unpinned transfer', async () => {
    const { services, budgetId, transferId } = await createForeignTransferFixture();

    const added = await services.currency.addCustomRate(
      'EUR',
      'RSD',
      1,
      '2026-08-01',
      null,
      budgetId
    );

    const updated = services.transactions.getTransferRateDetails(transferId);
    expect(added.recalculated).toBe(2);
    expect(updated?.rate).toBeCloseTo(1, 10);
    expect(updated?.source.amount).toBe(25_000);
    expect(updated?.destination.amount).toBe(25_000);
    expect(updated?.source.budgetAmount).toBe(250);
    expect(updated?.destination.budgetAmount).toBe(31_250);
    expect(updated?.source.budgetRate).toBeCloseTo(0.01, 10);
    expect(updated?.destination.budgetRate).toBeCloseTo(1.25, 10);
    expect(updated?.transferRateOverride).toBe(false);
    expect(updated?.hasRateOverride).toBe(false);

    const edited = await services.currency.updateCustomRate(
      added.id,
      2,
      '2026-08-01',
      null,
      budgetId
    );
    const afterEdit = services.transactions.getTransferRateDetails(transferId);
    expect(edited.recalculated).toBe(2);
    expect(afterEdit?.rate).toBeCloseTo(0.5, 10);
    expect(afterEdit?.destination.amount).toBe(12_500);
    expect(afterEdit?.source.budgetAmount).toBe(250);
    expect(afterEdit?.destination.budgetAmount).toBe(15_625);

    const deleted = await services.currency.deleteCustomRate(added.id, budgetId);
    const afterDelete = services.transactions.getTransferRateDetails(transferId);
    expect(deleted.recalculated).toBe(2);
    expect(afterDelete?.rate).toBeCloseTo(0.008, 10);
    expect(afterDelete?.destination.amount).toBe(200);
    expect(afterDelete?.source.budgetAmount).toBe(afterDelete?.destination.budgetAmount);
  });

  it('keeps account-to-budget rates independent when a direct custom rate changes receipt', async () => {
    const adapter: DatabaseAdapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter);
    const services = manager.getServices();
    const budgetId = await services.budgets.createBudget({
      name: 'EUR to RSD',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const eur = await services.accounts.createAccount(
      'EUR account',
      budgetId,
      'checking',
      'EUR',
      0
    );
    const rsd = await services.accounts.createAccount(
      'RSD account',
      budgetId,
      'checking',
      'RSD',
      0
    );
    const date = '2026-08-30';
    const transferId = 'eur-to-rsd';

    await services.currency.saveRate('EUR', 'USD', 1.158_203_6, date, budgetId);
    await services.currency.saveRate('RSD', 'USD', 0.009_879_261_9, date, budgetId);
    await services.currency.saveRate('EUR', 'RSD', 117.235_843_757, date, budgetId);
    await services.transactions.addTransaction(
      0,
      1_000,
      eur.ID,
      0,
      budgetId,
      date,
      'EUR to RSD',
      transferId
    );
    await services.transactions.addTransaction(
      117_236,
      0,
      rsd.ID,
      0,
      budgetId,
      date,
      'EUR to RSD',
      transferId
    );

    await services.currency.addCustomRate('EUR', 'RSD', 1, '2026-08-01', null, budgetId);

    const updated = services.transactions.getTransferRateDetails(transferId);
    expect(updated?.rate).toBeCloseTo(1, 10);
    expect(updated?.source.amount).toBe(1_000);
    expect(updated?.destination.amount).toBe(1_000);
    expect(updated?.source.budgetRate).toBeCloseTo(1.158_203_6, 10);
    expect(updated?.destination.budgetRate).toBeCloseTo(0.009_879_261_9, 10);
    expect(updated?.source.budgetAmount).toBe(1_158);
    expect(updated?.destination.budgetAmount).toBe(10);
  });

  it('atomically reapplies a direct custom rate when one account uses the budget currency', async () => {
    const adapter: DatabaseAdapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter);
    const services = manager.getServices();
    const budgetId = await services.budgets.createBudget({
      name: 'EUR to USD',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const eur = await services.accounts.createAccount('EUR', budgetId, 'checking', 'EUR', 0);
    const usd = await services.accounts.createAccount('USD', budgetId, 'checking', 'USD', 0);
    const date = '2026-08-30';
    const transferId = 'eur-to-usd';

    await services.currency.saveRate('EUR', 'USD', 1.25, date, budgetId);
    await services.transactions.addTransaction(
      0,
      10_000,
      eur.ID,
      0,
      budgetId,
      date,
      'EUR to USD',
      transferId
    );
    await services.transactions.addTransaction(
      12_500,
      0,
      usd.ID,
      0,
      budgetId,
      date,
      'EUR to USD',
      transferId
    );

    const added = await services.currency.addCustomRate(
      'EUR',
      'USD',
      2,
      '2026-08-01',
      null,
      budgetId
    );

    const updated = services.transactions.getTransferRateDetails(transferId);
    expect(added.recalculated).toBe(2);
    expect(updated?.rate).toBeCloseTo(2, 10);
    expect(updated?.source.amount).toBe(10_000);
    expect(updated?.destination.amount).toBe(20_000);
    expect(updated?.source.budgetRate).toBeCloseTo(2, 10);
    expect(updated?.destination.budgetRate).toBeNull();
    expect(updated?.source.budgetAmount).toBe(20_000);
    expect(updated?.destination.budgetAmount).toBe(20_000);
  });

  it('does not replace a manually overridden transfer with a custom rate', async () => {
    const { services, budgetId, transferId } = await createForeignTransferFixture();
    await services.transactions.updateTransferRate(transferId, 0.02);

    const added = await services.currency.addCustomRate(
      'EUR',
      'RSD',
      1,
      '2026-08-01',
      null,
      budgetId
    );

    const unchanged = services.transactions.getTransferRateDetails(transferId);
    expect(added.recalculated).toBe(0);
    expect(unchanged?.rate).toBeCloseTo(0.02, 10);
    expect(unchanged?.hasRateOverride).toBe(true);
  });
});
