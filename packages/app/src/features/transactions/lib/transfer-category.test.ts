import { describe, expect, it } from 'vitest';
import { hasReadOnlyTransferCategory } from './transfer-category';

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
