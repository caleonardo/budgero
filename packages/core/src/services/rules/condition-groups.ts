import type { RuleCondition } from './index.js';

/**
 * Splits a condition chain at each OR into groups of ANDed conditions, so AND
 * binds tighter than OR: `a AND b OR c` becomes `[[a, b], [c]]`.
 */
export function groupRuleConditions<T extends Pick<RuleCondition, 'join'>>(conditions: T[]): T[][] {
  const groups: T[][] = [];
  conditions.forEach((condition, index) => {
    if (index === 0 || condition.join !== 'or') {
      if (groups.length === 0) groups.push([]);
      groups[groups.length - 1].push(condition);
    } else {
      groups.push([condition]);
    }
  });
  return groups;
}

/** True when any OR-group has every one of its conditions matching. */
export function matchesConditionChain(
  conditions: RuleCondition[],
  matches: (condition: RuleCondition) => boolean
): boolean {
  return groupRuleConditions(conditions).some((group) => group.every(matches));
}
