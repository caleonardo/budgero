import type { Migration, MigrationDatabase } from '../migrations.js';

/**
 * Renames multi-currency money columns to the Native/Converted scheme:
 * `Native` = account currency, `Converted` = budget display currency.
 * Bare names are retired entirely so any stale reference fails loudly
 * instead of silently reading the wrong currency.
 */
export const migration045: Migration = {
  version: 45,
  description: 'Rename money columns to Native/Converted scheme',
  up: `
    ALTER TABLE transactions RENAME COLUMN InflowOriginal TO InflowNative;
    ALTER TABLE transactions RENAME COLUMN OutflowOriginal TO OutflowNative;
    ALTER TABLE transactions RENAME COLUMN RunningBalanceOriginal TO RunningBalanceNative;
    ALTER TABLE transactions RENAME COLUMN Inflow TO InflowConverted;
    ALTER TABLE transactions RENAME COLUMN Outflow TO OutflowConverted;
    ALTER TABLE transactions RENAME COLUMN RunningBalance TO RunningBalanceConverted;

    ALTER TABLE transaction_splits RENAME COLUMN InflowOriginal TO InflowNative;
    ALTER TABLE transaction_splits RENAME COLUMN OutflowOriginal TO OutflowNative;
    ALTER TABLE transaction_splits RENAME COLUMN Inflow TO InflowConverted;
    ALTER TABLE transaction_splits RENAME COLUMN Outflow TO OutflowConverted;

    ALTER TABLE accounts RENAME COLUMN Balance TO BalanceNative;
  `,
  verify: (db: MigrationDatabase) => {
    const columns = (table: string): string[] => {
      const info = db.exec(`PRAGMA table_info(${table})`);
      if (!info || info.length === 0) return [];
      return info[0].values.map((row: unknown[]) => String(row[1]));
    };
    const has = (table: string, col: string) => columns(table).includes(col);
    return (
      has('transactions', 'InflowNative') &&
      has('transactions', 'InflowConverted') &&
      has('transactions', 'RunningBalanceConverted') &&
      has('transaction_splits', 'OutflowNative') &&
      has('accounts', 'BalanceNative') &&
      !has('transactions', 'Inflow') &&
      !has('transactions', 'InflowOriginal') &&
      !has('accounts', 'Balance')
    );
  },
};
