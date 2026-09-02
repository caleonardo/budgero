import { describe, expect, it } from 'vitest';

import { isCategoryVisibleInPicker } from './category-picker-options';

describe('isCategoryVisibleInPicker', () => {
  it('hides the system Transfers category by default', () => {
    expect(isCategoryVisibleInPicker('Transfers')).toBe(false);
    expect(isCategoryVisibleInPicker('Groceries')).toBe(true);
  });

  it('includes Transfers when an off-budget transfer opts in', () => {
    expect(isCategoryVisibleInPicker('Transfers', true)).toBe(true);
  });
});
