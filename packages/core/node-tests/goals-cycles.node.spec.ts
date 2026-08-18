import { describe, it, expect, beforeAll } from 'vitest';
import { GoalCalculations, CategoryFinancials } from '../src/services/goals/calculations';
import {
  Goal,
  GoalType,
  GoalPurpose,
  getCycleMonths,
  describeGoalCycle,
  GOAL_CYCLE_MONTHS_ERROR,
} from '../src/services/goals/types';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';

/**
 * Cycle semantics for repeating goals with a configurable cadence
 * (CycleMonths). Cycles are tiled in both directions from the target date
 * (the anchor); the current cycle is the one containing the viewed month.
 */

const goal = (overrides: Partial<Goal> = {}): Goal => ({
  ID: 1,
  Type: GoalType.TARGET_DATE,
  Purpose: GoalPurpose.SAVINGS,
  CategoryID: 1,
  Target: 300_000,
  StartDate: '2026-07-01',
  TargetDate: '2026-12-31',
  Recurring: true,
  CycleMonths: 3,
  ...overrides,
});

const finances = (overrides: Partial<CategoryFinancials> = {}): CategoryFinancials => ({
  available: 0,
  assigned: 0,
  activity: 0,
  currencyCode: 'USD',
  ...overrides,
});

const cycle = (g: Goal, month: string) => {
  const c = GoalCalculations.computeCycle(g, month);
  return {
    start: c.cycleStart,
    end: c.cycleEnd,
    target: `${c.cycleTargetDate.getFullYear()}-${String(c.cycleTargetDate.getMonth() + 1).padStart(2, '0')}-${String(c.cycleTargetDate.getDate()).padStart(2, '0')}`,
    n: c.cycleMonths,
  };
};

