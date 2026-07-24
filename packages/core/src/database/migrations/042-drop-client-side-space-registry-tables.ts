import type { Migration, MigrationDatabase } from '../migrations.js';

// The server owns the workspace registry (budget_spaces / members / blobs in
// the Go server DB). These client-side copies were never read after the
// workspace era began, but budget_spaces.OwnerBudgetID cascaded on budget
// deletes — a footgun with no benefit.
export const migration042: Migration = {
  version: 42,
  description: 'Drop client-side space registry tables (server owns the workspace registry)',
  up: `
      DROP TABLE IF EXISTS budget_space_members;
      DROP TABLE IF EXISTS budget_spaces;
    `,
  verify: (db: MigrationDatabase) => {
    try {
      const rows = db.exec(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('budget_spaces', 'budget_space_members')`
      );
      return !rows || rows.length === 0 || rows[0].values.length === 0;
    } catch {
      return false;
    }
  },
};
