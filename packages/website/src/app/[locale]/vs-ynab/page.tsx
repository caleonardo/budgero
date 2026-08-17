import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Download, Import } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'vs_ynab' });
  return withLocalizedUrls(locale, '/vs-ynab', {
  title: t('meta_title'),
  description: t('meta_description', { monthly: pricing.monthly, yearly: pricing.yearly, yearlyEquivMonthly: pricing.yearlyEquivMonthly }),
  keywords: [
    'free ynab alternative',
    'ynab free alternative',
    'ynab alternative free',
    'budgero vs ynab',
    'ynab vs budgero',
    'free alternative to ynab',
    'ynab free version',
    'apps like ynab but free',
    'switch from ynab',
    'ynab import',
    'ynab replacement',
    'ynab alternative encrypted',
  ],
  alternates: { canonical: 'https://budgero.app/vs-ynab' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
    url: 'https://budgero.app/vs-ynab',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta_title'),
    description: t('tw_description'),
  },
});
}

const makeComparisonData = (t: (key: string, values?: Record<string, string | number>) => string) => [
  { feature: t('comparisonData_monthly_price'), cloud: t('comparisonData_monthly_mo_yearly_yr', {
    monthly: pricing.monthly,
    yearly: pricing.yearly
  }), selfHost: t('comparisonData_free_forever'), ynab: t('comparisonData_14_99_mo_109_yr') },
  { feature: t('comparisonData_free_trial'), cloud: t('comparisonData_35_days_no_credit_card'), selfHost: t('comparisonData_n_a_always_free'), ynab: t('comparisonData_34_days') },
  { feature: t('comparisonData_zero_based_budgeting'), cloud: true, selfHost: true, ynab: true },
  { feature: t('comparisonData_end_to_end_encryption'), cloud: t('comparisonData_aes_256_gcm_zero_knowledge'), selfHost: t('comparisonData_local_encryption'), ynab: false, ynabNote: t('comparisonData_data_stored_in_plaintext') },
  { feature: t('comparisonData_offline_mode'), cloud: true, selfHost: true, ynab: false },
  { feature: t('comparisonData_multi_currency_support'), cloud: t('comparisonData_168_currencies'), selfHost: t('comparisonData_168_currencies'), ynab: false, ynabNote: t('comparisonData_manual_workarounds_only') },
  { feature: t('comparisonData_bank_sync'), cloud: false, selfHost: false, ynab: true, cloudNote: t('comparisonData_manual_entry_by_design'), ynabNote: t('comparisonData_us_canada_eu_via_plaid') },
  { feature: t('comparisonData_ynab_data_import'), cloud: true, selfHost: true, ynab: 'N/A' },
  { feature: t('comparisonData_self_hosting_option'), cloud: false, selfHost: true, ynab: false, cloudNote: t('comparisonData_use_self_host_edition') },
  { feature: t('comparisonData_works_if_you_cancel'), cloud: t('comparisonData_export_anytime'), selfHost: t('comparisonData_your_data_your_server'), ynab: false, ynabNote: t('comparisonData_lose_access_to_budgets') },
  { feature: t('comparisonData_mobile_app'), cloud: 'PWA', selfHost: 'PWA', ynab: t('comparisonData_native_ios_android') },
  { feature: t('comparisonData_shared_budgets'), cloud: true, selfHost: t('comparisonData_via_shared_server'), ynab: true, cloudNote: t('comparisonData_encrypted_shared_workspaces'), ynabNote: t('comparisonData_up_to_5_users') },
  { feature: t('comparisonData_ai_categorization'), cloud: true, selfHost: true, ynab: false, cloudNote: t('comparisonData_local_llm_optional') },
  { feature: t('comparisonData_receipt_scanning'), cloud: true, selfHost: true, ynab: false, cloudNote: t('comparisonData_ai_powered_privacy_first') },
  { feature: t('comparisonData_reports_analytics'), cloud: t('comparisonData_modern_dashboards'), selfHost: t('comparisonData_modern_dashboards'), ynab: t('comparisonData_basic_reports') },
  { feature: t('comparisonData_api_access'), cloud: true, selfHost: true, ynab: false, cloudNote: t('comparisonData_push_api') },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_does_budgero_work_outside_the_us'),
    a: t('faqs_yes_that_s_a_core_reason'),
  },
  {
    q: t('faqs_how_is_budgero_different_from_ynab'),
    a: t('faqs_ynab_treats_each_account_single_currency'),
  },
  {
    q: t('faqs_is_there_a_free_version_of'),
    a: t('faqs_yes_budgero_self_host_is_completely', {
      monthly: pricing.monthly,
      yearly: pricing.yearly
    }),
  },
  {
    q: t('faqs_does_budgero_offer_discounts_like_ynab'),
    a: t('faqs_no_budgero_keeps_pricing_simple_instead', {
      monthly: pricing.monthly,
      yearly: pricing.yearly
    }),
  },
  {
    q: t('faqs_can_i_import_my_ynab_budget'),
    a: t('faqs_yes_budgero_imports_ynab_export_files'),
  },
  {
    q: t('faqs_does_budgero_connect_to_my_bank'),
    a: t('faqs_no_and_that_s_intentional_bank'),
  },
  {
    q: t('faqs_how_does_budgero_keep_my_data'),
    a: t('faqs_budgero_uses_end_to_end_encryption'),
  },
  {
    q: t('faqs_does_budgero_work_offline'),
    a: t('faqs_yes_budgero_is_built_as_a'),
  },
  {
    q: t('faqs_can_i_budget_in_multiple_currencies'),
    a: t('faqs_yes_budgero_supports_168_currencies_with'),
  },
  {
    q: t('faqs_what_happens_if_i_cancel_budgero'),
    a: t('faqs_your_data_is_yours_you_can'),
  },
];

