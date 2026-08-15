import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Globe, Shield, Cpu, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Monarch Money Alternative — Private, No Plaid Required | Budgero',
  description:
    'Budgero is the private Monarch Money alternative: zero-knowledge encryption, no Plaid, no bank credentials shared — and 65% cheaper. Works in 168 currencies, anywhere. 35-day free trial, no card.',
  keywords: [
    'monarch money alternative',
    'monarch alternative',
    'monarch money multi currency',
    'monarch money europe alternative',
    'monarch money international',
    'monarch money replacement',
    'privacy budgeting app',
    'international budgeting app',
    'monarch money vs budgero',
    'budgeting app outside us',
  ],
  alternates: { canonical: 'https://budgero.app/monarch-money-alternative' },
  openGraph: {
    title: 'Monarch Money Alternative — Private, No Plaid Required | Budgero',
    description:
      'Zero-knowledge encryption, no Plaid, no bank credentials shared — and 65% cheaper than Monarch. Works in 168 currencies, anywhere in the world.',
    url: 'https://budgero.app/monarch-money-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monarch Money Alternative — Private, No Plaid Required | Budgero',
    description:
      'Zero-knowledge encryption, no Plaid, no bank credentials shared — and 65% cheaper than Monarch. Works in 168 currencies, anywhere.',
  },
};

const comparisonData = [
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    monarch: '$99.99/year',
    budgeroNote: 'Or free with Self-Host',
    monarchNote: null,
  },
  {
    feature: 'Monthly price',
    budgero: `${pricing.monthly}/mo`,
    monarch: '$14.99/mo',
    budgeroNote: null,
    monarchNote: null,
  },
  {
    feature: 'Multi-currency support',
    budgero: true,
    monarch: false,
    budgeroNote: 'Live FX rates, auto conversion',
    monarchNote: 'USD/CAD only, no conversion',
  },
  {
    feature: 'Works worldwide',
    budgero: true,
    monarch: false,
    budgeroNote: null,
    monarchNote: 'US & Canada only',
  },
  {
    feature: 'Works offline',
    budgero: true,
    monarch: false,
    budgeroNote: null,
    monarchNote: 'Cloud-only, needs internet',
  },
  {
    feature: 'Zero-knowledge encryption',
    budgero: true,
    monarch: false,
    budgeroNote: 'We cannot see your data',
    monarchNote: 'Bank-level, but not zero-knowledge',
  },
  {
    feature: 'Local LLM integration',
    budgero: true,
    monarch: false,
    budgeroNote: 'Connect to locally-hosted models',
    monarchNote: 'Uses third-party AI (data processed externally)',
  },
  {
    feature: 'Bank sync',
    budgero: 'Push API*',
    monarch: true,
    budgeroNote: 'DIY with encrypted Python SDK',
    monarchNote: 'US/Canada banks only',
  },
  {
    feature: 'Investment tracking',
    budgero: 'Manual',
    monarch: 'Automatic',
    budgeroNote: null,
    monarchNote: 'Syncs with brokerages',
  },
  {
    feature: 'Zero-based budgeting',
    budgero: true,
    monarch: true,
    budgeroNote: null,
    monarchNote: null,
  },
  {
    feature: 'Shared budgets',
    budgero: true,
    monarch: true,
    budgeroNote: null,
    monarchNote: null,
  },
  {
    feature: 'Free tier available',
    budgero: true,
    monarch: false,
    budgeroNote: 'Budgero Self-Host is free forever',
    monarchNote: '7-day trial only',
  },
];

