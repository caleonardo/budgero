import type { MetadataRoute } from 'next';
import { locales } from '../i18n/routing.ts';
import { isPublished, localizedPath, type LocalizedPost } from './content-routing.ts';

const SITE = 'https://budgero.app';

export function normalizeDate(value: string | Date): string | undefined {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function localizedRouteSitemap(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return routes.flatMap((entry) => {
    const pathname = entry.url.replace(SITE, '') || '/';
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${SITE}${localizedPath(locale, pathname)}`])
    );
    return locales.map((locale) => ({
      ...entry,
      url: languages[locale],
      alternates: { languages: { ...languages, 'x-default': languages.en } },
    }));
  });
}

interface Guide {
  locale: string;
  slug: string;
  url: string;
  published?: boolean;
}

export function guideSitemap(guides: Guide[]): MetadataRoute.Sitemap {
  const published = guides.filter(isPublished);
  return published.map((guide) => {
    const languages = Object.fromEntries(
      published
        .filter((variant) => variant.slug === guide.slug)
        .map((variant) => [variant.locale, `${SITE}${variant.url}`])
    );
    return {
      url: `${SITE}${guide.url}`,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: { ...languages, ...(languages.en ? { 'x-default': languages.en } : {}) },
      },
    };
  });
}

export function postSitemap(
  posts: (LocalizedPost & { date: string; updated?: string })[]
): MetadataRoute.Sitemap {
  return posts.filter(isPublished).map((post) => ({
    url: `${SITE}${post.url}`,
    lastModified: normalizeDate(post.updated || post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
}
