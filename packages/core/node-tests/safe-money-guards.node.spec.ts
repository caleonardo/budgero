import { describe, expect, it } from 'vitest';
import { asMilli, DatabaseAdapter, NodeSqlJsAdapter, ServiceManager } from '../src';
import { migration059 } from '../src/database/migrations/059-guard-safe-integer-money-values.js';
import type { MigrationDatabase } from '../src/database/migrations.js';

describe('safe integer money database guards', () => {
  it('rejects unsafe raw SQL money writes without changing the row', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter as DatabaseAdapter);
    const { budgets, accounts, categories, transactions } = manager.getServices();

    const budgetId = await budgets.createBudget({
      name: 'SQL guard',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const account = await accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      asMilli(0)
    );
    const category = categories
      .getAllCategories(budgetId)
      .find((candidate) => candidate.Name !== 'Income');
    if (!category) throw new Error('category missing');
    const id = await transactions.addTransaction(
      asMilli(1_000),
      asMilli(0),
      account.ID,
      category.ID,
      budgetId,
      '2026-09-02',
      'Guard me'
    );

    expect(() =>
      adapter.exec(
        `UPDATE transactions SET InflowConverted = 37509668817561350000 WHERE ID = ${id}`
      )
    ).toThrow('outside the supported exact-integer range');
    expect(transactions.getTransactionByID(id).InflowConverted).toBe(1_000);
  });

  it('lets an existing corrupt conversion be repaired and rebuilds balances', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const manager = new ServiceManager();
    await manager.initialize(adapter as DatabaseAdapter);
    const { budgets, accounts, categories, transactions } = manager.getServices();

    const budgetId = await budgets.createBudget({
      name: 'Legacy repair',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });
    const account = await accounts.createAccount('EUR', budgetId, 'checking', 'EUR', asMilli(0));
    const category = categories
      .getAllCategories(budgetId)
      .find((candidate) => candidate.Name !== 'Income');
    if (!category) throw new Error('category missing');
    const id = await transactions.addTransaction(
      asMilli(25_000),
      asMilli(0),
      account.ID,
      category.ID,
      budgetId,
      '2026-09-02',
      'Repair me',
      undefined,
      undefined,
      undefined,
      1
    );

    // Simulate a database corrupted before migration 059 installed the guards.
    adapter.exec(`
      DROP TRIGGER guard_transactions_safe_money_update;
      DROP TRIGGER guard_accounts_safe_money_update;
      UPDATE transactions
      SET InflowConverted = 37509668817561350000,
          RunningBalanceConverted = 37509668817561350000,
          ExchangeRate = 1500386752667713
      WHERE ID = ${id};
      UPDATE accounts
      SET BalanceConverted = 37509668817561350000
      WHERE ID = ${account.ID};
    `);
    if (typeof migration059.up !== 'function') throw new Error('migration 059 must be callable');
    migration059.up(adapter as unknown as MigrationDatabase);

    await transactions.updateTransactionColumn(id, 'ExchangeRate', 0.01500386752667713);

    const repaired = transactions.getTransactionByID(id);
    expect(repaired.ExchangeRate).toBe(0.01500386752667713);
    expect(repaired.InflowConverted).toBe(375);
    expect(repaired.RunningBalanceConverted).toBe(375);
    expect(accounts.getAccount(account.ID).BalanceConverted).toBe(375);
  });
});