const faqs = [
  {
    q: 'Does Monarch Money work outside the US?',
    a: 'Not really. Monarch Money is built for the US (with limited Canadian support). You cannot connect non-US/Canadian banks, the iOS app is not in most international App Stores, and balances are displayed as plain "$" with no currency conversion. If you live outside North America, manage money in multiple currencies, or travel often, Monarch is effectively unusable.',
  },
  {
    q: 'What is the cheapest Monarch Money alternative?',
    a: `Budgero. Budgero Cloud is ${pricing.monthly}/month or ${pricing.yearly}/year — about 65% less than Monarch Money's $99.99/year. You get a 35-day free trial with no credit card, native multi-currency support, zero-knowledge encryption, and offline mode. If you do not want to pay anything at all, Budgero Self-Host is free forever on your own Docker server.`,
  },
  {
    q: 'Does Budgero connect to my bank like Monarch Money does?',
    a: 'No, and that is by design. Bank sync requires sharing credentials with a third-party aggregator (Plaid, MX, Tink), which limits the providers you can use, restricts which countries the app works in, and prevents true zero-knowledge encryption. Budgero is manual-first: enter transactions yourself, import CSVs from any bank in the world, or use our Push API for DIY automation. The trade-off is that Budgero works literally everywhere, your credentials stay yours, and your data is end-to-end encrypted.',
  },
  {
    q: 'Can I import my Monarch Money data into Budgero?',
    a: 'Yes. Budgero imports CSV exports from Monarch (and from most other budgeting apps including YNAB, Mint, EveryDollar, and Goodbudget). Categories, transactions, and account balances come across. You get a preview before confirming, so nothing is overwritten unexpectedly. Most users finish migrating in under 15 minutes.',
  },
  {
    q: 'Does Budgero support shared budgets like Monarch Money?',
    a: 'Yes. Budgero Cloud supports encrypted shared workspaces — invite your partner or roommates and budget together, with every transaction still end-to-end encrypted in transit and at rest. Self-Host users can run a shared server for the same effect.',
  },
  {
    q: 'Is Budgero really 65% cheaper than Monarch Money?',
    a: `Yes, and there is no asterisk. Monarch is $99.99/year. Budgero Cloud is ${pricing.yearly}/year, tax included, for the full feature set — multi-currency, zero-knowledge encryption, encrypted sync, shared budgets, AI categorization, and 35-day cardless trial. Budgero Self-Host is free forever and includes the same feature set. There is no "premium" upsell tier.`,
  },
  {
    q: 'What about investment tracking — Monarch syncs with brokerages.',
    a: 'Budgero supports manual investment tracking — you can record any asset, in any currency, at any value. Automatic brokerage sync is something Monarch does well in the US, but it does not work with European, UK, Asian, or most non-US brokerages anyway. If you live outside the US, manual tracking is what you would end up with on Monarch too — just without multi-currency support.',
  },
  {
    q: 'Can I self-host Budgero?',
    a: `Yes. Budgero Self-Host is free, runs on Docker, and includes the full feature set — zero-knowledge encryption, multi-currency, shared budgets, and YNAB import. No license keys, no feature gating, no telemetry. You can run it on a Raspberry Pi, NAS (Synology, Unraid, TrueNAS), homelab server, or any cloud VPS. Monarch has no self-host option.`,
  },
];

const MONARCH_YEARLY_USD = 99.99;

function priceNumber(displayPrice: string): string {
  return displayPrice.replace(/[^0-9.]/g, '');
}

