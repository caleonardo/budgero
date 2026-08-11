import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration048: Migration = {
  version: 48,
  description: 'Add RtaMode to budgets for per-budget Ready to Assign calculation',
  // Defaults to 'cumulative' so every existing budget keeps its current
  // all-time Ready to Assign math untouched; 'monthly' is opt-in per budget.
  up: (db: MigrationDatabase) => {
    try {
      db.exec(`ALTER TABLE budgets ADD COLUMN RtaMode TEXT NOT NULL DEFAULT 'cumulative'`);
    } catch (error) {
      debugLog('[Migration 48] statement failed (may already exist)', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(budgets)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('RtaMode');
    } catch (error) {
      debugLog('[Migration 48] verification failed', { error });
      return false;
    }
  },
};
