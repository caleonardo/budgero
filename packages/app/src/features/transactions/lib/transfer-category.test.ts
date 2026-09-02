import { describe, expect, it } from 'vitest';
import { hasReadOnlyTransferCategory, transferHasOffBudgetLeg } from './transfer-category';

describe('hasReadOnlyTransferCategory', () => {
  it('is read-only only when both linked accounts are on-budget', () => {
    expect(
      hasReadOnlyTransferCategory({
        TransferID: 'transfer-1',
        AccountOnBudget: true,
        TransferAccountOnBudget: true,
      })
    ).toBe(true);

    expect(
      hasReadOnlyTransferCategory({
        TransferID: 'transfer-1',
        AccountOnBudget: true,
        TransferAccountOnBudget: false,
      })
    ).toBe(false);

    expect(
      hasReadOnlyTransferCategory({
        TransferID: undefined,
        AccountOnBudget: true,
        TransferAccountOnBudget: true,
      })
    ).toBe(false);
  });
});

describe('transferHasOffBudgetLeg', () => {
  it('only allows the Transfers category for transfers crossing the budget boundary', () => {
    expect(
      transferHasOffBudgetLeg({
        TransferID: 'internal',
        AccountOnBudget: true,
        TransferAccountOnBudget: true,
      })
    ).toBe(false);
    expect(
      transferHasOffBudgetLeg({
        TransferID: 'external',
        AccountOnBudget: true,
        TransferAccountOnBudget: false,
      })
    ).toBe(true);
    expect(
      transferHasOffBudgetLeg({
        TransferID: null,
        AccountOnBudget: true,
        TransferAccountOnBudget: false,
      })
    ).toBe(false);
  });
});
