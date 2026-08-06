import type { Migration, MigrationDatabase } from '../migrations.js';

/**
 * Journaled FX/crypto revaluations: transactions keep their historical
 * write-time rates (flows stay true in reports), while each daily rate
 * refresh trues the account's converted balance up to native × latest rate
 * and records the delta here. BalanceConverted = Σ converted transactions +
 * Σ revaluation deltas. Ready to Assign includes the deltas of on-budget
 * accounts.
 */
export const migration047: Migration = {
  version: 47,
  description: 'Add account_revaluations table for journaled balance true-ups',
  up: `
    CREATE TABLE account_revaluations (
      ID             INTEGER PRIMARY KEY AUTOINCREMENT,
      BudgetID       INTEGER NOT NULL,
      AccountID      INTEGER NOT NULL,
      Date           TEXT NOT NULL,
      OldRate        REAL DEFAULT NULL,
      NewRate        REAL NOT NULL,
      BalanceNative  INTEGER NOT NULL,
      DeltaConverted INTEGER NOT NULL,
      CreatedAt      TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (AccountID, Date),
      FOREIGN KEY (AccountID) REFERENCES accounts(ID) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (BudgetID)  REFERENCES budgets(ID)  ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX idx_account_revaluations_account_date ON account_revaluations(AccountID, Date);
    CREATE INDEX idx_account_revaluations_budget_date  ON account_revaluations(BudgetID, Date);
  `,
  verify: (db: MigrationDatabase) => {
    const result = db.exec(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='account_revaluations'`
    );
    return !!result && result.length > 0;
  },
};
