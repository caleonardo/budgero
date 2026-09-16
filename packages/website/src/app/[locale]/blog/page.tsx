import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { PenLine, Sparkles, SquareLibrary } from 'lucide-react';
import { allPosts } from 'contentlayer/generated';
import { postsForLocale } from '@/lib/content-routing';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;
  return withLocalizedUrls(locale, '/blog', {
    title: copy('u_0a9851faf061'),
    description: copy('u_78b8e2dd651f'),
    alternates: { canonical: 'https://budgero.app/blog' },
    openGraph: {
      title: copy('u_0a9851faf061'),
      description: copy('u_63844496e895'),
      url: 'https://budgero.app/blog',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy('u_0a9851faf061'),
      description: copy('u_63844496e895'),
    },
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations({
    locale: (await params).locale,
    namespace: 'blog',
  });
  const posts = postsForLocale(allPosts, locale).sort(
    (a, b) => Number(new Date(b.date)) - Number(new Date(a.date))
  );

  const heroHighlights = [
    { icon: Sparkles, label: copy('u_ef4c05efaf50') },
    { icon: PenLine, label: copy('u_dec0a5483081') },
    { icon: SquareLibrary, label: copy('u_f40e441f6b0e') },
  ] as const;

  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 pt-24 sm:pt-28">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
            {' '}
            {copy('u_52f0d35ee7cd')}{' '}
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {' '}
            {copy('u_1752f222ecce')}{' '}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {' '}
            {copy('u_6d7effa35048')}{' '}
            <Link href="/zero-based-budgeting" className="underline hover:text-foreground">
              {' '}
              {copy('u_365b4a450a89')}{' '}
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {heroHighlights.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:py-20">
        {posts.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-background/50 text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-foreground">
                {' '}
                {t('no_posts_just_yet')}{' '}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {' '}
              {t('we_re_drafting_the_first_story')}{' '}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <article key={post._id} className="group">
                <Card className="h-full overflow-hidden border-border/70 bg-background/70 transition hover:border-border hover:shadow-lg hover:shadow-black/5">
                  {post.image || post.cover ? (
                    <Link href={`/blog/${post.slugAsParams}`} className="block">
                      <Image
                        src={(post.image || post.cover) as string}
                        alt={post.title}
                        width={1200}
                        height={630}
                        className="h-auto w-full border-b border-border object-cover transition group-hover:brightness-[0.98]"
                        priority={false}
                      />
                    </Link>
                  ) : null}
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                      <Link
                        href={`/blog/${post.slugAsParams}`}
                        className="transition hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {new Date(post.date).toLocaleDateString(locale, {
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                      {typeof post.readingTimeMinutes === 'number'
                        ? copy('u_6752941d7879', {
                            p0: post.readingTimeMinutes,
                          })
                        : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{post.description}</p>
                    {post.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="rounded-full px-2.5 py-1 text-xs"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
