import { describe, expect, it } from 'vitest';
import { asMilli, type TransactionSplit } from '@budgero/core/browser';
import { extractSplitAmount, toEditableSplit } from './table-utils';

const split: TransactionSplit = {
  ID: 1,
  TransactionID: 2,
  CategoryID: 3,
  Memo: '',
  Payee: 'Split shop',
  InflowConverted: asMilli(0),
  OutflowConverted: asMilli(110_000),
  InflowNative: asMilli(0),
  OutflowNative: asMilli(100_000),
  OrderIndex: 0,
};

describe('split amount currency selection', () => {
  it('uses converted amounts in budget-currency mode', () => {
    expect(extractSplitAmount(split, 'converted')).toBe(110_000);
    expect(toEditableSplit(split, 0, 'converted')).toMatchObject({
      amount: 110_000,
      payee: 'Split shop',
    });
  });

  it('uses native amounts in account-currency mode', () => {
    expect(extractSplitAmount(split, 'native')).toBe(100_000);
    expect(toEditableSplit(split, 0, 'native').amount).toBe(100_000);
  });

  it('falls back to converted values for legacy rows without native amounts', () => {
    const legacy = { ...split, InflowNative: null, OutflowNative: null };
    expect(extractSplitAmount(legacy, 'native')).toBe(110_000);
  });
});
