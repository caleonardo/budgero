import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration050: Migration = {
  version: 50,
  description: 'Add CycleMonths column to goals table for repeating-goal cadence',
  // NULL means "default cadence" (12 months) for recurring goals, so every
  // existing recurring goal keeps repeating yearly without a backfill.
  up: (db: MigrationDatabase) => {
    try {
      db.exec(`ALTER TABLE goals ADD COLUMN CycleMonths INTEGER NULL`);
    } catch (error) {
      debugLog('[Migration 50] statement failed (may already exist)', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(goals)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('CycleMonths');
    } catch (error) {
      debugLog('[Migration 50] verification failed', { error });
      return false;
    }
  },
};
