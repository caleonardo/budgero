import type { Migration } from '../migrations.js';

export const migration067: Migration = {
  version: 67,
  description: 'Add bank sync connections, account links and review queue',
  up: `CREATE TABLE IF NOT EXISTS bank_connections (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    BudgetID INTEGER NOT NULL UNIQUE REFERENCES budgets(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    Provider TEXT NOT NULL DEFAULT 'simplefin',
    AccessURL TEXT NOT NULL,
    LastSyncAt TEXT,
    LastError TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS bank_links (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    BudgetID INTEGER NOT NULL REFERENCES budgets(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    AccountID INTEGER NOT NULL UNIQUE REFERENCES accounts(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    ExternalAccountID TEXT NOT NULL,
    ExternalName TEXT NOT NULL DEFAULT '',
    OrgName TEXT NOT NULL DEFAULT '',
    ImportFrom TEXT NOT NULL,
    LastSyncAt TEXT,
    LastBalance INTEGER,
    LastBalanceDate TEXT,
    UNIQUE (BudgetID, ExternalAccountID)
  );
  CREATE TABLE IF NOT EXISTS bank_reviews (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    BudgetID INTEGER NOT NULL REFERENCES budgets(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    AccountID INTEGER NOT NULL REFERENCES accounts(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    OperationID TEXT NOT NULL UNIQUE,
    IdentityJSON TEXT NOT NULL,
    CandidateTransactionID INTEGER REFERENCES transactions(ID) ON DELETE SET NULL,
    Status TEXT NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending', 'resolved', 'dismissed')),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_bank_reviews_account ON bank_reviews(BudgetID, AccountID, Status);`,
};