describe('computeCycle — anchored grid', () => {
  it('quarterly, created in July with target Dec 31: July–Sep is its own quarter', () => {
    expect(cycle(goal(), '2026-07')).toEqual({
      start: '2026-07',
      end: '2026-09',
      target: '2026-09-30',
      n: 3,
    });
    expect(cycle(goal(), '2026-09')).toEqual({
      start: '2026-07',
      end: '2026-09',
      target: '2026-09-30',
      n: 3,
    });
    expect(cycle(goal(), '2026-10')).toEqual({
      start: '2026-10',
      end: '2026-12',
      target: '2026-12-31',
      n: 3,
    });
    expect(cycle(goal(), '2026-12')).toEqual({
      start: '2026-10',
      end: '2026-12',
      target: '2026-12-31',
      n: 3,
    });
    // first month of the next cycle
    expect(cycle(goal(), '2027-01')).toEqual({
      start: '2027-01',
      end: '2027-03',
      target: '2027-03-31',
      n: 3,
    });
  });

  it('keeps the anchor day and clamps to shorter months (Jan 31 → Apr 30, Jul 31)', () => {
    const g = goal({ StartDate: '2025-01-01', TargetDate: '2026-01-31', CycleMonths: 3 });
    expect(cycle(g, '2026-04').target).toBe('2026-04-30');
    expect(cycle(g, '2026-07').target).toBe('2026-07-31'); // anchor day preserved, not 30
    expect(cycle(g, '2026-02').target).toBe('2026-04-30');
  });

  it('Feb 29 anchor: Feb 28 in common years, Feb 29 in leap years', () => {
    const g = goal({ StartDate: '2025-01-01', TargetDate: '2028-02-29', CycleMonths: 12 });
    expect(cycle(g, '2029-01').target).toBe('2029-02-28');
    expect(cycle(g, '2029-01').end).toBe('2029-02');
    expect(cycle(g, '2032-01').target).toBe('2032-02-29');
  });

  it('yearly with day-31 target: full 12-month window (setMonth overflow regression)', () => {
    const g = goal({ TargetDate: '2026-03-31', CycleMonths: null }); // null ⇒ yearly
    expect(cycle(g, '2026-07')).toEqual({
      start: '2026-04',
      end: '2027-03',
      target: '2027-03-31',
      n: 12,
    });
  });

  it('viewing before the target: grid tiles backwards (interim cycle), never before the start month', () => {
    const g = goal({ StartDate: '2025-01-15', TargetDate: '2027-03-31', CycleMonths: 12 });
    expect(cycle(g, '2025-07')).toEqual({
      start: '2025-04',
      end: '2026-03',
      target: '2026-03-31',
      n: 12,
    });
    expect(cycle(g, '2026-04')).toEqual({
      start: '2026-04',
      end: '2027-03',
      target: '2027-03-31',
      n: 12,
    });
    // Months before the goal existed show the first cycle, not a phantom earlier one.
    const periodic = goal({ StartDate: '2026-10-01', TargetDate: '2026-12-31', CycleMonths: 3 });
    expect(cycle(periodic, '2026-08')).toEqual({
      start: '2026-10',
      end: '2026-12',
      target: '2026-12-31',
      n: 3,
    });
    expect(cycle(periodic, '2026-10')).toEqual({
      start: '2026-10',
      end: '2026-12',
      target: '2026-12-31',
      n: 3,
    });
    expect(cycle(periodic, '2027-01')).toEqual({
      start: '2027-01',
      end: '2027-03',
      target: '2027-03-31',
      n: 3,
    });
  });

  it('periodic goal created today: first cycle starts this month and paces over N months', () => {
    // UI derives TargetDate = last day of (start month + N − 1)
    const g = goal({
      StartDate: '2026-08-18',
      TargetDate: '2026-10-31',
      CycleMonths: 3,
      Target: 300_000,
    });
    expect(cycle(g, '2026-08')).toEqual({
      start: '2026-08',
      end: '2026-10',
      target: '2026-10-31',
      n: 3,
    });
    const result = GoalCalculations.calculateProgress(g, finances(), '2026-08');
    expect(result.timeMetrics?.monthsRemaining).toBe(3);
    expect(result.monthlyTarget).toBe(100_000);
  });

  it('boundaries: month == target month, and far-future months terminate', () => {
    const g = goal({ TargetDate: '2026-12-31', CycleMonths: 2 });
    expect(cycle(g, '2026-12')).toEqual({
      start: '2026-11',
      end: '2026-12',
      target: '2026-12-31',
      n: 2,
    });
    expect(cycle(g, '2076-05')).toEqual({
      start: '2076-05',
      end: '2076-06',
      target: '2076-06-30',
      n: 2,
    });
    expect(cycle(goal({ CycleMonths: 120, TargetDate: '2026-12-31' }), '2030-01')).toEqual({
      start: '2027-01',
      end: '2036-12',
      target: '2036-12-31',
      n: 120,
    });
  });

  it('parses ISO-timestamp target dates in local time (month and day)', () => {
    // Local Jan 1 stored as an instant; the anchor month must be January locally.
    const iso = new Date(2027, 0, 1).toISOString();
    const g = goal({ StartDate: '2025-01-01', TargetDate: iso, CycleMonths: 3 });
    expect(cycle(g, '2027-01')).toEqual({
      start: '2026-11',
      end: '2027-01',
      target: '2027-01-01',
      n: 3,
    });
  });

  it('non-recurring goals are untouched: [StartDate month .. TargetDate month]', () => {
    const g = goal({
      Recurring: false,
      CycleMonths: 3,
      StartDate: '2026-02-01',
      TargetDate: '2026-12-31',
    });
    expect(cycle(g, '2026-07')).toEqual({
      start: '2026-02',
      end: '2026-12',
      target: '2026-12-31',
      n: null,
    });
  });

  it('malformed stored CycleMonths never hangs: 0 / -3 / "6" / 2.5', () => {
    expect(getCycleMonths({ Recurring: true, CycleMonths: 0 })).toBe(12);
    expect(getCycleMonths({ Recurring: true, CycleMonths: -3 })).toBe(12);
    expect(getCycleMonths({ Recurring: true, CycleMonths: '6' as unknown as number })).toBe(6);
    expect(getCycleMonths({ Recurring: true, CycleMonths: 2.5 })).toBe(12);
    expect(getCycleMonths({ Recurring: true, CycleMonths: 1 })).toBe(12); // below MIN → default
    expect(getCycleMonths({ Recurring: false, CycleMonths: 3 })).toBeNull();
    expect(cycle(goal({ CycleMonths: 0 }), '2026-07').n).toBe(12);
  });

  it('describeGoalCycle labels', () => {
    expect(describeGoalCycle(12)).toBe('yearly');
    expect(describeGoalCycle(3)).toBe('quarterly');
    expect(describeGoalCycle(6)).toBe('every 6 months');
    expect(describeGoalCycle(4)).toBe('every 4 months');
  });
});

