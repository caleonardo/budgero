import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { ArrowRight, Check, X, Globe, Shield, Target, WifiOff } from 'lucide-react';
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
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quicken_simplifi_alternative' });
  return withLocalizedUrls(locale, '/quicken-simplifi-alternative', {
  title: t('meta_title'),
  description: t('meta_description'),
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
    title: t('meta_title'),
    description: t('meta_description'),
    url: 'https://budgero.app/quicken-simplifi-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta_title'),
    description: t('meta_description'),
  },
});
}

const makeComparisonData = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    feature: t('comparisonData_annual_price'),
    budgero: `${pricing.yearly}/year`,
    simplifi: '$35.88/year',
    budgeroNote: t('comparisonData_or_free_with_self_host'),
    simplifiNote: t('comparisonData_2_99_mo_billed_annually'),
  },
  {
    feature: t('comparisonData_works_outside_the_us'),
    budgero: true,
    simplifi: false,
    budgeroNote: t('comparisonData_any_country_168_currencies'),
    simplifiNote: t('comparisonData_us_banks_and_usd_only'),
  },
  {
    feature: t('comparisonData_budgeting_method'),
    budgero: t('cell_zero_based'),
    simplifi: t('comparisonData_spending_plan'),
    budgeroNote: t('comparisonData_every_dollar_gets_a_job'),
    simplifiNote: t('comparisonData_tracks_spending_after_the_fact'),
  },
  {
    feature: t('comparisonData_zero_knowledge_encryption'),
    budgero: true,
    simplifi: false,
    budgeroNote: t('comparisonData_we_cannot_see_your_data'),
    simplifiNote: t('comparisonData_data_stored_on_quicken_servers'),
  },
  {
    feature: t('comparisonData_bank_sync_required'),
    budgero: false,
    simplifi: true,
    budgeroNote: t('comparisonData_manual_first_by_design'),
    simplifiNote: t('comparisonData_core_functionality_depends_on_it'),
  },
  {
    feature: t('comparisonData_multi_currency_support'),
    budgero: true,
    simplifi: false,
    budgeroNote: t('comparisonData_168_currencies_with_live_fx_rates'),
    simplifiNote: t('comparisonData_usd_only'),
  },
  {
    feature: t('comparisonData_works_offline'),
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: t('comparisonData_cloud_only_needs_internet'),
  },
  {
    feature: t('comparisonData_investment_tracking'),
    budgero: t('cell_manual'),
    simplifi: t('cell_automatic'),
    budgeroNote: null,
    simplifiNote: t('comparisonData_syncs_with_brokerages'),
  },
  {
    feature: t('comparisonData_shared_budgets'),
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: null,
  },
  {
    feature: t('comparisonData_self_host_option'),
    budgero: true,
    simplifi: false,
    budgeroNote: t('comparisonData_free_forever_with_full_features'),
    simplifiNote: null,
  },
  {
    feature: t('comparisonData_works_worldwide'),
    budgero: true,
    simplifi: false,
    budgeroNote: null,
    simplifiNote: t('comparisonData_us_focused'),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_what_is_the_difference_between_simplifi'),
    a: t('faqs_philosophy_simplifi_is_automation_first_it'),
  },
  {
    q: t('faqs_is_simplifi_cheaper_than_budgero'),
    a: t('faqs_no_budgero_cloud_at_yearly_year', {
      yearly: pricing.yearly
    }),
  },
  {
    q: t('faqs_does_simplifi_work_outside_the_us'),
    a: t('faqs_not_really_simplifi_connects_to_us'),
  },
  {
    q: t('faqs_can_i_switch_from_simplifi_to'),
    a: t('faqs_yes_export_your_transactions_from_simplifi'),
  },
  {
    q: t('faqs_does_budgero_require_sharing_my_bank'),
    a: t('faqs_no_and_it_never_asks_simplifi'),
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
  const faqs = makeFaqs(t);
  const comparisonData = makeComparisonData(t);
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
