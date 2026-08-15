import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'de', 'fr', 'es', 'nl'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  nl: 'Nederlands',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  // English keeps its existing unprefixed URLs; only new locales get a prefix.
  // Moving the indexed English pages would throw away the site's search history.
  localePrefix: 'as-needed',
});
