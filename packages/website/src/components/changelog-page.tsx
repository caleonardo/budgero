import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Sparkles,
  Wrench,
  ArrowUpRight,
  Archive,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { changelogEntries } from '@/lib/changelog-data';
import {
  changelogPageCount,
  changelogPath,
  entriesForChangelogPage,
} from '@/lib/changelog-pagination';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const latestEntry = changelogEntries.find((entry) => entry.isLatest) ?? changelogEntries[0];

export async function changelogMetadata(locale: string, page = 1): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'changelog' });
  const title = page === 1 ? t('meta_title') : `${t('meta_title')} — ${t('page_number', { page })}`;
  return withLocalizedUrls(locale, changelogPath(page), {
    title,
    description: t('meta_description'),
    openGraph: { title, description: t('meta_description') },
    twitter: { card: 'summary_large_image', title, description: t('meta_description') },
  });
}

const makeTypeMeta = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => ({
  new: {
    label: copy('u_18fdd549b2ed'),
    className: t('typeMeta_border_border_60_bg_muted_40'),
    icon: Sparkles,
  },

  improved: {
    label: copy('u_c3b959224fda'),
    className: t('typeMeta_border_border_60_bg_muted_40'),
    icon: ArrowUpRight,
  },

  fixed: {
    label: copy('u_1246fc93bca0'),
    className: t('typeMeta_border_border_60_bg_muted_40'),
    icon: Wrench,
  },

  'coming-soon': {
    label: t('typeMeta_coming_soon'),
    className: t('typeMeta_border_border_60_bg_muted_40'),
    icon: Clock3,
  },

  deprecated: {
    label: copy('u_6b2e8f83dd8e'),
    className: t('typeMeta_border_border_60_bg_muted_40'),
    icon: Archive,
  },
});

export async function ChangelogPage({ locale, page = 1 }: { locale: string; page?: number }) {
  setRequestLocale(locale);
  const copy = await getTranslations({ locale, namespace: 'updates' });
  const t = await getTranslations({ locale, namespace: 'changelog' });
  const typeMeta = makeTypeMeta(t, copy);
  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
            {' '}
            {t('what_s_new')}{' '}
          </Badge>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge className="rounded-full border border-primary/30 bg-primary/15 text-primary">
              {' '}
              {t('current_version')}{' '}
            </Badge>
            <span className="font-semibold text-foreground">{latestEntry.version}</span>
            <span aria-hidden>•</span>
            <span>{latestEntry.date}</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {' '}
            {t('budgero_changelog')}{' '}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {' '}
            {t('we_ship_improvements_weekly_so_you')}{' '}
          </p>
        </div>
      </section>

      <section className="container mx-auto space-y-12 px-4 py-12 sm:space-y-16 sm:py-16">
        <div className="relative">
          <div
            className="absolute left-[19px] top-0 h-full w-px bg-border/60 sm:left-6"
            aria-hidden
          >
            <span className="sr-only">{t('timeline')}</span>
          </div>
          <div className="space-y-12 sm:space-y-16">
            {entriesForChangelogPage(page).map((entry) => (
              <article id={entry.version} key={entry.version} className="relative pl-10 sm:pl-14">
                <div className="absolute left-0 top-9 flex size-10 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:left-[-8px]">
                  <CalendarDays className="size-5 text-muted-foreground" aria-hidden />
                </div>

                <Card className="overflow-hidden border-border/70 shadow-lg shadow-black/5 dark:shadow-none">
                  <div
                    className="h-1 w-full bg-gradient-to-r from-[#d7dbe2] via-[#8a93a3] to-[#111c34]"
                    aria-hidden
                  />
                  <CardHeader className="pt-8">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" aria-hidden />
                      <span>{entry.date}</span>
                      {entry.isLatest ? (
                        <Badge className="rounded-full border border-primary/30 bg-primary/15 text-primary">
                          {' '}
                          {t('latest')}{' '}
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-2xl font-bold sm:text-3xl">
                      {entry.version}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      {entry.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <ul className="grid gap-4 md:grid-cols-2">
                      {entry.items.map((item) => {
                        const meta = typeMeta[item.type];
                        const ItemIcon = meta.icon;

                        return (
                          <li
                            key={`${entry.version}-${item.title}`}
                            className="group rounded-xl border border-border/60 bg-background/60 p-5 transition-colors hover:border-border hover:bg-muted/40"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                                  meta.className
                                )}
                              >
                                <ItemIcon className="size-3.5" aria-hidden />
                                {meta.label}
                              </Badge>
                              <h3 className="text-base font-semibold text-foreground">
                                {item.title}
                              </h3>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                    {entry.acknowledgements?.map((acknowledgement) => (
                      <p
                        key={`${acknowledgement.githubUsername}-${acknowledgement.pullRequest}`}
                        className="mt-5 border-t border-border/60 pt-5 text-sm leading-relaxed text-muted-foreground"
                      >
                        {' '}
                        {copy('u_947aaee185e2')}{' '}
                        <a
                          href={`https://github.com/${acknowledgement.githubUsername}`}
                          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                        >
                          @{acknowledgement.githubUsername}
                        </a>{' '}
                        {copy('u_e76769ad210c')} {acknowledgement.contribution}{' '}
                        {copy('u_582967534d0f')}{' '}
                        <a
                          href={`https://github.com/tombadilo-bombadilo/budgero/pull/${acknowledgement.pullRequest}`}
                          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                        >
                          {' '}
                          {copy('u_0da44e33f01d')}
                          {acknowledgement.pullRequest}
                        </a>
                        .
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </div>

        <nav
          aria-label={t('pagination')}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {page > 1 && (
            <Link
              href={changelogPath(page - 1)}
              rel="prev"
              className="rounded-full border px-5 py-2 hover:bg-muted"
            >
              {t('newer_releases')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {t('page_of', { page, total: changelogPageCount })}
          </span>
          {page < changelogPageCount && (
            <Link
              href={changelogPath(page + 1)}
              rel="next"
              className="rounded-full border px-5 py-2 hover:bg-muted"
            >
              {t('older_releases')}
            </Link>
          )}
        </nav>

        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 px-8 py-10 text-center shadow-inner">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(120,120,120,0.18),transparent_55%)]"
            aria-hidden
          />
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {' '}
            {t('get_updates_the_moment_we_ship')}{' '}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {' '}
            {t('use')} <span className="font-medium text-foreground">{t('my_budgero_app')}</span>{' '}
            {t('to_stay_current_with_new_features')}{' '}
          </p>
          <a
            href="https://my.budgero.app"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            {' '}
            {t('head_to_the_app')} <ArrowRight className="ml-2 size-4" aria-hidden />
          </a>
        </div>
      </section>
    </main>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
