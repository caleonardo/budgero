import { plural, t } from '@lingui/core/macro';

/** Display text only; core retains locale-independent cycle calculations. */
export function describeLocalizedGoalCycle(cycleMonths: number): string {
  if (cycleMonths === 12) return t`yearly`;
  if (cycleMonths === 3) return t`quarterly`;
  if (cycleMonths === 1) return t`monthly`;
  return plural(cycleMonths, { one: 'every # month', other: 'every # months' });
}
