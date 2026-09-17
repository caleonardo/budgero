import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '@lingui/core';
import { messages } from '@/locales/de/messages.mjs';
import { wealthInsights } from './insights';
import { linearForecast } from './forecast';

// Dynamic English fragments used to leak into otherwise translated summaries.
describe('localized wealth insights', () => {
  afterEach(() => i18n.activate('en'));

  it.each([1, -1])('translates both directions of change (%s)', (direction) => {
    i18n.load('de', messages);
    i18n.activate('de');
    const points = [0, 1, 2, 3].map((index) => ({
      monthKey: `2026-0${index + 1}`,
      assets: 1_000_000 + direction * index * 100_000,
      debt: 100_000 + direction * index * 10_000,
      netWorth: 900_000 + direction * index * 90_000,
    }));
    const insights = wealthInsights(
      points,
      linearForecast(
        points.map((point) => point.netWorth),
        6
      ),
      {
        money: (value) => String(value),
        monthLabel: (value) => value,
      }
    );
    expect(insights).toHaveLength(3);
    expect(insights[0].text).toContain(direction > 0 ? 'stieg' : 'sank');
    expect(insights[1].text).toContain(direction > 0 ? 'stiegen' : 'sanken');
    expect(insights[2].text).toContain(direction > 0 ? 'Aufwärtstrend' : 'Abwärtstrend');
    expect(insights.map((insight) => insight.text).join(' ')).not.toMatch(
      /grew|fell|upward|downward/
    );
  });
});
