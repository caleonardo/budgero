import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration049: Migration = {
  version: 49,
  description: 'Add ShowGroupPercent flag to user_meta for category group budget shares',
  // Defaults to 0: the share-of-budget percentage on category groups is opt-in
  // from Settings → Budget Settings.
  up: (db: MigrationDatabase) => {
    const safeExec = (sql: string) => {
      try {
        db.exec(sql);
      } catch (error) {
        debugLog('[Migration 49] statement failed (may already exist)', { sql, error });
      }
    };

    safeExec(`ALTER TABLE user_meta ADD COLUMN ShowGroupPercent BOOLEAN NOT NULL DEFAULT 0`);
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(user_meta)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('ShowGroupPercent');
    } catch (error) {
      debugLog('[Migration 49] verification failed', { error });
      return false;
    }
  },
};
