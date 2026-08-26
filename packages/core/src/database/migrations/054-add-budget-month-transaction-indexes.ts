import type { Migration, MigrationDatabase } from '../migrations.js';

export const migration054: Migration = {
  version: 54,
  description: 'Add transaction indexes for monthly budget calculations',
  up: `
    CREATE INDEX IF NOT EXISTS idx_transactions_budget_month_category
      ON transactions(BudgetID, Month, CategoryID);
    CREATE INDEX IF NOT EXISTS idx_transactions_budget_account_month
      ON transactions(BudgetID, AccountID, Month);
  `,
  verify: (db: MigrationDatabase) => {
    const result = db.exec(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index'
        AND name IN (
          'idx_transactions_budget_month_category',
          'idx_transactions_budget_account_month'
        )
    `);
    return result?.[0]?.values?.length === 2;
  },
};
