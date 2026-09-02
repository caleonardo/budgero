import type { Migration, MigrationDatabase } from '../migrations.js';

const { MAX_SAFE_INTEGER } = Number;

interface GuardedTable {
  table: string;
  required: string[];
  nullable?: string[];
}

const GUARDED_TABLES: GuardedTable[] = [
  {
    table: 'accounts',
    required: ['BalanceNative'],
    nullable: ['BalanceConverted'],
  },
  {
    table: 'transactions',
    required: ['InflowConverted', 'OutflowConverted'],
    nullable: ['InflowNative', 'OutflowNative', 'RunningBalanceConverted', 'RunningBalanceNative'],
  },
  {
    table: 'transaction_splits',
    required: ['InflowConverted', 'OutflowConverted'],
    nullable: ['InflowNative', 'OutflowNative'],
  },
  { table: 'assignments', required: ['Amount'] },
  { table: 'goals', required: ['Target'] },
  { table: 'recurring_transactions', required: ['Amount'] },
  { table: 'warranties', required: ['Amount'] },
  { table: 'account_revaluations', required: ['BalanceNative', 'DeltaConverted'] },
];

function unsafeRequired(column: string, changedOnly: boolean): string {
  const unsafe = `(typeof(NEW.${column}) <> 'integer' OR NEW.${column} > ${MAX_SAFE_INTEGER} OR NEW.${column} < -${MAX_SAFE_INTEGER})`;
  return changedOnly ? `(${unsafe} AND NOT (NEW.${column} IS OLD.${column}))` : unsafe;
}

function unsafeNullable(column: string, changedOnly: boolean): string {
  const unsafe = `(NEW.${column} IS NOT NULL AND (typeof(NEW.${column}) <> 'integer' OR NEW.${column} > ${MAX_SAFE_INTEGER} OR NEW.${column} < -${MAX_SAFE_INTEGER}))`;
  return changedOnly ? `(${unsafe} AND NOT (NEW.${column} IS OLD.${column}))` : unsafe;
}

function triggerSql(spec: GuardedTable, event: 'INSERT' | 'UPDATE'): string {
  const changedOnly = event === 'UPDATE';
  const conditions = [
    ...spec.required.map((column) => unsafeRequired(column, changedOnly)),
    ...(spec.nullable ?? []).map((column) => unsafeNullable(column, changedOnly)),
  ];
  const suffix = event.toLowerCase();
  return `
    CREATE TRIGGER IF NOT EXISTS guard_${spec.table}_safe_money_${suffix}
    BEFORE ${event} ON ${spec.table}
    FOR EACH ROW
    WHEN ${conditions.join(' OR ')}
    BEGIN
      SELECT RAISE(ABORT, '${spec.table} contains a money value outside the supported exact-integer range');
    END;
  `;
}

/**
 * Service-layer validation is the primary guard. These triggers protect the
 * same invariant when a write comes from the built-in SQL explorer or another
 * out-of-band SQLite client.
 */
export const migration059: Migration = {
  version: 59,
  description: 'Guard money columns against unsafe integer values',
  up: (db: MigrationDatabase) => {
    for (const table of GUARDED_TABLES) {
      db.exec(triggerSql(table, 'INSERT'));
      db.exec(triggerSql(table, 'UPDATE'));
    }
  },
  verify: (db: MigrationDatabase) => {
    const result = db.exec(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'trigger' AND name LIKE 'guard_%_safe_money_%'
    `);
    const names = new Set((result[0]?.values ?? []).map((row) => String(row[0])));
    return GUARDED_TABLES.every(
      ({ table }) =>
        names.has(`guard_${table}_safe_money_insert`) &&
        names.has(`guard_${table}_safe_money_update`)
    );
  },
};
