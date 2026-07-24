import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter, reconcileSpaceScope } from '../src';
import type { MigrationDatabase } from '../src';

const SERVER_SPACE_ID = '682539c6-750a-4c5f-9c78-5e902716090f';

function query(adapter: NodeSqlJsAdapter, sql: string): { values: unknown[][] }[] {
  return adapter.exec(sql) as { values: unknown[][] }[];
}

async function setup() {
  const adapter = await NodeSqlJsAdapter.create();
  const sm = new ServiceManager();
  await sm.initialize(adapter as DatabaseAdapter);
  return { adapter, services: sm.getServices() };
}

describe('reconcileSpaceScope', () => {
  it('remaps legacy space ids on budgets and mutation_history to the authoritative id', async () => {
    const { adapter, services } = await setup();
    const legacy = await services.budgets.createBudget({
      name: 'Legacy',
      space_id: '0a5d7d60c6f11343c2f41da327b39e86',
      display_currency: 'EUR',
      badge_icon: 'wallet',
      number_format: '1.234,56',
      create_default_categories: false,
    });
    const modern = await services.budgets.createBudget({
      name: 'Modern',
      space_id: SERVER_SPACE_ID,
      display_currency: 'EUR',
      badge_icon: 'wallet',
      number_format: '1.234,56',
      create_default_categories: false,
    });
    adapter.exec(
      `INSERT INTO mutation_history (BudgetID, SpaceID, MutationID, Op, Payload, Origin)
       VALUES (${legacy}, NULL, 'm-legacy', 'budgets.create', '{}', 'local'),
              (${modern}, '${SERVER_SPACE_ID}', 'm-modern', 'budgets.create', '{}', 'local')`
    );

    // Pre-reconcile: the scoped query hides the legacy budget — the bug.
    expect(services.budgets.getAllBudgets(SERVER_SPACE_ID).map((b) => b.ID)).toEqual([modern]);

    reconcileSpaceScope(adapter as unknown as MigrationDatabase, SERVER_SPACE_ID);

    expect(
      services.budgets
        .getAllBudgets(SERVER_SPACE_ID)
        .map((b) => b.ID)
        .sort()
    ).toEqual([legacy, modern].sort());
    const history = query(adapter, `SELECT DISTINCT SpaceID FROM mutation_history`);
    expect(history[0].values).toEqual([[SERVER_SPACE_ID]]);
  });

  it('drops the client-side space registry tables (migration 042)', async () => {
    const { adapter } = await setup();
    const rows = query(
      adapter,
      `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('budget_spaces', 'budget_space_members')`
    );
    expect(rows.length === 0 || rows[0].values.length === 0).toBe(true);
  });

  it('keeps mutation_history rows when their budget is deleted (migration 043)', async () => {
    const { adapter, services } = await setup();
    const doomed = await services.budgets.createBudget({
      name: 'Doomed',
      space_id: SERVER_SPACE_ID,
      display_currency: 'EUR',
      badge_icon: 'wallet',
      number_format: '1.234,56',
      create_default_categories: false,
    });
    adapter.exec(
      `INSERT INTO mutation_history (BudgetID, SpaceID, MutationID, Op, Payload, Origin)
       VALUES (${doomed}, '${SERVER_SPACE_ID}', 'm-doomed', 'budgets.create', '{}', 'local')`
    );

    services.budgets.deleteBudget(doomed);

    const rows = query(
      adapter,
      `SELECT MutationID FROM mutation_history WHERE BudgetID = ${doomed}`
    );
    expect(rows[0].values).toEqual([['m-doomed']]);
  });
});
