import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ComparisonReferences } from '@/components/comparison-references';
import { MultiCurrencyExample } from '@/components/multi-currency-example';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Globe, Shield, Euro, DollarSign, Ban } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'monarch_money_europe_alternative' });
  return withLocalizedUrls(locale, '/monarch-money-europe-alternative', {
    title: copy('u_9e81112c43ed'),
    description: copy('u_283009b6a9ab'),
    keywords: [
      copy('u_60aa5c84bd93'),
      copy('u_911b94bb255e'),
      copy('u_2a8de0a7b291'),
      copy('u_acc980ed2bc3'),
      copy('u_45e5303b129a'),
      copy('u_2899812ce01b'),
      copy('u_6a4157797d9a'),
      copy('u_b4e0dd697f94'),
      copy('u_dadb33a1e9b1'),
      copy('u_9ebde0721714'),
      copy('u_c0f0cc93a897'),
      copy('u_541fb819504b'),
      copy('u_bdbf605648a6'),
    ],
    alternates: { canonical: 'https://budgero.app/monarch-money-europe-alternative' },
    openGraph: {
      title: copy('u_9e81112c43ed'),
      description: copy('u_9f7b2eaed3c9'),
      url: 'https://budgero.app/monarch-money-europe-alternative',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makeComparisonData = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: copy('u_b47f1deb4052'),
    budgero: true,
    monarch: false,
    budgeroNote: copy('u_b9bf2471221c'),
    monarchNote: copy('u_61819bee7f2f'),
  },
  {
    feature: copy('u_fa77c81756b5'),
    budgero: copy('u_bcc6cd2da733'),
    monarch: copy('u_7d7c24597641'),
    budgeroNote: copy('u_5a1e89cb2ca2'),
    monarchNote: copy('u_78d2df7c336f'),
  },
  {
    feature: t('comparisonData_annual_price'),
    budgero: copy('u_6730f1c07c70', {
      p0: pricing.yearly,
    }),
    monarch: copy('u_9cbd9440c1c0'),
    budgeroNote: copy('u_dc60b3cc4bcb'),
    monarchNote: copy('u_3350b3583390'),
  },
  {
    feature: copy('u_2c8f88df903c'),
    budgero: true,
    monarch: false,
    budgeroNote: copy('u_509511278986'),
    monarchNote: copy('u_af3e7ad28bfd'),
  },
  {
    feature: copy('u_bbc6050dd169'),
    budgero: copy('u_65d22dd416f6'),
    monarch: copy('u_5d9c74d020fb'),
    budgeroNote: copy('u_8973decf781b'),
    monarchNote: copy('u_576584d8f23b'),
  },
  {
    feature: copy('u_32bbc446b7ae'),
    budgero: copy('u_cd7bffa32673'),
    monarch: copy('u_ae9be77fd567'),
    budgeroNote: copy('u_e6becdc480e4'),
    monarchNote: copy('u_9c09b7c805e2'),
  },
  {
    feature: t('comparisonData_self_host_option'),
    budgero: true,
    monarch: false,
    budgeroNote: copy('u_2609f174c29d'),
    monarchNote: null,
  },
];

const makeFaqs = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    q: copy('u_4ff3086e790b'),
    a: copy('u_6f1f4bfb1654'),
  },
  {
    q: copy('u_a9da24562152'),
    a: copy('u_8809e9dfbcd8'),
  },
  {
    q: copy('u_a5aed435df3c'),
    a: copy('u_eb1f7dca8c40'),
  },
  {
    q: copy('u_5870a6f8b75a'),
    a: copy('u_bcca133cc93d'),
  },
  {
    q: copy('u_32b673bb22ba'),
    a: copy('u_4d5babcdee63'),
  },
  {
    q: copy('u_c61ba4190ace'),
    a: copy('u_22cb2c3f6289'),
  },
  {
    q: copy('u_b4288ba132ac'),
    a: copy('u_0455c7e1228a', {
      p0: pricing.monthly,
      p1: pricing.yearly,
    }),
  },
  {
    q: copy('u_69791cc49192'),
    a: copy('u_880b8b1234ce'),
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

const MONARCH_YEARLY_USD = 99.99;

export default async function MonarchMoneyEuropeAlternativePage({
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
    namespace: 'monarch_money_europe_alternative',
  });
  const faqs = makeFaqs(t, copy);

  const comparisonData = makeComparisonData(t, copy);
  const budgeroYearly = parseFloat(pricing.yearly.replace(/[^0-9.]/g, ''));
  const yearlySavings = Math.max(0, Math.round(MONARCH_YEARLY_USD - budgeroYearly));
  const percentCheaper = Math.max(
    0,
    Math.round(((MONARCH_YEARLY_USD - budgeroYearly) / MONARCH_YEARLY_USD) * 100)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: copy('u_045497ff4fcf'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: [
          copy('u_2975104784a4'),
          copy('u_d598026a9cbc'),
          copy('u_aed6b7aa2a05'),
          copy('u_4828e60247c1'),
        ],
        url: 'https://budgero.app/monarch-money-europe-alternative',
        description: copy('u_cc3f78f83186'),
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
          copy('u_745f6a43aed4'),
          copy('u_2f8237e83493'),
          copy('u_20ded3f919cc'),
          copy('u_0e59e65e0a90'),
          copy('u_9a326d07d39f'),
          copy('u_a87f8b3aa36a'),
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
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
            name: copy('u_d8ef1e8e0232'),
            item: 'https://budgero.app/monarch-money-europe-alternative',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-red-500/30 text-red-700 dark:text-red-400 bg-red-500/10"
                >
                  <Ban className="w-3.5 h-3.5 mr-2" /> {t('monarch_money_isn_t_available_in')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {copy('u_b23890892b69')}{' '}
                  <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium">
                    {' '}
                    {copy('u_eacfbe4aaafc')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {copy('u_d2941b0c5aad')}{' '}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=hero">
                      {' '}
                      {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#why-not-monarch">{t('why_monarch_doesn_t_work_in')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  {' '}
                  {t('35_days_free_no_card_needed')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <section id="why-not-monarch" className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {copy('u_a0ea2adf59c0')}{' '}
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  {' '}
                  {copy('u_3f7083fb5f53')}{' '}
                  <a
                    href="https://help.monarch.com/hc/en-us/articles/19985735202068-FAQs-about-Monarch"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {copy('u_4c258b4a8096')}{' '}
                  </a>{' '}
                  {copy('u_59cdcd3539b1')}{' '}
                </p>
                <p>
                  {' '}
                  {copy('u_05df247861f3')}{' '}
                  <a
                    href="https://help.monarch.com/hc/en-us/articles/360048393552-International-Accounts-and-Currency"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {copy('u_5e62ee3d50c1')}{' '}
                  </a>{' '}
                  {copy('u_b64199c4dd8c')}{' '}
                </p>
                <p> {copy('u_9ebc9bd5ad83')} </p>
              </div>
            </section>

            <MultiCurrencyExample />

            {/* Key Advantages */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('why_european_households_choose_budgero')}{' '}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_8ba44df8c29e')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_e9dc249c2870')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Euro className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_197a9ffd5d44')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_fccf7f307a28')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_5717bc65fdc8')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_caf825d7845b')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {percentCheaper}
                    {copy('u_ca00260b1811')}{' '}
                  </h3>
                  <p className="text-foreground/70">
                    {' '}
                    {copy('u_cc73c24cfef3')} {pricing.yearly}
                    {copy('u_0f11c790dc38')} {yearlySavings}
                    {copy('u_adbd60907a4c')}{' '}
                    <Link href="/self-hostable" className="underline hover:text-foreground">
                      self-host
                    </Link>{' '}
                    {copy('u_c37a05c9d2f9')}{' '}
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('budgero_vs_monarch_money_the_european')}{' '}
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                        {' '}
                        {t('feature')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('budgero')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('monarch_money')}{' '}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparisonData.map((row, index) => (
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
                          {renderCellValue(row.monarch, row.monarchNote, false)}
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=mid-table">
                    {' '}
                    {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {copy('u_948ae4c8da36')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('who_this_is_for')}{' '}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('you_re_a_great_fit_if')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('live_in_the_eu_uk_switzerland')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('tried_monarch_and_discovered_it_doesn')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('earn_or_spend_in_more_than')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{copy('u_eecf9f78c0c1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {copy('u_c7c012955f64')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_the_option_to_self_host')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" />{' '}
                    {t('stick_with_monarch_if_you')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('are_based_in_the_us_or')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_automatic_investment_sync_from_a')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{copy('u_66fdf2cdeb83')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {copy('u_50383983c1e2')} </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55">
                    {' '}
                    {t('monarch_is_a_solid_app_for')}{' '}
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                {' '}
                {t('frequently_asked_questions')}{' '}
              </h2>
              <div className="space-y-8">
                {faqs.map((faq) => (
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
                  label: copy('u_95a927ce853a'),
                  href: 'https://help.monarch.com/hc/en-us/articles/19985735202068-FAQs-about-Monarch',
                },
                {
                  label: copy('u_25f05e7df0b6'),
                  href: 'https://help.monarch.com/hc/en-us/articles/360048393552-International-Accounts-and-Currency',
                },
                {
                  label: copy('u_e43984cc2cc2'),
                  href: 'https://help.monarch.com/hc/en-us/articles/44815447567636-Updating-Your-Subscription',
                },
              ]}
            />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {' '}
                  {copy('u_caaf132ba1c4')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  {' '}
                  {copy('u_6e0eebe7f13d')} {pricing.yearly}
                  {copy('u_9fec81260cc6')}{' '}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=final">
                      {' '}
                      {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <Link href="/self-hosted-ynab-alternative">{t('self_host_for_free')}</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {t('also_see')}{' '}
                  <Link
                    href="/monarch-money-alternative"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {copy('u_dfb3eeec37f4')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_bdb2f3334b22')}{' '}
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
