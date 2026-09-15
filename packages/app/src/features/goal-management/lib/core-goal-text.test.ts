import { afterEach, expect, it } from 'vitest';
import { activateLocale } from '@shared/i18n';
import { translateGoalText } from './core-goal-text';

afterEach(() => activateLocale('en', false));

it('translates current core cycle descriptions and refreshes with the locale', async () => {
  await activateLocale('de', false);
  expect(translateGoalText('Cycle: 2026-01 to 2026-12')).toBe('Zyklus: 2026-01 bis 2026-12');
  expect(translateGoalText('Cycle: 2026-01 to 2026-04 (repeats every 4 months)')).toBe(
    'Zyklus: 2026-01 bis 2026-04 (wiederholt sich alle 4 Monate)'
  );
  await activateLocale('fr', false);
  expect(translateGoalText('Cycle: 2026-01 to 2026-12')).toBe('Cycle : de 2026-01 à 2026-12');
  expect(translateGoalText('Unknown extension message')).toBe('Unknown extension message');
});
