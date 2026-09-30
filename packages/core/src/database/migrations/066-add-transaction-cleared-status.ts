import type { Migration } from '../migrations.js';

/**
 * Adds uncleared/cleared status alongside Reconciled (reconciled implies
 * cleared). Existing rows are marked cleared so every account's cleared
 * balance starts equal to its balance; rows created afterwards start
 * uncleared unless their source (a bank import) says otherwise.
 */
export const migration066: Migration = {
  version: 66,
  description: 'Add cleared status to transactions',
  up: (db) => {
    const columns = db.exec('PRAGMA table_info(transactions)')[0]?.values ?? [];
    if (!columns.some((column) => column[1] === 'Cleared')) {
      db.exec(`ALTER TABLE transactions ADD COLUMN Cleared BOOLEAN NOT NULL DEFAULT 0`);
      db.exec(`UPDATE transactions SET Cleared = 1`);
    }
  },
  verify: (db) => {
    const columns = db.exec('PRAGMA table_info(transactions)')[0]?.values ?? [];
    return columns.some((column) => column[1] === 'Cleared');
  },
};
