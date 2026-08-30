import { describe, expect, it } from 'vitest';
import {
  buildRecurringSchedule,
  createRecurringFormSettings,
  isRecurringEndConditionValid,
  recurringInitialToTransactionValues,
} from './recurring-form';

describe('recurring transaction form helpers', () => {
  it('maps the template name to Payee and its start date to the transaction date', () => {
    const values = recurringInitialToTransactionValues({
      name: 'Power company',
      accountId: 3,
      categoryName: 'Utilities',
      schedule: {
        startDate: '2026-08-30',
        intervalUnit: 'month',
        intervalCount: 3,
      },
    });

    expect(values).toMatchObject({
      payee: 'Power company',
      selectedFromAccount: '3',
      selectedCategory: 'Utilities',
      transactionType: 'outflow',
    });
    expect(values?.transactionDate).toEqual(new Date(2026, 7, 30));
  });

  it('preserves quarterly cadence and count end conditions', () => {
    const settings = createRecurringFormSettings({
      schedule: {
        startDate: '2026-08-30',
        intervalUnit: 'month',
        intervalCount: 3,
        occurrenceCount: 12,
      },
    });

    expect(settings.frequency).toBe('month:3');
    expect(settings.endMode).toBe('count');
    expect(isRecurringEndConditionValid(settings)).toBe(true);
    expect(buildRecurringSchedule(new Date(2026, 7, 30), settings)).toEqual({
      startDate: '2026-08-30',
      intervalUnit: 'month',
      intervalCount: 3,
      endDate: null,
      occurrenceCount: 12,
    });
  });

  it('rejects an incomplete occurrence-count end condition', () => {
    const settings = createRecurringFormSettings();
    settings.endMode = 'count';
    settings.occurrenceCount = '';

    expect(isRecurringEndConditionValid(settings)).toBe(false);
  });
});
