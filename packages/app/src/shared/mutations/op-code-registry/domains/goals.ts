import { GoalPurpose, type GoalType } from '@budgero/core/browser';
import { asMilli } from '@budgero/core/browser';
import { S, type OpCodeEntry } from '../shared';

function readCycleMonths(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const n = Number(value);
  // A garbled value in a replayed payload must not fail the whole mutation:
  // treat it as "not specified" and let the service keep/default.
  return Number.isFinite(n) ? n : undefined;
}

export const goalOps = {
  'goals.create': {
    execute: async (args) => {
      return await S().goals.createGoal(
        args.goalType as GoalType,
        args.categoryId as number,
        asMilli(Number(args.target ?? 0)),
        args.startDate as string,
        args.endDate as string,
        (args.purpose as GoalPurpose | undefined) || GoalPurpose.SPENDING,
        (args.recurring as boolean | undefined) ?? false,
        // undefined = not specified (older payloads); null = explicit default.
        // Never Number() this: Number(null) === 0 would fail validation.
        readCycleMonths(args.cycleMonths)
      );
    },
    invalidates: [
      ['categories', '*'], // Will match ["categories", budgetId]
      ['goals', '*'], // Will match ["goals", budgetId]
      ['goal', '*'], // Will match ["goal", categoryId]
      ['monthlyBudget', '*'],
    ],
  },

  // useUpdateGoal
  'goals.update': {
    execute: async (args) => {
      return await S().goals.updateGoal(
        args.categoryId as number,
        asMilli(Number(args.target ?? 0)),
        args.goalType as GoalType,
        args.endDate as string,
        (args.purpose as GoalPurpose | undefined) || GoalPurpose.SPENDING,
        args.recurring as boolean | undefined,
        readCycleMonths(args.cycleMonths)
      );
    },
    invalidates: [
      ['categories', '*'], // Will match ["categories", budgetId]
      ['goals', '*'], // Will match ["goals", budgetId]
      ['goal', '*'], // Will match ["goal", categoryId]
      ['monthlyBudget', '*'],
    ],
  },

  // useDeleteGoal
  'goals.delete': {
    execute: async (args) => {
      return await S().goals.deleteGoal(args.goalId as number);
    },
    invalidates: [
      ['goals', '*'], // Will match ["goals", categoryId]
      ['goal', '*'], // Will match ["goal", categoryId]
      ['monthlyBudget', '*'],
    ],
  },
} satisfies Record<string, OpCodeEntry>;
