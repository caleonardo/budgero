import type { MetadataRoute } from 'next';
import { allGuides, allPosts } from 'contentlayer/generated';

import { changelogEntries } from '@/lib/changelog-data';
import { routing } from '@/i18n/routing';

function normalizeDate(value: string | Date): string | undefined {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://budgero.app';

  const publishedGuides = allGuides.filter((guide) => guide.published !== false);

  // Only include lastModified when we have an editorial date. Filesystem mtimes
  // and the build time change on deployment even when the content does not.
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/self-hostable`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/monarch-money-alternative`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/vs-ynab`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/ynab-alternative-europe`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/ynab-alternative-uk`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/ynab-alternative-australia`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/monarch-money-multi-currency`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/firefly-iii-alternative`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/self-hosted-ynab-alternative`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/monarch-money-europe-alternative`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/best-ynab-alternatives`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/encrypted-budgeting`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/multi-currency-budgeting`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/zero-based-budgeting`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/everydollar-alternative`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/goodbudget-alternative`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/pocketguard-alternative`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/quicken-simplifi-alternative`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/docs`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${base}/blog`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/donate`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const posts: MetadataRoute.Sitemap = allPosts
    .filter((post) => !post.draft && post.published !== false)
    .map((post) => ({
      url: `${base}${post.url}`,
      lastModified: normalizeDate(post.updated || post.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const guides: MetadataRoute.Sitemap = publishedGuides.map((guide) => ({
    url: `${base}${guide.url}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const latestChangelogDate = changelogEntries
    // Changelog dates are written as "September 4, 2026" without a time zone.
    // Interpret them as UTC so deployment environments produce the same date.
    .map((entry) => new Date(`${entry.date} UTC`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const changelogLastModified = latestChangelogDate?.toISOString();
  const changelogRoute: MetadataRoute.Sitemap = [
    {
      url: `${base}/changelog`,
      lastModified: changelogLastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const all = [...routes, ...posts, ...guides, ...changelogRoute];

  // Emit every page once per locale, each carrying the full hreflang set so
  // search engines treat them as translations rather than competing pages.
  return all.flatMap((entry) => {
    const pathname = entry.url.replace(base, '') || '/';

    // Blog posts are intentionally English-only. Emitting locale variants with
    // hreflang would tell search engines translations exist when they do not.
    if (pathname.startsWith('/blog/')) return [entry];

    const languages = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        locale === routing.defaultLocale ? `${base}${pathname}` : `${base}/${locale}${pathname}`,
      ])
    );

    return routing.locales.map((locale) => ({
      ...entry,
      url: locale === routing.defaultLocale ? `${base}${pathname}` : `${base}/${locale}${pathname}`,
      alternates: { languages: { ...languages, 'x-default': `${base}${pathname}` } },
    }));
  });
}
