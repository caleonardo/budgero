import { describe, it, expect } from 'vitest';
import { groupRuleConditions } from '../src/services/rules/index.js';

describe('groupRuleConditions', () => {
  it('splits a chain into AND groups at each OR', () => {
    const chain = [
      { id: 'a' },
      { id: 'b', join: 'and' as const },
      { id: 'c', join: 'or' as const },
    ];
    expect(groupRuleConditions(chain).map((group) => group.map((c) => c.id))).toEqual([
      ['a', 'b'],
      ['c'],
    ]);
  });

  it('ignores a leading OR on the first condition', () => {
    const chain = [{ id: 'a', join: 'or' as const }, { id: 'b' }];
    expect(groupRuleConditions(chain).map((group) => group.map((c) => c.id))).toEqual([['a', 'b']]);
  });

  it('returns no groups for an empty chain', () => {
    expect(groupRuleConditions([])).toEqual([]);
  });
});
