import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

/**
 * Some source systems can represent a transfer across the budget boundary
 * without assigning it a budget category. The row still needs to remain a
 * real linked transfer for account balances, but it must not invent an RTA
 * movement that was absent in the source plan.
 */
export const migration060: Migration = {
  version: 60,
  description: 'Allow imported transfers to opt out of Ready to Assign',
  up: (db: MigrationDatabase) => {
    try {
      db.exec(
        `ALTER TABLE transactions ADD COLUMN ExcludeFromReadyToAssign BOOLEAN NOT NULL DEFAULT 0`
      );
    } catch (error) {
      debugLog('[Migration 60] statement failed (may already exist)', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(transactions)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('ExcludeFromReadyToAssign');
    } catch (error) {
      debugLog('[Migration 60] verification failed', { error });
      return false;
    }
  },
};