export default async function MonarchMoneyAlternativePage(
  {
    params
  }: {
    params: Promise<{
      locale: string;
    }>;
  }
) {
  const {
    locale
  } = await params;

  setRequestLocale(locale);
  const t = await getTranslations('monarch_money_alternative');
  const budgeroYearly = parseFloat(priceNumber(pricing.yearly));
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
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/monarch-money-alternative',
        description:
          'Monarch Money alternative with multi-currency support, zero-knowledge encryption, offline mode, and local LLM integration. Works worldwide.',
        offers: [
          {
            '@type': 'Offer',
            name: 'Budgero Self-Host',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Budgero Cloud (monthly)',
            price: priceNumber(pricing.monthly),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Budgero Cloud (yearly)',
            price: priceNumber(pricing.yearly),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31',
          },
        ],
        featureList: [
          'Multi-currency with live exchange rates',
          'Zero-knowledge encryption',
          'Offline support',
          'Integrates with locally-hosted LLMs',
          'Works worldwide',
          'Zero-based budgeting',
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://budgero.app/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Monarch Money Alternative',
            item: 'https://budgero.app/monarch-money-alternative',
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
            {/* Hero Section */}
            <section className="pt-24 pb-16 md:pt-32 md:pb-24 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-[#111c34]/30 text-[#111c34] bg-[#111c34]/10"
                >
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('zero_knowledge_privacy_no_plaid')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('monarch_money_alternative')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('private_no_plaid')} {percentCheaper}{t('cheaper')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('budgero_is_the_privacy_first_monarch')} {pricing.yearly}{t('year_or_self_host_free_no')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="/self-hostable"> {t('explore_self_host')} </a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('no_credit_card_required_zero_knowledge')} <br />Or{' '}
                  <a
                    href="/self-hostable"
                    className="underline hover:text-foreground"
                  > {t('self_host_for_free')} </a>{' '} {t('with_full_features')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Key Advantages Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_switch_from_monarch_money')} </h2>
                <p className="text-lg text-foreground/70"> {t('monarch_is_polished_but_it_can')} </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('true_multi_currency')} </h3>
                  <p className="text-foreground/70"> {t('monarch_shows_everything_as_with_no')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {percentCheaper}{t('cheaper')} </h3>
                  <p className="text-foreground/70"> {t('monarch_costs_99_99_year_budgero')} {pricing.yearly}{t('year_save')}{yearlySavings}{t('year_with_every_feature_included_you')}{' '}
                    <a
                      href="/self-hostable"
                      className="underline hover:text-foreground"
                    > {t('self_host')} </a>{' '} {t('for_free_with_full_features_including')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_knowledge_privacy')} </h3>
                  <p className="text-foreground/70"> {t('monarch_has_bank_level_encryption_but')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <Cpu className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('local_llm_integration')} </h3>
                  <p className="text-foreground/70"> {t('monarch_s_ai_uses_third_party')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_monarch_money')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_comparison')} </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('monarch_money')} </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparisonData.map((row, index) => (
                      <tr
                        key={row.feature}
                        className={
                          index % 2 === 0
                            ? 'bg-transparent'
                            : 'bg-muted/25'
                        }
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.budgero === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.budgero ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.budgeroNote && (
                                <span className="text-xs text-foreground/55">{row.budgeroNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-[#2f6246]">
                                {row.budgero}
                              </span>
                              {row.budgeroNote && (
                                <span className="text-xs text-foreground/55">{row.budgeroNote}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.monarch === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.monarch ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.monarchNote && (
                                <span className="text-xs text-foreground/55">{row.monarchNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">
                                {row.monarch}
                              </span>
                              {row.monarchNote && (
                                <span className="text-xs text-foreground/55">{row.monarchNote}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-foreground/60"> {t('push_api_requires_writing_your_own')}{' '}
                <Link
                  href="/docs/push-api"
                  className="underline hover:text-foreground"
                > {t('learn_more')} </Link>
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-alternative&utm_content=mid-table"> {t('try_budgero_free_for_35_days')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_required_multi_currency_works')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('switch_to_budgero_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_live_outside_the_us_canada')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_manage_money_in_multiple_currencies')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_true_privacy_with_zero')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_to_use_your_own')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('you_want_to_save')}{yearlySavings}{t('year_or_go_free_with')}{' '}
                        <a href="/self-hostable" className="underline"> {t('self_host_2')} </a>)
                                              </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_need_offline_access_when_traveling')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_monarch_if')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_need_automatic_us_canadian_bank')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_want_automatic_investment_brokerage_syncing')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_only_use_usd_and_live')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_fully_hands_off_automation')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Monarch Limitations Section */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('what_monarch_money_gets_wrong')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('monarch_money_is_a_solid_app')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('no_multi_currency')}</strong>{' '} {t('monarch_displays_all_transactions_as_regardless')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('us_canada_only')}</strong> {t('you_cannot_download_the_app_outside')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('cloud_only')}</strong> {t('no_offline_mode_you_need_internet')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {t('ai_processes_data_externally')} </strong>{' '} {t('monarch_s_ai_assistant_uses_third')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('expensive')}</strong> {t('at_99_99_year_monarch_costs')}{yearlySavings}{t('year_more_than_budgero_cloud_s')} {pricing.yearly}.
                                          </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10"> {t('frequently_asked_questions')} </h2>
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

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_to_switch_from_monarch_money')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('try_budgero_free_for_35_days_2')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_all_features_for_free')}{' '}
                  <Link
                    href="/self-hosted-ynab-alternative"
                    className="underline hover:text-foreground"
                  > {t('self_host_budgero')} </Link>{' '} {t('with_full_sync_multi_currency_and')} </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('based_in_europe')}{' '}
                  <Link
                    href="/monarch-money-europe-alternative"
                    className="underline hover:text-foreground"
                  > {t('monarch_money_isn_t_available_here')} </Link>{' '} {t('see_the_dedicated_comparison')} </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('wondering_about_currencies')}{' '}
                  <Link
                    href="/monarch-money-multi-currency"
                    className="underline hover:text-foreground"
                  > {t('does_monarch_money_support_multiple_currencies')} </Link>
                </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('still_comparing_apps_see')}{' '}
                  <Link
                    href="/best-ynab-alternatives"
                    className="underline hover:text-foreground"
                  > {t('9_budgeting_apps_compared')} </Link>.
                                  </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
