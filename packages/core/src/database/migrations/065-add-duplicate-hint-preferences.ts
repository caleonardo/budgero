import type { Migration } from '../migrations.js';

const COLUMNS: [name: string, definition: string][] = [
  ['DuplicateHintsEnabled', 'INTEGER NOT NULL DEFAULT 1 CHECK (DuplicateHintsEnabled IN (0, 1))'],
  // Basis points: 100 = 1%.
  [
    'DuplicateAmountToleranceBps',
    'INTEGER NOT NULL DEFAULT 100 CHECK (DuplicateAmountToleranceBps BETWEEN 0 AND 1000)',
  ],
  ['DuplicateDayWindow', 'INTEGER NOT NULL DEFAULT 7 CHECK (DuplicateDayWindow BETWEEN 1 AND 31)'],
];

export const migration065: Migration = {
  version: 65,
  description: 'Add possible-duplicate transaction hint preferences',
  up: (db) => {
    const existing = new Set(
      (db.exec('PRAGMA table_info(user_meta)')[0]?.values ?? []).map((column) => column[1])
    );
    for (const [name, definition] of COLUMNS) {
      if (!existing.has(name)) db.exec(`ALTER TABLE user_meta ADD COLUMN ${name} ${definition}`);
    }
  },
  verify: (db) => {
    const existing = new Set(
      (db.exec('PRAGMA table_info(user_meta)')[0]?.values ?? []).map((column) => column[1])
    );
    return COLUMNS.every(([name]) => existing.has(name));
  },
};
