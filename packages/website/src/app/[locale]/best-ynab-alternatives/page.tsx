import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, BookOpen } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'best_ynab_alternatives' });
  return withLocalizedUrls(locale, '/best-ynab-alternatives', {
  title: t('meta_title'),
  description: t('meta_description'),
  keywords: [
    'best ynab alternatives',
    'ynab alternatives',
    'ynab alternatives 2026',
    'ynab alternative',
    'alternative to ynab',
    'apps like ynab',
    'ynab replacement',
    'ynab competitors',
    'free ynab alternative',
    'ynab alternative europe',
    'ynab multi currency alternative',
    'budgeting app comparison',
  ],
  alternates: { canonical: 'https://budgero.app/best-ynab-alternatives' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
    url: 'https://budgero.app/best-ynab-alternatives',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta_title'),
    description: t('tw_description'),
  },
});
}

const makeSummaryData = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    app: 'Budgero',
    price: `${pricing.yearly}/yr`,
    zeroBased: true,
    multiCurrency: true,
    encryption: 'Zero-knowledge',
    bankSync: false,
  },
  {
    app: t('summaryData_monarch_money'),
    price: '$99.99/yr',
    zeroBased: true,
    multiCurrency: false,
    encryption: 'Standard',
    bankSync: true,
    bankSyncNote: 'US/CA',
  },
  {
    app: t('summaryData_actual_budget'),
    price: t('summaryData_free_self_host'),
    zeroBased: true,
    multiCurrency: false,
    encryption: t('summaryData_e2ee_optional'),
    bankSync: false,
  },
  {
    app: 'PocketSmith',
    price: t('summaryData_from_9_99_mo'),
    zeroBased: false,
    multiCurrency: true,
    encryption: 'Standard',
    bankSync: true,
    bankSyncNote: t('cell_global'),
  },
  {
    app: t('summaryData_simplifi_by_quicken'),
    price: '$35.88/yr',
    zeroBased: false,
    multiCurrency: false,
    encryption: 'Standard',
    bankSync: true,
    bankSyncNote: 'US',
  },
  {
    app: 'Goodbudget',
    price: t('summaryData_free_70_yr'),
    zeroBased: true,
    multiCurrency: false,
    encryption: 'Standard',
    bankSync: false,
  },
  {
    app: 'EveryDollar',
    price: t('summaryData_free_79_99_yr'),
    zeroBased: true,
    multiCurrency: false,
    encryption: 'Standard',
    bankSync: true,
    bankSyncNote: t('summaryData_us_only'),
  },
  {
    app: t('summaryData_lunch_money'),
    price: '$100/yr',
    zeroBased: false,
    multiCurrency: true,
    encryption: 'Standard',
    bankSync: true,
  },
  {
    app: 'PocketGuard',
    price: t('summaryData_free_74_99_yr'),
    zeroBased: false,
    multiCurrency: false,
    encryption: 'Standard',
    bankSync: true,
    bankSyncNote: 'US/CA',
  },
];

