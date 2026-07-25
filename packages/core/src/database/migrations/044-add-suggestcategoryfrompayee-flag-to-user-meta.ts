import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration044: Migration = {
  version: 44,
  description: 'Add SuggestCategoryFromPayee flag to user_meta for payee category memory',
  // Defaults to 1: the feature is on for new and existing budgets alike, and
  // users who want it off flip it in Settings → Automation Rules.
  up: (db: MigrationDatabase) => {
    const safeExec = (sql: string) => {
      try {
        db.exec(sql);
      } catch (error) {
        debugLog('[Migration 44] statement failed (may already exist)', { sql, error });
      }
    };

    safeExec(
      `ALTER TABLE user_meta ADD COLUMN SuggestCategoryFromPayee BOOLEAN NOT NULL DEFAULT 1`
    );
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(user_meta)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('SuggestCategoryFromPayee');
    } catch (error) {
      debugLog('[Migration 44] verification failed', { error });
      return false;
    }
  },
};
