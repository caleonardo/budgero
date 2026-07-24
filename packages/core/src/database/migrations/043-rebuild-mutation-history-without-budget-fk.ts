import type { Migration, MigrationDatabase } from '../migrations.js';

// mutation_history is an audit log: deleting a budget must not erase the
// record of what happened to it, but the BudgetID FK's ON DELETE CASCADE did
// exactly that (a budget's own Create/mutation entries vanished with it).
// Rebuild without the FK; BudgetID stays for attribution. Runs while the
// migration runner has foreign keys suspended, same as migration 039.
export const migration043: Migration = {
  version: 43,
  description: 'Rebuild mutation_history without budgets FK so the audit log survives deletes',
  up: `
      CREATE TABLE mutation_history__nofk (
        ID              INTEGER PRIMARY KEY AUTOINCREMENT,
        BudgetID        INTEGER NOT NULL,
        MutationID      TEXT NOT NULL UNIQUE,
        Timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
        UserID          TEXT,
        Op              TEXT NOT NULL,
        Payload         TEXT NOT NULL,
        Origin          TEXT NOT NULL CHECK(Origin IN ('local', 'remote')),
        UndoOps         TEXT,
        RedoOps         TEXT,
        UndoneAt        TEXT,
        Status          TEXT NOT NULL DEFAULT 'success',
        ErrorMessage    TEXT,
        ErrorCode       TEXT,
        SpaceID         TEXT
      );

      INSERT INTO mutation_history__nofk (
        ID, BudgetID, MutationID, Timestamp, UserID, Op, Payload, Origin,
        UndoOps, RedoOps, UndoneAt, Status, ErrorMessage, ErrorCode, SpaceID
      )
      SELECT
        ID, BudgetID, MutationID, Timestamp, UserID, Op, Payload, Origin,
        UndoOps, RedoOps, UndoneAt, Status, ErrorMessage, ErrorCode, SpaceID
      FROM mutation_history;

      DROP TABLE mutation_history;
      ALTER TABLE mutation_history__nofk RENAME TO mutation_history;

      CREATE INDEX IF NOT EXISTS idx_mutation_history_budget_ts ON mutation_history(BudgetID, Timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_mutation_history_mutation_id ON mutation_history(MutationID);
    `,
  verify: (db: MigrationDatabase) => {
    try {
      const info = db.exec(`PRAGMA table_info(mutation_history)`);
      if (!info || info.length === 0) return false;
      const columns = info[0].values.map((row: unknown[]) => row[1]);
      if (!columns.includes('SpaceID') || !columns.includes('UndoOps')) return false;
      const fks = db.exec(`PRAGMA foreign_key_list(mutation_history)`);
      return !fks || fks.length === 0 || fks[0].values.length === 0;
    } catch {
      return false;
    }
  },
};
