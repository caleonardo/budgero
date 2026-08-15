import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, Check, X, Globe, Shield, Target, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Quicken Simplifi Alternative - Private Budgeting App | Budgero',
  description:
    'Looking for a Quicken Simplifi alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, 168 currencies, and no bank connection required.',
  keywords: [
    'quicken simplifi alternative',
    'simplifi alternative',
    'quicken alternative',
    'simplifi replacement',
    'budgeting app private',
    'simplifi vs budgero',
  ],
  alternates: { canonical: 'https://budgero.app/quicken-simplifi-alternative' },
  openGraph: {
    title: 'Quicken Simplifi Alternative - Private Budgeting App | Budgero',
    description:
      'Looking for a Quicken Simplifi alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, 168 currencies, and no bank connection required.',
    url: 'https://budgero.app/quicken-simplifi-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quicken Simplifi Alternative - Private Budgeting App | Budgero',
    description:
      'Looking for a Quicken Simplifi alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, 168 currencies, and no bank connection required.',
  },
};

const comparisonData = [
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    simplifi: '$35.88/year',
    budgeroNote: 'Or free with Self-Host',
    simplifiNote: '$2.99/mo billed annually',
  },
  {
    feature: 'Works outside the US',
    budgero: true,
    simplifi: false,
    budgeroNote: 'Any country, 168 currencies',
    simplifiNote: 'US banks and USD only',
  },
  {
    feature: 'Budgeting method',
    budgero: 'Zero-based',
    simplifi: 'Spending plan',
    budgeroNote: 'Every dollar gets a job',
    simplifiNote: 'Tracks spending after the fact',
  },
  {
    feature: 'Zero-knowledge encryption',
    budgero: true,
    simplifi: false,
    budgeroNote: 'We cannot see your data',
    simplifiNote: 'Data stored on Quicken servers',
  },
  {
    feature: 'Bank sync required',
    budgero: false,
    simplifi: true,
    budgeroNote: 'Manual-first by design',
    simplifiNote: 'Core functionality depends on it',
  },
  {
    feature: 'Multi-currency support',
    budgero: true,
    simplifi: false,
    budgeroNote: '168 currencies with live FX rates',
    simplifiNote: 'USD only',
  },
  {
    feature: 'Works offline',
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: 'Cloud-only, needs internet',
  },
  {
    feature: 'Investment tracking',
    budgero: 'Manual',
    simplifi: 'Automatic',
    budgeroNote: null,
    simplifiNote: 'Syncs with brokerages',
  },
  {
    feature: 'Shared budgets',
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: null,
  },
  {
    feature: 'Self-host option',
    budgero: true,
    simplifi: false,
    budgeroNote: 'Free forever with full features',
    simplifiNote: null,
  },
  {
    feature: 'Works worldwide',
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: 'US focused',
  },
];

const faqs = [
  {
    q: 'What is the difference between Simplifi and Budgero?',
    a: "Philosophy. Simplifi is automation-first: it syncs your banks, categorizes transactions, and its Spending Plan tells you what's left to spend after bills and savings. Budgero is intention-first: zero-based budgeting where you assign every dollar a job before spending it, with no bank connection required and zero-knowledge encryption so nobody — including us — can read your data.",
  },
  {
    q: 'Is Simplifi cheaper than Budgero?',
    a: `No — Budgero Cloud at ${pricing.yearly}/year (tax included) now edges out Simplifi's $35.88/year ($2.99/mo billed annually). And Budgero Self-Host is free forever with the full feature set, which makes it the cheaper option by far if you're willing to run a Docker container.`,
  },
  {
    q: 'Does Simplifi work outside the US?',
    a: 'Not really. Simplifi connects to US financial institutions and operates in USD. If you live outside the US, bank with non-US institutions, or need multiple currencies, Simplifi is not built for you — that is exactly the case Budgero covers, with 168 currencies and no dependency on bank connections.',
  },
  {
    q: 'Can I switch from Simplifi to Budgero?',
    a: 'Yes. Export your transactions from Simplifi as CSV, then import them into Budgero — the import preview maps dates, payees, amounts, and categories before anything is written. Expect to spend an evening tidying categories and setting up your first zero-based budget.',
  },
  {
    q: 'Does Budgero require sharing my bank credentials?',
    a: 'No — and it never asks. Simplifi pulls transactions through bank connections, which means credentials and transaction data flow through aggregator infrastructure. Budgero is manual-first: you enter transactions or import CSVs, and your banking credentials never leave your control.',
  },
];

