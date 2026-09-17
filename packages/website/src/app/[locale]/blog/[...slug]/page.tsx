import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import { allPosts } from 'contentlayer/generated';
import { Mdx } from '@/components/mdx-components';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { postsForLocale, resolvePost } from '@/lib/content-routing';

interface Params {
  slug: string[];
  locale: string;
}

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}): Omit<Params, 'locale'>[] {
  return postsForLocale(allPosts, params.locale).map((post) => ({
    slug: post.slugAsParams.split('/'),
  }));
}

function getPost(locale: string, slug: string[]) {
  const result = resolvePost(allPosts, locale, slug.join('/'));
  if (result.redirect) permanentRedirect(result.redirect);
  if (!result.post) notFound();
  return result.post;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { slug, locale } = await params;
  const post = getPost(locale, slug);
  const images = post.image ? [post.image] : ['/logo_144.png'];
  const publishedTime = new Date(post.date).toISOString();
  const modifiedTime = post.updated ? new Date(post.updated).toISOString() : publishedTime;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://budgero.app${post.url}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://budgero.app${post.url}`,
      images,
      publishedTime,
      modifiedTime,
      authors: [copy('u_045497ff4fcf')],
    },
    twitter: {
      title: post.title,
      description: post.description,
      images,
      card: 'summary_large_image',
    },
  } satisfies Metadata;
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale: (await params).locale,
    namespace: 'blog_slug_',
  });
  const post = getPost(locale, slug);
  const readingCopy = await getTranslations({ locale, namespace: 'docs_slug_' });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  const readingTime =
    typeof post.readingTimeMinutes === 'number'
      ? `${post.readingTimeMinutes} ${readingCopy('min_read')}`
      : null;

  const publishedTime = new Date(post.date).toISOString();
  const modifiedTime = post.updated ? new Date(post.updated).toISOString() : publishedTime;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: post.locale,
    headline: post.title,
    description: post.description,
    image: post.image ? `https://budgero.app${post.image}` : 'https://budgero.app/logo_512.png',
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Organization',
      name: copy('u_045497ff4fcf'),
      url: 'https://budgero.app',
    },
    publisher: {
      '@type': 'Organization',
      name: copy('u_045497ff4fcf'),
      logo: {
        '@type': 'ImageObject',
        url: 'https://budgero.app/logo_512.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://budgero.app${post.url}`,
    },
  };

  return (
    <article className="container mx-auto max-w-3xl px-4 pb-10 pt-24 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <header className="mb-8 space-y-3">
        <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
          {' '}
          {t('back_to_blog')}{' '}
        </Link>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{copy('u_41fd11644bc5')}</span>
          <span aria-hidden>•</span>
          <time dateTime={publishedTime}>{formatDate(post.date)}</time>
          {post.updated && modifiedTime !== publishedTime ? (
            <>
              <span aria-hidden>•</span>
              <span>
                {' '}
                {copy('u_3a5ecca188c0')}{' '}
                <time dateTime={modifiedTime}>{formatDate(post.updated)}</time>
              </span>
            </>
          ) : null}
          {readingTime ? (
            <>
              <span aria-hidden>•</span>
              <span>{readingTime}</span>
            </>
          ) : null}
        </div>
        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        {post.image || post.cover ? (
          <div className="mt-4">
            <Image
              src={(post.image || post.cover) as string}
              alt={post.title}
              width={1200}
              height={630}
              className="h-auto w-full rounded-md border border-border"
              priority
            />
          </div>
        ) : null}
        {post.description ? <p className="text-muted-foreground">{post.description}</p> : null}
      </header>

      <Mdx code={post.body.code} />

      <div className="mt-10">
        <Button asChild variant="outline">
          <Link href="/blog">{t('back_to_blog_2')}</Link>
        </Button>
      </div>
    </article>
  );
}