const makeAlternatives = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    name: 'Budgero',
    price: t('alternatives_yearly_yr_or_monthly_mo_free', {
      yearly: pricing.yearly,
      monthly: pricing.monthly
    }),
    bestFor: t('alternatives_privacy_conscious_users_expats_multi_currency'),
    pros: [
      t('alternatives_zero_knowledge_encryption_aes_256_gcm'),
      t('alternatives_168_currencies_with_live_fx_rates'),
      t('alternatives_5_seats_included_per_subscription'),
      t('alternatives_self_host_option_with_full_feature'),
      t('alternatives_ynab_csv_and_pdf_import'),
      t('alternatives_works_fully_offline_pwa'),
    ],
    cons: [
      t('alternatives_no_automatic_bank_sync'),
      t('alternatives_smaller_community_compared_to_ynab'),
      t('alternatives_pwa_instead_of_native_mobile_app'),
    ],
    take: t('alternatives_full_disclosure_budgero_is_our_product'),
  },
  {
    name: t('alternatives_monarch_money'),
    price: t('alternatives_99_99_yr_or_14_99'),
    bestFor: t('alternatives_us_based_users_who_want_a'),
    pros: [
      t('alternatives_clean_modern_interface'),
      t('alternatives_investment_and_net_worth_tracking'),
      t('alternatives_automatic_bank_sync_via_plaid'),
      t('alternatives_collaborative_household_budgeting'),
    ],
    cons: [
      t('alternatives_us_and_canada_only'),
      t('alternatives_no_multi_currency_support'),
      t('alternatives_no_zero_knowledge_encryption'),
      t('alternatives_more_expensive_than_most_alternatives'),
    ],
    take: t('alternatives_the_best_ynab_alternative_if_you'),
  },
  {
    name: t('alternatives_actual_budget'),
    price: t('alternatives_free_self_hosted'),
    bestFor: t('alternatives_technical_users_who_want_open_source'),
    pros: [
      t('alternatives_open_source_and_actively_maintained'),
      t('alternatives_local_first_architecture'),
      t('alternatives_completely_free_no_paid_tiers'),
      t('alternatives_growing_community'),
    ],
    cons: [
      t('alternatives_requires_technical_setup_for_self_hosting'),
      t('alternatives_no_multi_currency_support'),
      t('alternatives_smaller_feature_set_than_ynab_or'),
      t('alternatives_no_dedicated_mobile_app'),
    ],
    take: t('alternatives_the_strongest_free_option_if_you'),
  },
  {
    name: 'PocketSmith',
    price: t('alternatives_from_9_99_mo_foundation_to'),
    bestFor: t('alternatives_forecasting_and_calendar_based_planning_global'),
    pros: [
      t('alternatives_cashflow_forecasting_up_to_10_years'),
      t('alternatives_multi_currency_accounts_with_daily_fx'),
      t('alternatives_bank_feeds_in_many_countries_not'),
      t('alternatives_powerful_calendar_view_of_upcoming_money'),
    ],
    cons: [
      t('alternatives_not_zero_based_budgeting_forecast_first'),
      t('alternatives_gets_expensive_on_higher_tiers'),
      t('alternatives_steeper_learning_curve'),
      t('alternatives_multi_country_bank_feeds_require_mid'),
    ],
    take: t('alternatives_the_most_capable_alternative_for_people'),
  },
  {
    name: t('alternatives_simplifi_by_quicken'),
    price: t('alternatives_2_99_mo_billed_annually_35'),
    bestFor: t('alternatives_us_users_who_want_cheap_automated'),
    pros: [
      t('alternatives_roughly_a_third_of_ynab_s'),
      t('alternatives_automatic_bank_sync'),
      t('alternatives_spending_plan_shows_what_s_safe'),
      t('alternatives_polished_mobile_apps'),
    ],
    cons: [
      t('alternatives_us_only'),
      t('alternatives_not_zero_based_automation_first_philosophy'),
      t('alternatives_no_multi_currency'),
      t('alternatives_quicken_account_required_data_lives_on'),
    ],
    take: t('alternatives_the_budget_pick_for_us_users'),
  },
  {
    name: 'Goodbudget',
    price: t('alternatives_free_limited_or_70_yr'),
    bestFor: t('alternatives_couples_who_want_simple_envelope_budgeting'),
    pros: [
      t('alternatives_simple_envelope_system_that_works'),
      t('alternatives_shared_budgets_for_couples'),
      t('alternatives_available_on_web_ios_and_android'),
      t('alternatives_free_tier_for_basic_use'),
    ],
    cons: [
      t('alternatives_no_bank_sync'),
      t('alternatives_limited_reporting_and_analytics'),
      t('alternatives_dated_interface'),
      t('alternatives_no_multi_currency'),
    ],
    take: t('alternatives_keeps_it_simple_the_free_tier'),
  },
  {
    name: 'EveryDollar',
    price: t('alternatives_free_manual_or_79_99_yr'),
    bestFor: t('alternatives_dave_ramsey_followers'),
    pros: [
      t('alternatives_simple_zero_based_interface'),
      t('alternatives_genuinely_usable_free_tier_manual_entry'),
      t('alternatives_bank_sync_in_premium_tier'),
      t('alternatives_debt_payoff_tools_baby_steps'),
    ],
    cons: [
      t('alternatives_us_only'),
      t('alternatives_tied_to_the_ramsey_ecosystem'),
      t('alternatives_limited_customization'),
      t('alternatives_no_multi_currency'),
    ],
    take: t('alternatives_designed_around_the_ramsey_method_and'),
  },
  {
    name: t('alternatives_lunch_money'),
    price: t('alternatives_100_yr_or_10_mo'),
    bestFor: t('alternatives_tech_savvy_users_who_want_api'),
    pros: [
      t('alternatives_multi_currency_support'),
      t('alternatives_developer_friendly_api'),
      t('alternatives_clean_minimal_interface'),
      t('alternatives_bank_sync_via_plaid'),
    ],
    cons: [
      t('alternatives_not_zero_based_budgeting_tracking_focused'),
      t('alternatives_more_expensive_than_most_options'),
      t('alternatives_no_self_host_option'),
      t('alternatives_smaller_team_and_community'),
    ],
    take: t('alternatives_closest_to_budgero_on_multi_currency'),
  },
  {
    name: 'PocketGuard',
    price: t('alternatives_free_74_99_yr_or_149'),
    bestFor: t('alternatives_guardrails_and_overspending_alerts_irregular_in'),
    pros: [
      t('alternatives_in_my_pocket_shows_safe_to'),
      t('alternatives_bank_sync_with_unlimited_accounts_on'),
      t('alternatives_lifetime_purchase_option_pay_once'),
      t('alternatives_debt_payoff_planning_tools'),
    ],
    cons: [
      t('alternatives_not_zero_based_budgeting'),
      t('alternatives_us_canada_focused'),
      t('alternatives_no_multi_currency'),
      t('alternatives_free_tier_is_quite_limited'),
    ],
    take: t('alternatives_the_pick_for_people_who_don'),
  },
];

