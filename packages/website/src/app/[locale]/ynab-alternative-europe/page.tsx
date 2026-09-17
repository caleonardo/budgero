import { getTranslations, setRequestLocale } from 'next-intl/server';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { useTranslations } from 'next-intl';
import { ComparisonReferences } from '@/components/comparison-references';
import { MultiCurrencyExample } from '@/components/multi-currency-example';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

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
  return withLocalizedUrls(locale, '/ynab-alternative-europe', {
    title: copy('u_9386ae8b5f23'),
    description: copy('u_7e2492f74a1f', {
      p0: pricing.monthly,
    }),
    keywords: [
      copy('u_6d3fe9686468'),
      copy('u_7390777b06b0'),
      copy('u_5dae5c27c483'),
      copy('u_cd95de5dc351'),
      copy('u_a80fb80a33a6'),
      copy('u_1868e523896c'),
      copy('u_7be780d6edf2'),
      copy('u_53921106d2f4'),
      copy('u_dadb33a1e9b1'),
      copy('u_54e5dda235ca'),
      copy('u_4c0e17a2876e'),
      copy('u_99cffb6f53eb'),
      copy('u_85618a87ec83'),
      copy('u_d1cd2a7a77b4'),
    ],
    alternates: { canonical: 'https://budgero.app/ynab-alternative-europe' },
    openGraph: {
      title: copy('u_9386ae8b5f23'),
      description: copy('u_f2a52b739fd8'),
      url: 'https://budgero.app/ynab-alternative-europe',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy('u_9386ae8b5f23'),
      description: copy('u_4b61249a4c8c'),
    },
  });
}

const comparisonData = (copy: CopyTranslator) => [
  {
    feature: copy('u_a52758b5e7fc'),
    budgero: copy('u_65d22dd416f6'),
    ynab: copy('u_fb0a5df888b0'),
    budgeroNote: copy('u_a3ea06ffde78'),
    ynabNote: copy('u_0e304669ec88'),
  },
  {
    feature: copy('u_cd0ef1a4f3ef'),
    budgero: copy('u_bcc6cd2da733'),
    ynab: false,
    budgeroNote: copy('u_64e3f4b3149d'),
    ynabNote: copy('u_1c3566888444'),
  },
  {
    feature: copy('u_a7d30283368d'),
    budgero: copy('u_6730f1c07c70', {
      p0: pricing.yearly,
    }),
    ynab: copy('u_ff027ceaf6a0'),
    budgeroNote: copy('u_dc60b3cc4bcb'),
    ynabNote: copy('u_5aad73edc340'),
  },
  {
    feature: copy('u_01b632b29cef'),
    budgero: true,
    ynab: false,
    budgeroNote: copy('u_d13bc8866ea1'),
    ynabNote: copy('u_6809dcc027ea'),
  },
  {
    feature: copy('u_2284493dc22a'),
    budgero: true,
    ynab: copy('u_c38456dfac02'),
    budgeroNote: copy('u_0e1a4340e907'),
    ynabNote: copy('u_e164616085d8'),
  },
  {
    feature: copy('u_0c3992b67600'),
    budgero: true,
    ynab: true,
    budgeroNote: null,
    ynabNote: null,
  },
  {
    feature: copy('u_4d3f4e3a228c'),
    budgero: true,
    ynab: 'N/A',
    budgeroNote: copy('u_cdf37efe2a75'),
    ynabNote: null,
  },
  {
    feature: copy('u_a87f8b3aa36a'),
    budgero: true,
    ynab: false,
    budgeroNote: copy('u_2609f174c29d'),
    ynabNote: null,
  },
];

const faqs = (copy: CopyTranslator) => [
  {
    q: copy('u_770a290002c1'),
    a: copy('u_9b9549f174a7'),
  },
  {
    q: copy('u_f3bcb5db18e7'),
    a: copy('u_2b34ec22b519'),
  },
  {
    q: copy('u_50a311b3babd'),
    a: copy('u_3f36646804bd', {
      p0: pricing.monthly,
      p1: pricing.yearly,
    }),
  },
  {
    q: copy('u_fd07e5492b00'),
    a: copy('u_b5774a66a61d'),
  },
  {
    q: copy('u_5870a6f8b75a'),
    a: copy('u_a9b4be93e582'),
  },
  {
    q: copy('u_1235c94b70af'),
    a: copy('u_ae79b7504d83'),
  },
  {
    q: copy('u_40d80a2e417e'),
    a: copy('u_ab5244ab7686'),
  },
];

