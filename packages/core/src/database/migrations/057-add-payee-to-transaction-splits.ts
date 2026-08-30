import type { Migration, MigrationDatabase } from '../migrations.js';

export const migration057: Migration = {
  version: 57,
  description: 'Add payee support to split transaction lines',
  up: `
    ALTER TABLE transaction_splits
      ADD COLUMN Payee TEXT NOT NULL DEFAULT '';
  `,
  verify: (db: MigrationDatabase) => {
    const result = db.exec(`PRAGMA table_info(transaction_splits)`);
    const columns = result?.[0]?.values ?? [];
    return columns.some((row) => row[1] === 'Payee');
  },
};
