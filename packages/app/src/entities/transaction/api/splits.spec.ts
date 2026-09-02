import { describe, expect, it } from 'vitest';

import { prepareSplitMutationLines } from './splits';

describe('prepareSplitMutationLines', () => {
  it('preserves mixed per-line directions', () => {
    expect(
      prepareSplitMutationLines(
        [
          { category_id: 1, outflow: 15_000, inflow: 0 },
          { category_id: 2, outflow: 0, inflow: 5_000 },
        ],
        undefined,
        'converted'
      )
    ).toEqual([
      expect.objectContaining({ inflow: 0, outflow: 15_000 }),
      expect.objectContaining({ inflow: 5_000, outflow: 0 }),
    ]);
  });

  it('places directional values in native fields for account-currency editing', () => {
    expect(
      prepareSplitMutationLines(
        [{ category_id: 1, inflow: 2_500, outflow: 0 }],
        undefined,
        'native'
      )
    ).toEqual([
      expect.objectContaining({
        inflow: 0,
        outflow: 0,
        inflow_original: 2_500,
        outflow_original: 0,
      }),
    ]);
  });
});
