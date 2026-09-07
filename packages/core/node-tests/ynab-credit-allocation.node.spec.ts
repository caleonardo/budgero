import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BudgetService,
  MonthlyBudgetService,
  NodeSqlJsAdapter,
  YNABImportService,
  YNABApiClient,
  type YNABApiPlanSnapshot,
} from '../src/index.js';

// Captured from the disposable YNAB "ynab repro" plan on 2026-09-07/08.
// Expected amounts come from YNAB, not from Budgero's funding calculation.
type Plan = YNABApiPlanSnapshot['plan'];
type EntityOverride<T extends { id: string }> = Partial<T> & { id: string };
type Observation = {
  name: string;
  accounts: EntityOverride<Plan['accounts'][number]>[];
  transactions: EntityOverride<Plan['transactions'][number]>[];
  subtransactions: EntityOverride<Plan['subtransactions'][number]>[];
  months: (Omit<Plan['months'][number], 'categories'> & {
    categories: EntityOverride<Plan['categories'][number]>[];
  })[];
};
const fixture = JSON.parse(
  readFileSync(new URL('./test-data/ynab-credit-allocation-repro.json', import.meta.url), 'utf8')
) as Pick<
  Plan,
  | 'accounts'
  | 'transactions'
  | 'subtransactions'
  | 'categories'
  | 'category_groups'
  | 'payees'
  | 'currency_format'
> & { cases: Observation[] };

// Shared entity definitions keep the captures compact. Each observation lists
// exactly the entities present at capture time and overrides their changed fields.
function restore<T extends { id: string }>(base: T[], overrides: EntityOverride<T>[]): T[] {
  return overrides.map((override) => {
    const original = base.find((entity) => entity.id === override.id);
    if (!original) throw new Error(`Missing fixture entity ${override.id}`);
    return { ...original, ...override };
  });
}
const cases = fixture.cases.map((observation) => ({
  name: observation.name,
  snapshot: {
    serverKnowledge: 0,
    moneyMovements: [],
    plan: {
      id: 'repro',
      name: observation.name,
      currency_format: fixture.currency_format,
      accounts: restore(fixture.accounts, observation.accounts),
      category_groups: fixture.category_groups,
      categories: restore(fixture.categories, observation.months[0].categories),
      payees: fixture.payees,
      transactions: restore(fixture.transactions, observation.transactions),
      subtransactions: restore(fixture.subtransactions, observation.subtransactions),
      months: observation.months.map((month) => ({
        ...month,
        categories: restore(fixture.categories, month.categories),
      })),
    },
  } satisfies YNABApiPlanSnapshot,
}));

async function verifySnapshot(name: string, snapshot: YNABApiPlanSnapshot): Promise<void> {
  const adapter = await NodeSqlJsAdapter.create();
  try {
    const result = await new YNABImportService(adapter).importYNABFromApiSnapshotWithSummary(
      snapshot,
      {
        spaceId: 'repro',
        budgetName: name,
        currency: snapshot.plan.currency_format.iso_code,
        numberFormat: snapshot.plan.currency_format.example_format,
        badgeIcon: 'HelpCircle',
      }
    );
    expect(new BudgetService(adapter).getRtaMode(result.budgetId)).toBe('monthly');
    const monthly = new MonthlyBudgetService(adapter);
    for (const month of snapshot.plan.months) {
      const rows = monthly.getMonthlyBudget(month.month.slice(0, 7), result.budgetId);
      for (const source of month.categories.filter((category) => !category.internal)) {
        const group = snapshot.plan.category_groups.find(
          (group) => group.id === source.category_group_id
        )!;
        const actual = rows.find(
          (row) => row.CategoryGroup === group.name && row.Category === source.name
        );
        expect.soft(actual, `${name} ${month.month} ${source.name}`).toBeDefined();
        expect.soft(actual?.Assigned, `${source.name} assigned`).toBe(source.budgeted);
        expect.soft(actual?.Activity, `${source.name} activity`).toBe(source.activity);
        expect.soft(actual?.Available, `${source.name} available`).toBe(source.balance);
        if (actual?.paymentCalculation) {
          const { previousAvailable, funded, payments, refunds } = actual.paymentCalculation;
          expect(previousAvailable + actual.Assigned + funded - payments - refunds).toBe(
            source.balance
          );
          expect(actual.fundingBreakdown!.reduce((sum, part) => sum + part.amount, 0)).toBe(funded);
        }
      }
      expect
        .soft(
          monthly.getReadyToAssign(result.budgetId, month.month.slice(0, 7)),
          `${month.month} RTA`
        )
        .toBe(month.to_be_budgeted);
    }
    expect(result.verification?.status).toBe('passed');
    expect(result.verification?.accounts.matched).toBe(snapshot.plan.accounts.length);
  } finally {
    adapter.close();
  }
}

describe('YNAB-observed credit allocation and split income', () => {
  for (const { name, snapshot } of cases) {
    it(name, () => verifySnapshot(name, snapshot));
  }

  const livePlanId = process.env.YNAB_REPRO_PLAN_ID;
  const tokenFile = process.env.YNAB_ACCESS_TOKEN_FILE;
  it.skipIf(!livePlanId || !tokenFile)(
    'reconciles a fresh PAT import of the live repro plan',
    async () => {
      const token = readFileSync(tokenFile!, 'utf8').trim();
      const snapshot = await new YNABApiClient(token).getPlan(livePlanId!);
      await verifySnapshot(snapshot.plan.name, snapshot);
    },
    120_000
  );
});