function renderCellValue(val: unknown, note?: string | null, isHighlight?: boolean) {
  if (typeof val === 'boolean') {
    return (
      <div className="flex flex-col items-center gap-1">
        {val ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-foreground/35" />
        )}
        {note && <span className="text-xs text-foreground/55">{note}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`text-sm ${isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}
      >
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

export default async function YnabAlternativeEuropePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: copy('u_045497ff4fcf'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: [
          copy('u_2975104784a4'),
          copy('u_d598026a9cbc'),
          copy('u_aed6b7aa2a05'),
          copy('u_4828e60247c1'),
        ],
        url: 'https://budgero.app/ynab-alternative-europe',
        description: copy('u_9c3bcb94ceb6'),
        offers: [
          {
            '@type': 'Offer',
            name: copy('u_02c52ce2f60b'),
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: copy('u_94523db6cbd4'),
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: copy('u_6fdf0566337b'),
            price: pricing.yearly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ],
        featureList: [
          copy('u_0c3992b67600'),
          copy('u_e6072dcb869e'),
          copy('u_04202092ed07'),
          copy('u_05139f16c815'),
          copy('u_314e7c973ee7'),
          copy('u_9a326d07d39f'),
          copy('u_170eda937fe7'),
          copy('u_a87f8b3aa36a'),
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs(copy).map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: copy('u_3a78695388b3'),
            item: 'https://budgero.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy('u_986fccc3c032'),
            item: 'https://budgero.app/ynab-alternative-europe',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="relative z-10 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-4 lg:py-6">
            {/* Hero */}
            <section className="pt-24 pb-16 md:pt-32 md:pb-24 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 max-w-full whitespace-normal text-center px-3 py-1.5 text-xs sm:text-sm font-medium border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10"
                >
                  <Globe className="w-3.5 h-3.5 mr-2 shrink-0" />
                  <span>{copy('u_9da3c0527b53')}</span>
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {copy('u_1cbe403c2dfb')}{' '}
                  <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium">
                    {' '}
                    {copy('u_731442c09cf3')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {copy('u_c001f0f53e16')} {pricing.yearly}
                  {copy('u_7630817c1582')}{' '}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=hero">
                      {' '}
                      {copy('u_2e0d5e87f9b8')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{copy('u_1ef4c33993db')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {copy('u_7debc0d379da')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {copy('u_54a0ae50f896')}{' '}
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p> {copy('u_be877fa4a861')} </p>
                <p> {copy('u_953ef85ae4cc')} </p>
                <p>
                  {' '}
                  {copy('u_553d7f48c79c')}{' '}
                  <Link href="/docs/ynab-import" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_13755b2925f1')}{' '}
                  </Link>{' '}
                  {copy('u_4dc7dafbb24e')}{' '}
                </p>
              </div>
            </section>

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {copy('u_2987b9f7fe5f')}{' '}
                </h2>
                <p className="text-lg text-foreground/70"> {copy('u_2bc7f074d936')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                        {' '}
                        {copy('u_3d377ae910dc')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {copy('u_045497ff4fcf')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        YNAB
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparisonData(copy).map((row, index) => (
                      <tr
                        key={row.feature}
                        className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/25'}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          {row.feature}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.budgero, row.budgeroNote, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.ynab, row.ynabNote, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=mid-table">
                    {' '}
                    {copy('u_2e0d5e87f9b8')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {copy('u_948ae4c8da36')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <MultiCurrencyExample />

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {copy('u_724ccd86fa4b')}{' '}
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p> {copy('u_40d83be96fe8')} </p>
                <p>
                  {' '}
                  {copy('u_50e4ab56b906')}{' '}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_2b72811d5f06')}{' '}
                  </Link>{' '}
                  {copy('u_abda751e2109')}{' '}
                  <Link href="/docs/security" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_3019a107f23e')}{' '}
                  </Link>{' '}
                  {copy('u_1d80feda9259')}{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    self-host
                  </Link>{' '}
                  {copy('u_139cd225ccb9')}{' '}
                </p>
              </div>
            </section>

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {copy('u_8b5c396e0f19')}{' '}
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  {' '}
                  {copy('u_a2019babb22b')} {pricing.monthly}
                  {copy('u_f02908f678e5')} {pricing.yearly}
                  {copy('u_14ff85c11579')}{' '}
                </p>
                <p> {copy('u_ab3d27625880')} </p>
              </div>
            </section>

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {copy('u_070fbdb46941')}{' '}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {copy('u_4e520c7518ea')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_0193e1e3b2dc')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_9cd630eeb9d7')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_356e5b5f9f47')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_24f0c36adf59')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_170b8bc8dc98')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_9659a69a0503')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {copy('u_f3a774abf227')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{copy('u_94420b668e51')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {copy('u_2c918e5bc79f')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{copy('u_6b6c705ce282')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{copy('u_fd8324143eb1')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                {' '}
                {copy('u_a3d458e1bd1e')}{' '}
              </h2>
              <div className="space-y-8">
                {faqs(copy).map((faq) => (
                  <div key={faq.q}>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-foreground/70 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <ComparisonReferences
              reviewedOn="2026-09-05"
              sources={[
                {
                  label: copy('u_cb138f67b726'),
                  href: 'https://support.ynab.com/en_us/direct-import-in-europe-Syae1z_A9',
                },
                { label: copy('u_231b0d1311ac'), href: 'https://www.ynab.com/pricing' },
                {
                  label: copy('u_e28ab2eee8fa'),
                  href: 'https://www.ynab.com/security',
                },
                {
                  label: copy('u_3f55b8aae538'),
                  href: 'https://www.ynab.com/features',
                },
              ]}
            />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> {copy('u_824f76f36098')}{' '}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {' '}
                  {copy('u_b2649e4150b5')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8"> {copy('u_13e468351bea')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=final">
                      {' '}
                      {copy('u_d4ddd6ce6fb8')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <Link href="/self-hosted-ynab-alternative">{copy('u_f94469dda6bf')}</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {copy('u_bfd90095d0a8')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_fccf86fb699c')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/ynab-alternative-uk" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_0a3f5da3c59f')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_3094aa1a0fa2')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {copy('u_96b7080f8188')}{' '}
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
