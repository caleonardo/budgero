import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const SITE = 'https://budgero.app';

const urlFor = (locale: string, path: string) =>
  locale === routing.defaultLocale ? `${SITE}${path || '/'}` : `${SITE}/${locale}${path}`;

/**
 * Points canonical/og URLs at the current locale's page and lists every
 * translation as an hreflang alternate. Without this, all locales claim the
 * English URL as canonical and search engines drop the translated pages.
 */
export function withLocalizedUrls(locale: string, path: string, meta: Metadata): Metadata {
  const canonical = urlFor(locale, path);
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, urlFor(l, path)])
  ) as Record<string, string>;
  languages['x-default'] = urlFor(routing.defaultLocale, path);

  return {
    ...meta,
    alternates: { ...meta.alternates, canonical, languages },
    openGraph: meta.openGraph ? { ...meta.openGraph, url: canonical } : meta.openGraph,
  };
}
