import type { Migration } from '../migrations.js';

export const migration064: Migration = {
  version: 64,
  description: 'Add calendar week start preference',
  up: (db) => {
    const columns = db.exec('PRAGMA table_info(user_meta)')[0]?.values ?? [];
    if (!columns.some((column) => column[1] === 'WeekStartsOn')) {
      db.exec(
        `ALTER TABLE user_meta ADD COLUMN WeekStartsOn INTEGER NOT NULL DEFAULT 0 CHECK (WeekStartsOn IN (0, 1))`
      );
    }
  },
  verify: (db) => {
    const columns = db.exec('PRAGMA table_info(user_meta)')[0]?.values ?? [];
    return columns.some((column) => column[1] === 'WeekStartsOn');
  },
};
