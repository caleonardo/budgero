import { afterEach, expect, it } from 'vitest';
import { activateLocale } from '@shared/i18n';
import { klaroConfig, refreshKlaroLocale } from './klaro-config';

afterEach(async () => {
  await activateLocale('en', false);
  refreshKlaroLocale();
});

it('passes translated strings to Klaro while preserving consent identifiers', async () => {
  for (const [locale, label] of [['de', 'Alle akzeptieren'], ['fr', 'Tout accepter']] as const) {
    await activateLocale(locale, false);
    refreshKlaroLocale();
    expect(klaroConfig.lang).toBe(locale);
    const copy = klaroConfig.translations?.[locale] as { acceptAll: string; consentModal: { title: string } };
    expect(copy.acceptAll).toBe(label);
    expect(typeof copy.consentModal.title).toBe('string');
    expect(klaroConfig.services?.[0]).toMatchObject({ name: 'posthog', purposes: ['analytics'] });
    expect(klaroConfig.default).toBe(false);
  }
});
