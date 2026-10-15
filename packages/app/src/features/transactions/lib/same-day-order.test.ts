import { describe, expect, it } from 'vitest';
import { asMilli } from '@shared/lib/currency/milli';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import { orderWithinDays } from './same-day-order';

function row(ID: number, Date: string, amount: number, runningBalance: number) {
  return {
    ID,
    Date,
    AccountID: 1,
    InflowConverted: asMilli(Math.max(amount, 0)),
    OutflowConverted: asMilli(Math.max(-amount, 0)),
    RunningBalanceConverted: asMilli(runningBalance),
    RunningBalanceNative: asMilli(runningBalance),
  } as GetTransactionsByAccountRow;
}

// Stored order: date desc, id desc. Balance before Oct 2 was 1000.
const rows = [
  row(4, '2026-10-02', -10, 1290),
  row(3, '2026-10-02', 500, 1300),
  row(2, '2026-10-02', -200, 800),
  row(1, '2026-10-01', 1000, 1000),
];

describe('orderWithinDays', () => {
  it('keeps the stored order for newest-first', () => {
    expect(orderWithinDays(rows, 'newest')).toBe(rows);
  });

  it('puts outflows then inflows first, largest first, and re-derives balances', () => {
    const ordered = orderWithinDays(rows, 'amount');
    expect(ordered.map((r) => r.ID)).toEqual([2, 4, 3, 1]);
    // End of Oct 2 stays 1290; each row below subtracts the row above it.
    expect(ordered.map((r) => r.RunningBalanceConverted)).toEqual([1290, 1490, 1500, 1000]);
  });
});
