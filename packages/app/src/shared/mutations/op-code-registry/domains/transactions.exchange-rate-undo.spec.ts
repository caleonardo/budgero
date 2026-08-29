import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MutationExecutor, type UndoEntry } from '@budgero/runtime';
import {
  executeMutationOp,
  getInvalidatesForOp,
  getUndoSpec,
} from '@shared/mutations/op-code-registry';
import { useUndoStore } from '@shared/mutations/UndoStore';

const transactionState = vi.hoisted(() => ({
  ID: 42,
  BudgetID: 7,
  ExchangeRate: 1.1582036,
  ExchangeRateOverride: false,
}));
const transactionMocks = vi.hoisted(() => ({
  getTransactionByID: vi.fn(),
  updateTransactionColumn: vi.fn(),
}));
const runtimeMocks = vi.hoisted(() => ({ executeMutation: vi.fn() }));

vi.mock('@shared/runtime/global', () => ({
  getRuntime: () => ({
    services: () => ({ transactions: transactionMocks }),
    mutationsRouter: () => ({ execute: runtimeMocks.executeMutation }),
  }),
}));

describe('transactions.updateColumn exchange-rate undo', () => {
  beforeEach(() => {
    transactionState.ExchangeRate = 1.1582036;
    transactionState.ExchangeRateOverride = false;
    transactionMocks.getTransactionByID.mockReset();
    transactionMocks.updateTransactionColumn.mockReset();
    runtimeMocks.executeMutation.mockReset();
    useUndoStore.getState().clear();

    transactionMocks.getTransactionByID.mockImplementation(() => ({ ...transactionState }));
    transactionMocks.updateTransactionColumn.mockImplementation(
      (_id: number, _column: string, rate: number, override?: boolean) => {
        transactionState.ExchangeRate = rate;
        transactionState.ExchangeRateOverride = override ?? true;
      }
    );
  });

  it('restores the previous rate and override flag, then reapplies both on redo', async () => {
    const executor = new MutationExecutor({
      executeOp: executeMutationOp,
      getUndoSpec,
      getInvalidatesForOp,
      getQueryClient: () => undefined,
      pushUndo: (entry: UndoEntry) => useUndoStore.getState().push(entry),
      recordHistory: () => {},
      getActiveSpaceId: () => 'space-1',
      getSpaceRole: () => 'owner',
    });
    runtimeMocks.executeMutation.mockImplementation((spec) => executor.execute(spec));

    await executor.execute({
      op: 'transactions.updateColumn',
      payload: { id: 42, budgetId: 7, columnName: 'ExchangeRate', newValue: 1.1 },
    });

    expect(transactionState).toMatchObject({ ExchangeRate: 1.1, ExchangeRateOverride: true });
    expect(useUndoStore.getState().past[0]?.undo).toEqual([
      {
        op: 'transactions.updateColumn',
        args: {
          id: 42,
          budgetId: 7,
          columnName: 'ExchangeRate',
          newValue: 1.1582036,
          exchangeRateOverride: false,
        },
      },
    ]);

    await useUndoStore.getState().undo();
    expect(transactionState).toMatchObject({
      ExchangeRate: 1.1582036,
      ExchangeRateOverride: false,
    });

    await useUndoStore.getState().redo();
    expect(transactionState).toMatchObject({ ExchangeRate: 1.1, ExchangeRateOverride: true });
  });
});