const makePickGuide = (t: (key: string, values?: Record<string, string | number>) => string) => [
  { priority: t('cell_privacy'), pick: 'Budgero', reason: t('pickGuide_zero_knowledge_encryption_self_host_option') },
  { priority: t('pickGuide_bank_sync_us'), pick: t('pickGuide_monarch_money'), reason: t('pickGuide_best_modern_us_bank_integration') },
  { priority: t('pickGuide_bank_sync_global'), pick: 'PocketSmith', reason: t('pickGuide_feeds_in_many_countries_multi_currency') },
  { priority: t('pickGuide_open_source'), pick: t('pickGuide_actual_budget'), reason: t('pickGuide_fully_open_local_first') },
  { priority: 'Multi-currency', pick: 'Budgero', reason: t('pickGuide_168_currencies_live_fx_rates') },
  { priority: t('pickGuide_lowest_paid_price'), pick: 'Budgero', reason: t('pickGuide_35_yr_tax_included_a_third') },
  { priority: t('cell_free'), pick: t('pickGuide_actual_everydollar_or_budgero_self_host'), reason: t('pickGuide_all_genuinely_free_different_trade_offs') },
  { priority: t('cell_simplicity'), pick: 'Goodbudget', reason: t('pickGuide_no_frills_envelope_budgeting') },
  { priority: t('cell_forecasting'), pick: 'PocketSmith', reason: t('pickGuide_calendar_based_projections_years_ahead') },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_what_is_the_best_ynab_alternative'),
    a: t('faqs_it_depends_on_what_made_you'),
  },
  {
    q: t('faqs_is_there_a_free_ynab_alternative'),
    a: t('faqs_yes_several_actual_budget_is_free'),
  },
  {
    q: t('faqs_what_is_the_best_ynab_alternative_2'),
    a: t('faqs_most_us_budgeting_apps_monarch_simplifi'),
  },
  {
    q: t('faqs_what_is_the_best_self_hosted'),
    a: t('faqs_two_serious_options_actual_budget_free'),
  },
  {
    q: t('faqs_which_ynab_alternatives_support_multiple_currenc'),
    a: t('faqs_only_three_apps_in_this_comparison'),
  },
  {
    q: t('faqs_why_are_people_leaving_ynab'),
    a: t('faqs_three_reasons_come_up_constantly_price'),
  },
];

