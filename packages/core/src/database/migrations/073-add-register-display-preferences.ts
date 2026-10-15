import type { Migration, MigrationDatabase } from '../migrations.js';
import { createLogger } from '../../logger.js';

const debugLog = createLogger('database:migrations');

const COLUMNS: [name: string, definition: string][] = [
  ['CompactTransactionRows', 'BOOLEAN NOT NULL DEFAULT 0'],
  [
    'SameDayTransactionOrder',
    "TEXT NOT NULL DEFAULT 'newest' CHECK (SameDayTransactionOrder IN ('newest', 'amount'))",
  ],
];

export const migration073: Migration = {
  version: 73,
  description: 'Add compact register rows and same-day order preferences',
  up: (db: MigrationDatabase) => {
    for (const [name, definition] of COLUMNS) {
      try {
        db.exec(`ALTER TABLE user_meta ADD COLUMN ${name} ${definition}`);
      } catch (error) {
        debugLog('[Migration 73] statement failed (may already exist)', { error });
      }
    }
  },
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(user_meta)`);
      const columns = info?.[0]?.values?.map((row: unknown[]) => row[1]) ?? [];
      return COLUMNS.every(([name]) => columns.includes(name));
    } catch (error) {
      debugLog('[Migration 73] verification failed', { error });
      return false;
    }
  },
};