describe('progress with a quarterly cycle', () => {
  it('counts only assignments inside the current quarter and paces over the quarter', () => {
    const result = GoalCalculations.calculateProgress(
      goal(), // 300 by Dec 31, quarterly → viewing Aug: cycle Jul–Sep
      finances({
        assigned: 50_000,
        historicalAssignments: [
          { month: '2026-06', amount: 999_000 }, // previous quarter — excluded
          { month: '2026-07', amount: 100_000 },
        ],
      }),
      '2026-08'
    );
    expect(result.amountSaved).toBe(150_000);
    expect(result.amountNeeded).toBe(150_000);
    // needed at month start = 300 - 100 = 200 over 2 remaining months (Aug, Sep)
    expect(result.monthlyTarget).toBe(100_000);
    expect(result.timeMetrics?.monthsRemaining).toBe(2);
    expect(result.breakdown.explanation).toContain('Cycle: 2026-07 to 2026-09 (repeats quarterly)');
    expect(result.breakdown.title).toBe('Recurring Yearly Allocation Target');
  });

  it('first month of a new quarter starts from zero with a full-quarter pace', () => {
    const result = GoalCalculations.calculateProgress(
      goal(),
      finances({
        assigned: 0,
        historicalAssignments: [
          { month: '2026-07', amount: 100_000 },
          { month: '2026-08', amount: 100_000 },
          { month: '2026-09', amount: 100_000 },
        ],
      }),
      '2026-10'
    );
    expect(result.amountSaved).toBe(0);
    expect(result.monthlyTarget).toBe(100_000);
    expect(result.timeMetrics?.monthsRemaining).toBe(3);
    expect(result.status).toBe('at-risk');
  });

  it('yearly cycles keep the plain "Cycle: A to B" explanation', () => {
    const result = GoalCalculations.calculateProgress(
      goal({ CycleMonths: 12 }),
      finances(),
      '2026-08'
    );
    expect(result.breakdown.explanation).toContain('Cycle: 2026-01 to 2026-12');
  });
});

describe('validateGoal — CycleMonths', () => {
  const base: Partial<Goal> = {
    Type: GoalType.TARGET_DATE,
    Purpose: GoalPurpose.SAVINGS,
    Target: 1000,
    CategoryID: 1,
    TargetDate: '2026-12-31',
  };
  it('accepts 2..120 when recurring, ignores the field otherwise', () => {
    expect(GoalCalculations.validateGoal({ ...base, Recurring: true, CycleMonths: 3 }).valid).toBe(
      true
    );
    expect(
      GoalCalculations.validateGoal({ ...base, Recurring: true, CycleMonths: 120 }).valid
    ).toBe(true);
    expect(
      GoalCalculations.validateGoal({ ...base, Recurring: true, CycleMonths: null }).valid
    ).toBe(true);
    expect(GoalCalculations.validateGoal({ ...base, Recurring: false, CycleMonths: 0 }).valid).toBe(
      true
    );
  });
  it('rejects 0, 1, 121, 2.5 and NaN when recurring', () => {
    for (const bad of [0, 1, 121, 2.5, Number.NaN]) {
      const r = GoalCalculations.validateGoal({ ...base, Recurring: true, CycleMonths: bad });
      expect(r.valid, String(bad)).toBe(false);
      expect(r.errors).toContain(GOAL_CYCLE_MONTHS_ERROR);
    }
  });
});

