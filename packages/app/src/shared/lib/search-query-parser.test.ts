import { afterEach, describe, expect, it, vi } from 'vitest';
import { format } from 'date-fns';
import { parseSearchQuery, removeTokenFromQuery } from './search-query-parser';

describe('search-query-parser label support', () => {
  const categories = ['Groceries', 'Income'];
  const labels = ['Vacation', 'Vacation Fund', 'Urgent'];

  it('parses label:<name> as a semantic label filter', () => {
    const parsed = parseSearchQuery('label:Vacation coffee', categories, labels);

    expect(parsed.labelMatches).toEqual(['Vacation']);
    expect(parsed.matchedTokens.some((token) => token.type === 'label')).toBe(true);
    expect(parsed.textQuery).toBe('coffee');
  });

  it('supports quoted label tokens combined with other semantic filters', () => {
    const parsed = parseSearchQuery(
      'last 30 days outflows label:"Vacation Fund" groceries hotel',
      categories,
      labels
    );

    expect(parsed.dateRange).not.toBeNull();
    expect(parsed.transactionType).toBe('outflows');
    expect(parsed.categoryMatches).toEqual(['Groceries']);
    expect(parsed.labelMatches).toEqual(['Vacation Fund']);
    expect(parsed.textQuery).toBe('hotel');
  });

  it('removes label tokens from the original query', () => {
    const query = 'label:Urgent dinner';
    const parsed = parseSearchQuery(query, categories, labels);
    const labelToken = parsed.matchedTokens.find((token) => token.type === 'label');
    if (!labelToken) {
      throw new Error('Expected a label token to be present');
    }

    const next = removeTokenFromQuery(query, labelToken, parsed);
    expect(next).toBe('dinner');
  });
});

describe('week boundaries', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [0, '2023-01-01', '2022-12-25', '2022-12-31'],
    [1, '2022-12-26', '2022-12-19', '2022-12-25'],
  ] as const)(
    'uses week start %s on a Sunday at the year boundary',
    (weekStartsOn, thisStart, lastStart, lastEnd) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 0, 1, 12));
      const current = parseSearchQuery('this week groceries', [], [], weekStartsOn);
      const previous = parseSearchQuery('last week groceries', [], [], weekStartsOn);
      expect(format(current.dateRange!.from, 'yyyy-MM-dd')).toBe(thisStart);
      expect(format(current.dateRange!.to, 'yyyy-MM-dd HH:mm:ss.SSS')).toBe(
        '2023-01-01 23:59:59.999'
      );
      expect(format(previous.dateRange!.from, 'yyyy-MM-dd HH:mm:ss.SSS')).toBe(
        `${lastStart} 00:00:00.000`
      );
      expect(format(previous.dateRange!.to, 'yyyy-MM-dd HH:mm:ss.SSS')).toBe(
        `${lastEnd} 23:59:59.999`
      );
      expect(current.textQuery).toBe('groceries');
      expect(removeTokenFromQuery('this week groceries', current.matchedTokens[0], current)).toBe(
        'groceries'
      );
    }
  );
});