export default async function BestYnabAlternativesPage(
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
  const t = await getTranslations('best_ynab_alternatives');
  const faqs = makeFaqs(t);
  const pickGuide = makePickGuide(t);
  const alternatives = makeAlternatives(t);
  const summaryData = makeSummaryData(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Best YNAB Alternatives in 2026 — 9 Apps Compared',
        author: { '@type': 'Organization', name: 'Budgero' },
        datePublished: '2026-04-11',
        dateModified: '2026-06-11',
        description:
          'Comparing 9 YNAB alternatives on price, privacy, multi-currency, and features.',
      },
      {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: alternatives.length,
        itemListElement: alternatives.map((app, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: app.name,
          item: {
            '@type': 'SoftwareApplication',
            name: app.name,
            applicationCategory: 'FinanceApplication',
            description: `Best for: ${app.bestFor}`,
          },
        })),
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
            name: 'Best YNAB Alternatives',
            item: 'https://budgero.app/best-ynab-alternatives',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-border/50"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-2" /> {t('2026_comparison_guide_updated_june_2026')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('best_ynab_alternatives_in_2026')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('9_budgeting_apps_compared_honestly')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('ynab_is_a_great_zero_based')} </p>

                <p className="text-sm text-foreground/55 max-w-2xl mx-auto"> {t('disclosure_budgero_is_our_app_it')} <em>{t('not')}</em> {t('the_right_pick_and_which_app')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How we compared */}
            <section className="py-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('how_we_compared_them')} </h2>
              <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
                <p> {t('people_leave_ynab_for_three_reasons')} <strong className="text-foreground">{t('price')}</strong>{' '} {t('109_yr_and_climbing')} <strong className="text-foreground">{t('geography')}</strong>{' '} {t('bank_sync_barely_works_outside_north')} <strong className="text-foreground">{t('privacy')}</strong> {t('your_budget_lives_on_their_servers')} </p>
                <p> {t('five_of_the_nine_apps_below')}{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground"> {t('ynab_alternative_for_europe')} </Link>{' '} {t('guide_for_that_case')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Quick Summary Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('quick_comparison')} </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('app')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('price_2')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('zero_based')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('multi_currency')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('encryption')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('bank_sync')} </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summaryData.map((row, index) => (
                      <tr
                        key={row.app}
                        className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/25'}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          {row.app}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-foreground/70">
                          {row.price}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {row.zeroBased ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-foreground/35 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {row.multiCurrency ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-foreground/35 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-foreground/70">
                          {row.encryption}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {row.bankSync ? (
                            <div className="flex flex-col items-center gap-1">
                              <Check className="w-5 h-5 text-green-600" />
                              {row.bankSyncNote && (
                                <span className="text-xs text-foreground/55">
                                  {row.bankSyncNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <X className="w-5 h-5 text-foreground/35 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Individual Apps */}
            {alternatives.map((app, idx) => (
              <div key={app.name}>
                <section className="py-12 max-w-4xl mx-auto">
                  <div className="bg-card rounded-2xl p-8 border border-border/70">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">
                          {idx + 1}. {app.name}
                        </h3>
                        <p className="text-foreground/60 mt-1">{t('best_for')} {app.bestFor}</p>
                      </div>
                      <span className="text-lg font-semibold text-foreground/80 md:whitespace-nowrap md:text-right">
                        {app.price}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider"> {t('pros')} </h4>
                        <ul className="space-y-2">
                          {app.pros.map((pro) => (
                            <li key={pro} className="flex items-start gap-2 text-foreground/75">
                              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider"> {t('cons')} </h4>
                        <ul className="space-y-2">
                          {app.cons.map((con) => (
                            <li key={con} className="flex items-start gap-2 text-foreground/75">
                              <X className="w-4 h-4 text-foreground/35 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/60 italic">{app.take}</p>
                  </div>
                </section>

                {idx < alternatives.length - 1 && (
                  <div className="my-4 border-t border-border/40 max-w-4xl mx-auto" aria-hidden />
                )}
              </div>
            ))}

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How to Choose */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_to_choose')} </h2>
                <p className="text-lg text-foreground/70">{t('pick_based_on_your_top_priority')}</p>
              </div>

              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <div className="space-y-4">
                  {pickGuide.map((item) => (
                    <div
                      key={item.priority}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                    >
                      <span className="font-semibold text-foreground min-w-[140px]">
                        {item.priority}
                      </span>
                      <span className="text-foreground/70">
                        <strong className="text-foreground">{item.pick}</strong> &mdash;{' '}
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Related guides */}
            <section className="py-12 max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('dig_deeper_by_situation')} </h2>
              <ul className="space-y-3 text-lg text-foreground/75">
                <li> {t('in_europe')}{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground"> {t('ynab_alternative_for_europe')} </Link>
                </li>
                <li> {t('in_the_uk')}{' '}
                  <Link href="/ynab-alternative-uk" className="underline hover:text-foreground"> {t('ynab_alternative_for_the_uk')} </Link>
                </li>
                <li> {t('in_australia')}{' '}
                  <Link
                    href="/ynab-alternative-australia"
                    className="underline hover:text-foreground"
                  > {t('ynab_alternative_for_australia')} </Link>
                </li>
                <li> {t('coming_from_firefly_iii')}{' '}
                  <Link
                    href="/firefly-iii-alternative"
                    className="underline hover:text-foreground"
                  > {t('firefly_iii_alternative')} </Link>
                </li>
                <li> {t('want_it_free_on_your_own')}{' '}
                  <Link
                    href="/self-hosted-ynab-alternative"
                    className="underline hover:text-foreground"
                  > {t('self_hosted_ynab_alternative')} </Link>
                </li>
                <li> {t('deciding_between_ynab_and_budgero_specifically')}{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground"> {t('budgero_vs_ynab_feature_by_feature')} </Link>
                </li>
                <li> {t('leaving_monarch_instead')}{' '}
                  <Link
                    href="/monarch-money-alternative"
                    className="underline hover:text-foreground"
                  > {t('monarch_money_alternative')} </Link>
                </li>
              </ul>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('try_budgero_free_for_35_days')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('zero_knowledge_encryption_168_currencies_5')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=best-ynab-alternatives&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_all_features_for_free')}{' '}
                  <a href="/self-hostable" className="underline hover:text-foreground"> {t('self_host_budgero')} </a>{' '} {t('on_your_own_infrastructure')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
