import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allGuides } from 'contentlayer/generated';
import { ArrowLeft, ArrowRightCircle, Clock3 } from 'lucide-react';

import { Mdx } from '@/components/mdx-components';
import { Badge } from '@/components/ui/badge';

const publishedGuides = allGuides.filter((guide) => guide.published !== false);
const guidesByKey = new Map(
  publishedGuides.map((guide) => [`${guide.locale}:${guide.slug}`, guide])
);

/** Falls back to the English guide so a partial translation never 404s. */
const getGuideFromParams = (slugSegments: string[], locale: string) => {
  const slug = slugSegments.join('/');
  return guidesByKey.get(`${locale}:${slug}`) ?? guidesByKey.get(`en:${slug}`);
};

const isTranslated = (slugSegments: string[], locale: string) =>
  locale === 'en' || guidesByKey.has(`${locale}:${slugSegments.join('/')}`);

export function generateStaticParams() {
  return publishedGuides
    .filter((guide) => guide.locale === 'en')
    .map((guide) => ({ slug: guide.slugSegments }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[]; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const guide = getGuideFromParams(slug, locale);
  if (!guide) {
    notFound();
  }

  const title = `${guide.title} — Budgero Docs`;
  const description = guide.summary;
  const canonical = `https://budgero.app/docs/${guide.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string[]; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docs_slug_');
  const guide = getGuideFromParams(slug, locale);
  if (!guide) {
    notFound();
  }

  const badgeLabel = guide.badge ?? 'Guide';
  const machineTranslated = locale !== 'en' && isTranslated(slug, locale);

  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background px-3 py-1 font-medium text-foreground transition hover:border-border hover:bg-background/80"
            >
              <ArrowLeft className="size-4" aria-hidden /> {t('back_to_docs')} </Link>
            <Badge className="rounded-full border border-primary/30 bg-primary/15 text-primary">
              {badgeLabel}
            </Badge>
            {guide.readingTimeMinutes ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background px-3 py-1 text-foreground/70">
                <Clock3 className="size-3.5" aria-hidden />
                {guide.readingTimeMinutes} {t('min_read')} </span>
            ) : null}
          </div>
          {machineTranslated ? (
            <p className="mt-6 rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {t('machine_translated_notice')}{' '}
              <Link href={`/docs/${slug.join('/')}`} className="underline hover:text-foreground">
                {t('machine_translated_read_english')}
              </Link>
            </p>
          ) : null}
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{guide.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {guide.summary}
          </p>
          {guide.takeaways && guide.takeaways.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"> {t('in_this_guide')} </h2>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {guide.takeaways.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span
                      className="mt-1 inline-block size-1.5 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Mdx code={guide.body.code} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 px-0 text-sm">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 font-semibold text-foreground transition hover:border-border hover:bg-background/80"
          > {t('back_to_docs')} </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
          > {t('explore_more_guides')} <ArrowRightCircle className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
