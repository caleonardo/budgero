import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

/**
 * The account register and running-balance updates use the same stable ledger
 * order: AccountID, Date, ID. Including ID removes SQLite's temporary sort for
 * same-day rows and lets keyset pages seek directly to their continuation.
 */
export const migration061: Migration = {
  version: 61,
  description: 'Add exact account register Date/ID index',
  up: (db: MigrationDatabase) => {
    db.exec(`DROP INDEX IF EXISTS idx_transactions_account_date`);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transactions_account_date_id
      ON transactions(AccountID, Date DESC, ID DESC)
    `);
  },
  verify: (db: MigrationDatabase) => {
    try {
      const result = db.exec(`PRAGMA index_info(idx_transactions_account_date_id)`);
      const columns = result?.[0]?.values?.map((row: unknown[]) => row[2]) ?? [];
      return columns.join(',') === 'AccountID,Date,ID';
    } catch (error) {
      debugLog('[Migration 61] verification failed', { error });
      return false;
    }
  },
};
