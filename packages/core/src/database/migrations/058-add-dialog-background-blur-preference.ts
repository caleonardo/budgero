import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

export const migration058: Migration = {
  version: 58,
  description: 'Add dialog background blur appearance preference',
  up: (db: MigrationDatabase) => {
    try {
      db.exec(`ALTER TABLE user_meta ADD COLUMN DialogBackgroundBlur BOOLEAN NOT NULL DEFAULT 1`);
    } catch (error) {
      debugLog('[Migration 58] statement failed (may already exist)', { error });
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(user_meta)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return columns.includes('DialogBackgroundBlur');
    } catch (error) {
      debugLog('[Migration 58] verification failed', { error });
      return false;
    }
  },
};
