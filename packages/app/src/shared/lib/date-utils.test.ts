import { describe, expect, it } from 'vitest';
import { isFutureDate, formatDateISO, formatDueLabel } from './date-utils';

function isoOffsetDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

describe('isFutureDate', () => {
  it('does not flag today as future (regression: today kept showing the future badge)', () => {
    expect(isFutureDate(isoOffsetDays(0))).toBe(false);
  });

  it('does not flag yesterday as future', () => {
    expect(isFutureDate(isoOffsetDays(-1))).toBe(false);
  });

  it('flags tomorrow as future', () => {
    expect(isFutureDate(isoOffsetDays(1))).toBe(true);
  });

  it('accepts a Date as well as an ISO string', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isFutureDate(tomorrow)).toBe(true);
  });

  it('returns false for empty or invalid input', () => {
    expect(isFutureDate(null)).toBe(false);
    expect(isFutureDate('')).toBe(false);
    expect(isFutureDate('not-a-date')).toBe(false);
  });
});

describe('formatDueLabel', () => {
  const now = new Date(2026, 7, 18, 18, 30); // Aug 18 2026, evening local time
  it('labels by calendar day, not elapsed hours', () => {
    expect(formatDueLabel('2026-08-18', now)).toBe('today');
    expect(formatDueLabel('2026-08-19', now)).toBe('tomorrow');
    expect(formatDueLabel('2026-08-17', now)).toBe('yesterday');
    expect(formatDueLabel('2026-08-21', now)).toBe('in 3 days');
    expect(formatDueLabel('2026-08-10', now)).toBe('8 days ago');
    expect(formatDueLabel('garbage', now)).toBe('garbage');
  });
});
