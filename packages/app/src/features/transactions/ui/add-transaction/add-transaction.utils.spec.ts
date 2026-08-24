import { describe, expect, it } from 'vitest';

import {
  calculateImpliedTransferRate,
  calculateTransferRateOverrides,
} from './add-transaction.utils';

describe('calculateTransferRateOverrides', () => {
  it('derives the direct rate from native amounts with different storage scales', () => {
    expect(
      calculateImpliedTransferRate({
        sourceAmount: 1_000_000,
        receivedAmount: 2_000_000,
        sourceCurrency: 'USD',
        destinationCurrency: 'BTC',
      })
    ).toBeCloseTo(0.00002, 12);
  });

  it('pins the foreign destination when the source uses the budget currency', () => {
    expect(
      calculateTransferRateOverrides({
        sourceAmount: 1_000_000,
        receivedAmount: 900_000,
        sourceCurrency: 'USD',
        destinationCurrency: 'EUR',
        budgetCurrency: 'USD',
      })
    ).toEqual({ sourceRateOverride: null, destinationRateOverride: 1_000 / 900 });
  });

  it('pins the foreign source when the destination uses the budget currency', () => {
    expect(
      calculateTransferRateOverrides({
        sourceAmount: 900_000,
        receivedAmount: 1_000_000,
        sourceCurrency: 'EUR',
        destinationCurrency: 'USD',
        budgetCurrency: 'USD',
      })
    ).toEqual({ sourceRateOverride: 1_000 / 900, destinationRateOverride: null });
  });

  it('uses the source market value as the anchor when both accounts are foreign', () => {
    expect(
      calculateTransferRateOverrides({
        sourceAmount: 1_000_000,
        receivedAmount: 150_000_000,
        sourceCurrency: 'EUR',
        destinationCurrency: 'JPY',
        budgetCurrency: 'USD',
        sourceToBudgetRate: 1.2,
      }).destinationRateOverride
    ).toBeCloseTo(1_200 / 150_000, 10);
  });

  it('accounts for crypto storage scale', () => {
    expect(
      calculateTransferRateOverrides({
        sourceAmount: 1_000_000,
        receivedAmount: 2_000_000,
        sourceCurrency: 'USD',
        destinationCurrency: 'BTC',
        budgetCurrency: 'USD',
      }).destinationRateOverride
    ).toBeCloseTo(50_000, 10);
  });
});
