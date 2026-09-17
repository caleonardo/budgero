import { UmamiScript } from '@/components/umami-script';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Poppins } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  return {
    metadataBase: new URL('https://budgero.app'),
    title: copy('u_d4428ac1d5c6'),
    description: copy('u_d7b1ce8ffcc1'),
    keywords: [
      copy('u_7c5aa78477f8'),
      copy('u_6ab0c199ff3d'),
      copy('u_f574c2cca450'),
      copy('u_4b4916a1c2ac'),
      copy('u_ccc3e94c87a9'),
      copy('u_6aeda317cad1'),
      copy('u_8fe4c82376ed'),
      copy('u_59f8ff1d8976'),
      copy('u_83f19081b014'),
      copy('u_4734b30117cd'),
    ],
    authors: [{ name: copy('u_045497ff4fcf') }],
    robots: { index: true, follow: true },
    alternates: {
      // Indexable routes set their own canonical; never inherit the homepage URL.
      types: {
        'application/rss+xml': 'https://budgero.app/feed.xml',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
        { url: '/logo_192.png', sizes: '192x192', type: 'image/png' },
        { url: '/logo_512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/logo_192.png', sizes: '192x192', type: 'image/png' },
        { url: '/logo_512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    applicationName: 'Budgero',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: copy('u_045497ff4fcf') },
    openGraph: {
      type: 'website',
      url: 'https://budgero.app/',
      siteName: 'Budgero',
      title: copy('u_d4428ac1d5c6'),
      description: copy('u_6de00ac646b4'),
      // Image is auto-emitted by the `opengraph-image.tsx` file convention at the app root
      // (renders a 1200x630 PNG at /opengraph-image). Per-page overrides can drop a sibling
      // opengraph-image.tsx in the route folder, or set openGraph.images explicitly.
    },
    twitter: {
      card: 'summary_large_image',
      title: copy('u_d4428ac1d5c6'),
      description: copy('u_6de00ac646b4'),
      // Twitter image is auto-emitted by `opengraph-image.tsx` (Next 15 reuses it for Twitter).
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#111827',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        {/* Umami — cookieless, self-hosted, no consent required (no device
            storage). Proxied through /stats (see next.config.ts rewrites) so
            adblockers don't filter the third-party hostname. data-domains
            keeps localhost/preview traffic out of production stats. */}
        <UmamiScript />
        <NextIntlClientProvider>
          <Providers>
            <SiteHeader />
            {children}
            <SiteFooter />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Budgero',
                  url: 'https://budgero.app/',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://budgero.app/logo_512.png',
                    width: 512,
                    height: 512,
                  },
                }),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'Budgero',
                  url: 'https://budgero.app/',
                }),
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
