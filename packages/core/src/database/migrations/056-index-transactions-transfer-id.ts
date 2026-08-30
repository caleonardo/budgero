import type { Migration, MigrationDatabase } from '../migrations.js';

export const migration056: Migration = {
  version: 56,
  description: 'Index linked transfer transactions',
  up: `
    CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id
      ON transactions(TransferID)
      WHERE TransferID IS NOT NULL AND TransferID != '';
  `,
  verify: (db: MigrationDatabase) => {
    const result = db.exec(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index' AND name = 'idx_transactions_transfer_id'
    `);
    return result?.[0]?.values?.length === 1;
  },
};
