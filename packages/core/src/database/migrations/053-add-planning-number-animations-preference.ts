import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration053: Migration = {
  version: 53,
  description: 'Add PlanningNumberAnimations appearance preference',
  up: (db: MigrationDatabase) => {
    try {
      db.exec(
        `ALTER TABLE user_meta ADD COLUMN PlanningNumberAnimations BOOLEAN NOT NULL DEFAULT 0`
      );
    } catch (error) {
      debugLog('[Migration 53] statement failed (may already exist)', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(user_meta)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('PlanningNumberAnimations');
    } catch (error) {
      debugLog('[Migration 53] verification failed', { error });
      return false;
    }
  },
};
