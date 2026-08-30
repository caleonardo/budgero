import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration055: Migration = {
  version: 55,
  description: 'Track direct transfer-rate overrides separately from budget-rate overrides',
  up: (db: MigrationDatabase) => {
    const info = db.exec(`PRAGMA table_info(transactions)`);
    const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
    if (columns.includes('TransferRateOverride')) return;

    try {
      db.exec(
        `ALTER TABLE transactions ADD COLUMN TransferRateOverride BOOLEAN NOT NULL DEFAULT 0`
      );
    } catch (error) {
      debugLog('[Migration 55] failed to add TransferRateOverride', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(transactions)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('TransferRateOverride');
    } catch (error) {
      debugLog('[Migration 55] verification failed', { error });
      return false;
    }
  },
};