function renderCellValue(val: unknown, note?: string, isHighlight?: boolean) {
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
      <span className={`text-sm ${isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}>
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

export default async function VsYnabPage(
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
  const t = await getTranslations('vs_ynab');
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
        url: 'https://budgero.app/vs-ynab',
        description:
          'The free YNAB alternative — zero-based budgeting in 168 currencies with end-to-end encryption and offline mode. Free self-host edition, Cloud at half YNAB\u2019s price.',
        offers: [
          {
            '@type': 'Offer',
            name: 'Budgero Self-Host',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Budgero Cloud',
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ],
        featureList: [
          'Zero-based budgeting',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Multi-currency (168 currencies)',
          'Offline support',
          'YNAB import',
          'Self-host option',
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
          { '@type': 'ListItem', position: 2, name: 'Budgero vs YNAB', item: 'https://budgero.app/vs-ynab' },
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> {t('35_day_free_trial_no_card')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('budgero_vs_ynab_the_free_ynab')} </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('everything_ynab_does_well_free_if')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('see_how_budgero_compares')}</a>
                  </Button>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why People Switch */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_european_international_ynab_users_are')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('ynab_pioneered_zero_based_budgeting_and')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground"> {t('no_native_multi_currency_support')} </strong>{' '} {t('ynab_has_no_concept_of_currencies')} </p>
                  <p>
                    <strong className="text-foreground">{t('bank_sync_is_us_first')}</strong> {t('ynab_s_bank_sync_works_well')} </p>
                  <p>
                    <strong className="text-foreground">{t('price_keeps_climbing')}</strong> {t('ynab_costs_14_99_month_or')} </p>
                  <p>
                    <strong className="text-foreground">{t('privacy_concerns')}</strong> {t('ynab_stores_your_budget_data_on')} </p>
                  <p>
                    <strong className="text-foreground">{t('no_offline_mode')}</strong> {t('ynab_is_a_web_first_app')} </p>
                  <p>
                    <strong className="text-foreground">{t('vendor_lock_in')}</strong> {t('cancel_your_ynab_subscription_and_you')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_ynab_feature_by_feature')} </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero_cloud')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero_self_host')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        YNAB
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
                          {renderCellValue(row.cloud, row.cloudNote, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.selfHost, undefined, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.ynab, row.ynabNote, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-foreground/60 text-sm max-w-3xl">
                <strong className="text-foreground">{t('key_takeaway')}</strong> {t('budgero_cloud_gives_you_everything_ynab')} </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_168_currencies_import_your')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Migration Walkthrough */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                  <Import className="w-3.5 h-3.5 mr-2" /> {t('seamless_migration')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_to_switch_from_ynab_to')} </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto"> {t('switching_does_not_mean_starting_over')} </p>
              </div>

              <div className="space-y-6 max-w-3xl mx-auto">
                {[
                  {
                    step: '1',
                    title: t('migration_step1_title'),
                    text: t('migration_step1_text'),
                    tip: t('migration_step1_tip'),
                  },
                  {
                    step: '2',
                    title: t('migration_step2_title'),
                    text: t('migration_step2_text'),
                  },
                  {
                    step: '3',
                    title: t('migration_step3_title'),
                    text: t('migration_step3_text'),
                  },
                  {
                    step: '4',
                    title: t('migration_step4_title'),
                    text: t('migration_step4_text'),
                  },
                  {
                    step: '5',
                    title: t('migration_step5_title'),
                    text: t('migration_step5_text'),
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-lg font-bold text-foreground">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">{item.title}</h3>
                      <p className="text-foreground/70">{item.text}</p>
                      {item.tip && (
                        <p className="mt-2 text-sm text-foreground/55 italic">{t('tip')} {item.tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-foreground/60"> {t('the_whole_process_takes_about_5')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Makes Budgero Different */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10"> {t('what_you_get_with_budgero_that')} </h2>

              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('true_zero_knowledge_privacy')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_encrypts_your_financial_data_on')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('works_everywhere_in_every_currency')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('ynab_was_built_for_the_us')}{' '}
                    <Link href="/multi-currency-budgeting" className="underline hover:text-foreground"> {t('168_currencies')} </Link>{' '} {t('with_automatic_conversion_rates_and_a')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('offline_first_architecture')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_s_progressive_web_app_works')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('ai_that_respects_your_privacy')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_integrates_with_local_llms_to')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('you_own_your_data_period')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('cancel_budgero_cloud_and_your_data')}{' '}
                    <Link href="/self-hostable" className="underline hover:text-foreground"> {t('budgero_self_host')} </Link>{' '} {t('on_your_own_server_with_docker')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('is_budgero_the_right_ynab_alternative')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('budgero_is_a_great_fit_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_zero_based_budgeting_without_paying')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('care_about_financial_data_privacy_and')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('live_outside_the_us_canada_eu')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('budget_in_multiple_currencies_regularly')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('prefer_manual_transaction_entry_that_keeps')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_an_app_that_works_offline')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('have_years_of_ynab_data_you')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('budgero_might_not_be_the_right')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_automatic_bank_sync_and_will')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('want_native_ios_android_apps_budgero')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('are_happy_with_ynab_s_pricing')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_investment_tracking_in_the_same')}{' '}
                        <Link
                          href="/monarch-money-alternative"
                          className="underline hover:text-foreground"
                        > {t('monarch_money')} </Link>{' '} {t('for_that')} </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55"> {t('we_would_rather_be_honest_about')} </p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_for_a_ynab_alternative_that')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_free_trial')} </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60"> {t('prefer_to_self_host')}{' '}
                  <Link href="/self-hosted-ynab-alternative" className="underline hover:text-foreground"> {t('run_budgero_on_your_own_server')} </Link>
                </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('based_in_europe_see_the')}{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground"> {t('ynab_alternative_for_europe')} </Link>.
                                  </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('comparing_more_apps_see_the')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('best_ynab_alternatives_in_2026')} </Link>.
                                  </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
