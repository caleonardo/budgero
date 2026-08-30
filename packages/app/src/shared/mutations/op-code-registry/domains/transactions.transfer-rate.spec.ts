import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeMutationOp, getUndoSpec } from '@shared/mutations/op-code-registry';

const transactionMocks = vi.hoisted(() => ({
  getTransferRateDetails: vi.fn(),
  updateTransferRate: vi.fn(),
}));

vi.mock('@shared/runtime/global', () => ({
  getRuntime: () => ({ services: () => ({ transactions: transactionMocks }) }),
}));

describe('transactions.updateTransferRate', () => {
  beforeEach(() => {
    transactionMocks.getTransferRateDetails.mockReset();
    transactionMocks.updateTransferRate.mockReset().mockResolvedValue(undefined);
  });

  it('forwards the direct rate and restores the previous rate provenance on undo', async () => {
    transactionMocks.getTransferRateDetails.mockResolvedValue({
      rate: 117.2,
      transferRateOverride: false,
      hasRateOverride: false,
      source: { rateOverride: true },
      destination: { rateOverride: false },
    });
    const args = {
      transferId: 'transfer-1',
      rate: 118.25,
      transferRateOverride: true,
    };

    const undo = getUndoSpec('transactions.updateTransferRate');
    const before = await undo?.capture?.(args);
    await executeMutationOp('transactions.updateTransferRate', args);
    const inverse = undo?.build(args, undefined, before);

    expect(transactionMocks.updateTransferRate).toHaveBeenCalledWith(
      'transfer-1',
      118.25,
      true,
      undefined,
      undefined
    );
    expect(inverse).toEqual([
      {
        op: 'transactions.updateTransferRate',
        args: {
          transferId: 'transfer-1',
          rate: 117.2,
          transferRateOverride: false,
          sourceRateOverride: true,
          destinationRateOverride: false,
        },
      },
    ]);
  });
});
