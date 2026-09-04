import { describe, expect, it } from 'vitest';
import type { GetTransactionsByAccountAndMonthRow } from '@budgero/core/browser';
import { asMilli } from '@shared/lib/currency/milli';
import { getBiggestOnBudgetOutflows } from './at-a-glance.utils';

function transaction(
  id: number,
  outflow: number,
  accountOnBudget: boolean | undefined,
  transferId?: string
): GetTransactionsByAccountAndMonthRow {
  return {
    ID: id,
    Date: '2026-09-01',
    Category: 'Test',
    Memo: '',
    Reconciled: false,
    InflowConverted: asMilli(0),
    OutflowConverted: asMilli(outflow),
    AccountOnBudget: accountOnBudget,
    RunningBalanceConverted: asMilli(0),
    TransferID: transferId,
  };
}

describe('getBiggestOnBudgetOutflows', () => {
  it('excludes off-budget activity and transfers before ranking', () => {
    const result = getBiggestOnBudgetOutflows([
      transaction(1, 9_000_000, false),
      transaction(2, 3_000_000, true),
      transaction(3, 8_000_000, true, 'transfer-1'),
      transaction(4, 5_000_000, true),
      // Missing flags are legacy on-budget rows.
      transaction(5, 4_000_000, undefined),
    ]);

    expect(result.map((item) => item.ID)).toEqual([4, 5, 2]);
  });
});
