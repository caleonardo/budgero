import { describe, expect, it } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, type DatabaseAdapter } from '../src';

async function createFixture() {
  const adapter: DatabaseAdapter = await NodeSqlJsAdapter.create();
  const manager = new ServiceManager();
  await manager.initialize(adapter);
  const services = manager.getServices();
  const budgetId = await services.budgets.createBudget({
    name: 'Transfer categories',
    display_currency: 'USD',
    badge_icon: 'dollar',
    number_format: '123,456.78',
    create_default_categories: true,
  });
  const source = await services.accounts.createAccount(
    'Source',
    budgetId,
    'checking',
    'USD',
    0,
    undefined,
    true
  );
  const destination = await services.accounts.createAccount(
    'Destination',
    budgetId,
    'checking',
    'USD',
    0,
    undefined,
    true
  );
  const tracking = await services.accounts.createAccount(
    'Tracking',
    budgetId,
    'checking',
    'USD',
    0,
    undefined,
    false
  );
  const transfers = services.categories.getCategoryByName('Transfers', budgetId);
  if (!transfers) throw new Error('Transfers category was not created');
  const groupId = services.categories.addCategoryGroup('Spending', budgetId);
  const spendingCategoryId = services.categories.addCategory(groupId, budgetId, 'Spending');

  return {
    services,
    budgetId,
    source,
    destination,
    tracking,
    transfers,
    spendingCategoryId,
  };
}

describe('transfer category editing', () => {
  it('exposes the linked accounts budget state and rejects on-budget recategorization', async () => {
    const { services, budgetId, source, destination, transfers, spendingCategoryId } =
      await createFixture();
    const transferId = 'on-budget-transfer';
    const sourceTransactionId = await services.transactions.addTransaction(
      0,
      10_000,
      source.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Transfer',
      transferId
    );
    await services.transactions.addTransaction(
      10_000,
      0,
      destination.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Transfer',
      transferId
    );

    const rows = services.transactions
      .getAllTransactionsDetailed(budgetId)
      .filter((transaction) => transaction.TransferID === transferId);
    expect(rows).toHaveLength(2);
    expect(rows.every((transaction) => Boolean(transaction.AccountOnBudget))).toBe(true);
    expect(rows.every((transaction) => Boolean(transaction.TransferAccountOnBudget))).toBe(true);

    await expect(
      services.transactions.updateTransactionColumn(
        sourceTransactionId,
        'CategoryID',
        spendingCategoryId
      )
    ).rejects.toThrow('On-budget transfer categories are managed automatically');
    expect(services.transactions.getTransactionByID(sourceTransactionId).CategoryID).toBe(
      transfers.ID
    );
  });

  it('keeps on-budget to off-budget transfer categories editable', async () => {
    const { services, budgetId, source, tracking, transfers, spendingCategoryId } =
      await createFixture();
    const transferId = 'tracking-transfer';
    const sourceTransactionId = await services.transactions.addTransaction(
      0,
      10_000,
      source.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Transfer to tracking',
      transferId
    );
    const destinationTransactionId = await services.transactions.addTransaction(
      10_000,
      0,
      tracking.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Transfer to tracking',
      transferId
    );

    const sourceRow = services.transactions
      .getAllTransactionsDetailed(budgetId)
      .find((transaction) => transaction.ID === sourceTransactionId);
    expect(Boolean(sourceRow?.AccountOnBudget)).toBe(true);
    expect(Boolean(sourceRow?.TransferAccountOnBudget)).toBe(false);

    await services.transactions.updateTransactionColumn(
      sourceTransactionId,
      'CategoryID',
      spendingCategoryId
    );
    expect(services.transactions.getTransactionByID(sourceTransactionId).CategoryID).toBe(
      spendingCategoryId
    );
    expect(services.transactions.getTransactionByID(destinationTransactionId).CategoryID).toBe(
      spendingCategoryId
    );

    await services.transactions.updateTransactionColumn(
      destinationTransactionId,
      'CategoryID',
      transfers.ID
    );
    expect(services.transactions.getTransactionByID(sourceTransactionId).CategoryID).toBe(
      transfers.ID
    );
    expect(services.transactions.getTransactionByID(destinationTransactionId).CategoryID).toBe(
      transfers.ID
    );
  });

  it('keeps a custom category on the on-budget leg of an incoming off-budget transfer', async () => {
    const { services, budgetId, source, tracking, transfers, spendingCategoryId } =
      await createFixture();
    const transferId = 'incoming-tracking-transfer';
    const trackingLegId = await services.transactions.addTransaction(
      0,
      10_000,
      tracking.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Transfer from tracking',
      transferId
    );
    const budgetLegId = await services.transactions.addTransaction(
      10_000,
      0,
      source.ID,
      spendingCategoryId,
      budgetId,
      '2026-08-30',
      'Transfer from tracking',
      transferId
    );

    expect(services.transactions.getTransactionByID(trackingLegId).CategoryID).toBe(transfers.ID);
    expect(services.transactions.getTransactionByID(budgetLegId).CategoryID).toBe(
      spendingCategoryId
    );
  });

  it('mirrors category edits after one on-budget transfer leg moves off budget', async () => {
    const { services, budgetId, source, destination, tracking, transfers, spendingCategoryId } =
      await createFixture();
    const transferId = 'moved-tracking-transfer';
    const sourceTransactionId = await services.transactions.addTransaction(
      0,
      10_000,
      source.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Source leg',
      transferId
    );
    const destinationTransactionId = await services.transactions.addTransaction(
      10_000,
      0,
      destination.ID,
      transfers.ID,
      budgetId,
      '2026-08-30',
      'Destination leg',
      transferId
    );

    await services.transactions.updateTransactionColumn(
      destinationTransactionId,
      'AccountID',
      tracking.ID
    );
    await services.transactions.updateTransactionColumn(
      sourceTransactionId,
      'CategoryID',
      spendingCategoryId
    );

    expect(services.transactions.getTransactionByID(sourceTransactionId).CategoryID).toBe(
      spendingCategoryId
    );
    expect(services.transactions.getTransactionByID(destinationTransactionId).CategoryID).toBe(
      spendingCategoryId
    );
  });
});
