import { describe, expect, it } from 'vitest';
import { asMilli, fromDecimal, ZERO_MILLI } from '@shared/lib/currency/milli';
import { getTransactionSignedAmount, mapToTransactionRow } from './spending-drawer.utils';
import type { Transaction } from './types';

describe('spending-drawer utils', () => {
  it('uses positive amount for category inflows', () => {
    expect(
      getTransactionSignedAmount({
        InflowConverted: asMilli(125_000),
        OutflowConverted: ZERO_MILLI,
      })
    ).toBe(125_000);
  });

  it('uses negative amount for category outflows', () => {
    expect(
      getTransactionSignedAmount({
        InflowConverted: ZERO_MILLI,
        OutflowConverted: fromDecimal(42.5),
      })
    ).toBe(-42_500);
  });

  it('preserves category and label metadata when mapping to quick-view rows', () => {
    const tx: Transaction = {
      ID: 1,
      Date: '2026-03-24',
      Memo: 'Income',
      Account: 'Checking',
      Category: 'Salary',
      CategoryID: 12,
      InflowConverted: asMilli(1_000_000),
      OutflowConverted: ZERO_MILLI,
      LabelID: 7,
      Label: 'Corolla',
      LabelColor: '#22c55e',
    };

    const mapped = mapToTransactionRow(tx);

    expect(mapped.Category).toBe('Salary');
    expect(mapped.CategoryID).toBe(12);
    expect(mapped.InflowConverted).toBe(1_000_000);
    expect(mapped.OutflowConverted).toBe(0);
    // Regression: the quick-view card reads transaction.LabelID, so the mapper
    // must carry the label through or the card always shows "No label".
    expect(mapped.LabelID).toBe(7);
    expect(mapped.Label).toBe('Corolla');
    expect(mapped.LabelColor).toBe('#22c55e');
  });

  it('defaults label fields to null when the source has none', () => {
    const mapped = mapToTransactionRow({
      ID: 2,
      Date: '2026-03-24',
      Memo: '',
      Account: 'Checking',
      Category: 'Salary',
      CategoryID: 12,
      InflowConverted: ZERO_MILLI,
      OutflowConverted: asMilli(50_000),
    });

    expect(mapped.LabelID).toBeNull();
  });
});