export default async function QuickenSimplifiAlternativePage(
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
  const t = await getTranslations('quicken_simplifi_alternative');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/quicken-simplifi-alternative',
        description:
          'Quicken Simplifi alternative with zero-based budgeting, zero-knowledge encryption, 168 currencies, and no bank connection required.',
        offers: {
          '@type': 'Offer',
          price: pricing.yearly.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'Zero-based budgeting',
          'Zero-knowledge encryption',
          '168 currencies with live exchange rates',
          'No bank connection required',
          'Offline support',
          'Shared budgets',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://budgero.app/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Quicken Simplifi Alternative',
            item: 'https://budgero.app/quicken-simplifi-alternative',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-amber-600/30 text-amber-700 bg-amber-50"
                >
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('privacy_first_budgeting')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('quicken_simplifi_alternative')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('budget_without_sharing_your_bank_credentials')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('simplifi_is_a_modern_take_on')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=quicken-simplifi-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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

            {/* Key Differences Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('key_differences_from_simplifi')} </h2>
                <p className="text-lg text-foreground/70"> {t('different_philosophy_different_approach_to_your')} </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_knowledge_encryption')} </h3>
                  <p className="text-foreground/70"> {t('simplifi_stores_your_financial_data_on')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_based_budgeting')} </h3>
                  <p className="text-foreground/70"> {t('simplifi_tracks_your_spending_after_the')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('168_currencies')} </h3>
                  <p className="text-foreground/70"> {t('simplifi_is_us_focused_and_works')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <WifiOff className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('no_bank_connection_required')} </h3>
                  <p className="text-foreground/70"> {t('simplifi_needs_plaid_to_connect_to')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_quicken_simplifi')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_comparison')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('quicken_simplifi')} </th>
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
                          {typeof row.simplifi === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.simplifi ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.simplifiNote && (
                                <span className="text-xs text-foreground/55">{row.simplifiNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">
                                {row.simplifi}
                              </span>
                              {row.simplifiNote && (
                                <span className="text-xs text-foreground/55">{row.simplifiNote}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Spending Plan vs zero-based */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('spending_plan_vs_zero_based_why')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('simplifi_s_flagship_feature_is_the')} </p>
                <p> {t('the_catch_is_that_removing_the')} <em>{t('for')}</em>{t('zero_based_budgeting_the_method_budgero')} </p>
                <p> {t('neither_approach_is_wrong_if_you')}{' '}
                  <a href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('9_app_comparison')} </a>.
                                  </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Where Simplifi Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('where_simplifi_wins')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('simplifi_is_a_solid_product_here')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('investment_tracking_and_net_worth')}</strong>{' '} {t('simplifi_automatically_syncs_with_brokerages_and')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('bill_tracking_and_reminders')}</strong>{' '} {t('simplifi_detects_recurring_bills_from_your')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('comparable_price_point')}</strong>{' '} {t('at_35_88_year_2_99')} {pricing.yearly}{t('year_though_you_can')}{' '}
                      <a href="/self-hostable" className="underline hover:text-foreground"> {t('self_host_budgero_for_free')} </a>.
                                          </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('automatic_transaction_categorization')}</strong>{' '} {t('with_bank_sync_enabled_simplifi_automatically')} </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Switch or Stick */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('switch_to_budgero_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_zero_knowledge_encryption_for')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_zero_based_budgeting_over')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_do_not_want_to_share')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_manage_money_in_multiple_currencies')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_need_offline_access_or_want')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('you_want_to')}{' '}
                        <a href="/self-hostable" className="underline"> {t('self_host')} </a>{' '} {t('your_budgeting_app_for_free')} </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_simplifi_if')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_rely_on_automatic_bank_sync')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_need_automatic_investment_and_net')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_want_bill_detection_and_payment')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('automatic_us_bank_sync_matters_more')}</span>
                    </li>
                  </ul>
                </div>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_to_switch_from_quicken_simplifi')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('try_budgero_free_for_35_days')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=quicken-simplifi-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_all_features_for_free')}{' '}
                  <a
                    href="/self-hostable"
                    className="underline hover:text-foreground"
                  > {t('self_host_budgero')} </a>{' '} {t('with_full_sync_multi_currency_and')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