describe('GoalService persistence of CycleMonths', () => {
  const sm = new ServiceManager();
  let budgetId = 0;
  let nextCat = 0;
  const services = () => sm.getServices();

  beforeAll(async () => {
    const adapter = await NodeSqlJsAdapter.create();
    await sm.initialize(adapter as DatabaseAdapter);
    budgetId = await services().budgets.createBudget({
      name: 'Cycles',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: false,
    });
    const groupId = services().categories.addCategoryGroup('G', budgetId);
    nextCat = groupId;
  });

  const newCategory = () =>
    services().categories.addCategory(nextCat, budgetId, `Cat ${Math.random()}`);

  it('stores the cadence, defaults legacy/omitted values, and nulls when not recurring', () => {
    const catQ = newCategory();
    services().goals.createGoal(
      GoalType.TARGET_DATE,
      catQ,
      1000,
      '2026-07-01',
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      3
    );
    expect(services().goals.getGoalByCategoryID(catQ).CycleMonths).toBe(3);

    // omitted → NULL bound (no throw), reads back as yearly
    const catLegacy = newCategory();
    services().goals.createGoal(
      GoalType.TARGET_DATE,
      catLegacy,
      1000,
      '2026-07-01',
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true
    );
    const legacy = services().goals.getGoalByCategoryID(catLegacy);
    expect(legacy.CycleMonths).toBeNull();
    expect(getCycleMonths(legacy)).toBe(12);

    // not recurring → cadence discarded
    const catNo = newCategory();
    services().goals.createGoal(
      GoalType.TARGET_DATE,
      catNo,
      1000,
      '2026-07-01',
      '2026-12-31',
      GoalPurpose.SAVINGS,
      false,
      3
    );
    expect(services().goals.getGoalByCategoryID(catNo).CycleMonths).toBeNull();
  });

  it('update: absent keeps, null clears, recurring off nulls, invalid throws', () => {
    const cat = newCategory();
    services().goals.createGoal(
      GoalType.TARGET_DATE,
      cat,
      1000,
      '2026-07-01',
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      3
    );

    // key absent (older client payload) → keep 3
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true
    );
    expect(services().goals.getGoalByCategoryID(cat).CycleMonths).toBe(3);

    // change cadence
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      6
    );
    expect(services().goals.getGoalByCategoryID(cat).CycleMonths).toBe(6);

    // explicit null → back to default
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      null
    );
    expect(services().goals.getGoalByCategoryID(cat).CycleMonths).toBeNull();

    // recurring off (even with a cadence supplied) → null
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      false,
      3
    );
    expect(services().goals.getGoalByCategoryID(cat).CycleMonths).toBeNull();
    expect(services().goals.getGoalByCategoryID(cat).Recurring).toBeFalsy();

    // start date can be moved; omitted keeps it
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      3,
      '2026-09-01'
    );
    expect(services().goals.getGoalByCategoryID(cat).StartDate).toBe('2026-09-01');
    services().goals.updateGoal(
      cat,
      2000,
      GoalType.TARGET_DATE,
      '2026-12-31',
      GoalPurpose.SAVINGS,
      true,
      3
    );
    expect(services().goals.getGoalByCategoryID(cat).StartDate).toBe('2026-09-01');

    for (const bad of [0, 1, 121, 2.5]) {
      expect(() =>
        services().goals.updateGoal(
          cat,
          2000,
          GoalType.TARGET_DATE,
          '2026-12-31',
          GoalPurpose.SAVINGS,
          true,
          bad
        )
      ).toThrow(GOAL_CYCLE_MONTHS_ERROR);
    }
  });

  it('history is not truncated at 12 assigned months', () => {
    const cat = newCategory();
    // 15 assigned months inside one long cycle, viewed in month 16.
    for (let i = 0; i < 15; i += 1) {
      const month = `2025-${String(i + 1).padStart(2, '0')}`;
      const key = i < 12 ? month : `2026-${String(i - 11).padStart(2, '0')}`;
      services().monthlyBudgets.upsertMonthlyAssignment(cat, 10_000, key, budgetId);
    }
    const fin = services().goals.getCategoryFinancials(cat, '2026-04');
    expect(fin.historicalAssignments).toHaveLength(15);
    expect(fin.historicalAssignments![0].month).toBe('2025-01');
  });
});
