import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Download, Globe, Shield, Euro } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'ynab_alternative_europe' });
  return withLocalizedUrls(locale, '/ynab-alternative-europe', {
  title: t('meta_title'),
  description: t('meta_description', { monthly: pricing.monthly, yearly: pricing.yearly, yearlyEquivMonthly: pricing.yearlyEquivMonthly }),
  keywords: [
    'ynab alternative europe',
    'ynab alternative eu',
    'ynab europe',
    'ynab uk alternative',
    'ynab germany',
    'ynab netherlands',
    'ynab spain',
    'ynab multi currency europe',
    'european budgeting app',
    'eu budgeting app',
    'gdpr budgeting app',
    'budgeting app europe',
    'ynab alternative gdpr',
    'best budgeting app europe',
  ],
  alternates: { canonical: 'https://budgero.app/ynab-alternative-europe' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
    url: 'https://budgero.app/ynab-alternative-europe',
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
  {
    feature: t('comparisonData_works_across_europe'),
    budgero: true,
    ynab: t('cell_partial'),
    budgeroNote: t('comparisonData_every_country_every_currency'),
    ynabNote: t('comparisonData_uk_eu_bank_sync_via_plaid'),
  },
  {
    feature: t('comparisonData_multi_currency_in_one_budget'),
    budgero: t('comparisonData_168_currencies'),
    ynab: false,
    budgeroNote: t('comparisonData_eur_gbp_chf_pln_sek_nok'),
    ynabNote: t('comparisonData_one_currency_per_budget_no_conversion'),
  },
  {
    feature: t('comparisonData_annual_price'),
    budgero: `${pricing.yearly}/year`,
    ynab: t('comparisonData_109_year_100'),
    budgeroNote: t('comparisonData_or_free_with_self_host'),
    ynabNote: null,
  },
  {
    feature: t('comparisonData_where_your_data_lives'),
    budgero: t('comparisonData_finland'),
    ynab: t('comparisonData_united_states'),
    budgeroNote: t('comparisonData_eu_jurisdiction_zero_knowledge_encrypted'),
    ynabNote: t('comparisonData_us_servers_subject_to_us_data'),
  },
  {
    feature: t('comparisonData_telemetry_tracking'),
    budgero: t('comparisonData_opt_in_only'),
    ynab: true,
    budgeroNote: t('comparisonData_no_telemetry_unless_you_explicitly_allow'),
    ynabNote: t('comparisonData_third_party_analytics_by_default'),
  },
  {
    feature: t('comparisonData_end_to_end_encryption'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_aes_256_gcm_zero_knowledge'),
    ynabNote: t('comparisonData_plaintext_on_their_servers'),
  },
  {
    feature: t('comparisonData_offline_mode'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_pwa_works_fully_offline'),
    ynabNote: t('comparisonData_requires_internet'),
  },
  {
    feature: t('comparisonData_billing_in_your_currency'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_vat_compliant_eu_invoicing'),
    ynabNote: t('comparisonData_usd_only_charges'),
  },
  {
    feature: t('comparisonData_zero_based_budgeting'),
    budgero: true,
    ynab: true,
    budgeroNote: null,
    ynabNote: null,
  },
  {
    feature: t('comparisonData_ynab_data_import'),
    budgero: true,
    ynab: 'N/A',
    budgeroNote: t('comparisonData_full_categories_transactions_history'),
    ynabNote: null,
  },
  {
    feature: t('comparisonData_self_host_option'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_docker_your_eu_server'),
    ynabNote: null,
  },
];

const makeEuBankingExamples = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    country: t('cell_germany'),
    flag: '🇩🇪',
    banks: t('euBankingExamples_n26_dkb_deutsche_bank_ing_commerzbank'),
    pain: t('euBankingExamples_ynab_s_plaid_sync_covers_only'),
  },
  {
    country: t('euBankingExamples_united_kingdom'),
    flag: '🇬🇧',
    banks: t('euBankingExamples_monzo_revolut_starling_hsbc_lloyds'),
    pain: t('euBankingExamples_ynab_returned_in_2024_25_via'),
  },
  {
    country: t('cell_netherlands'),
    flag: '🇳🇱',
    banks: t('euBankingExamples_ing_abn_amro_rabobank_bunq'),
    pain: t('euBankingExamples_plaid_coverage_is_spotty_and_ideal'),
  },
  {
    country: t('cell_switzerland'),
    flag: '🇨🇭',
    banks: t('euBankingExamples_ubs_raiffeisen_postfinance_revolut_ch'),
    pain: t('euBankingExamples_chf_is_not_a_first_class'),
  },
  {
    country: t('cell_nordics'),
    flag: '🇸🇪',
    banks: t('euBankingExamples_swedbank_nordea_seb_dnb'),
    pain: t('euBankingExamples_sek_and_nok_are_not_supported'),
  },
  {
    country: t('euBankingExamples_central_europe'),
    flag: '🇵🇱',
    banks: t('euBankingExamples_mbank_pko_bp_revolut_ing_pl'),
    pain: t('euBankingExamples_pln_czk_huf_are_second_class'),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_does_budgero_work_across_europe'),
    a: t('faqs_yes_budgero_works_in_every_eu'),
  },
  {
    q: t('faqs_is_budgero_gdpr_compliant'),
    a: t('faqs_yes_structurally_not_just_on_paper'),
  },
  {
    q: t('faqs_what_happened_to_ynab_in_the'),
    a: t('faqs_ynab_officially_withdrew_from_the_uk'),
  },
  {
    q: t('faqs_can_i_budget_in_eur_gbp'),
    a: t('faqs_yes_budgero_supports_168_currencies'),
  },
  {
    q: t('faqs_how_much_does_budgero_cost_in'),
    a: t('faqs_budgero_cloud_is_monthly_month_or', {
      monthly: pricing.monthly,
      yearly: pricing.yearly
    }),
  },
  {
    q: t('faqs_can_i_get_a_vat_invoice'),
    a: t('faqs_yes_every_payment_generates_a_vat'),
  },
  {
    q: t('faqs_can_i_import_my_ynab_budget'),
    a: t('faqs_yes_budgero_imports_ynab_export_files'),
  },
  {
    q: t('faqs_does_budgero_connect_to_european_banks'),
    a: t('faqs_no_and_that_is_deliberate_automatic'),
  },
  {
    q: t('faqs_where_is_my_data_stored'),
    a: t('faqs_in_finland_budgero_cloud_runs_on'),
  },
  {
    q: t('faqs_does_budgero_work_offline'),
    a: t('faqs_yes_budgero_is_a_progressive_web'),
  },
  {
    q: t('faqs_does_budgero_collect_telemetry_or_usage'),
    a: t('faqs_not_unless_you_explicitly_allow_it'),
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
        className={`text-sm ${
          isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'
        }`}
      >
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

export default async function YnabAlternativeEuropePage(
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
  const t = await getTranslations('ynab_alternative_europe');
  const faqs = makeFaqs(t);
  const euBankingExamples = makeEuBankingExamples(t);
  const comparisonData = makeComparisonData(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/ynab-alternative-europe',
        description:
          'YNAB alternative for Europe — zero-based budgeting in EUR, GBP, CHF, PLN and 168 currencies, with end-to-end encryption, data hosted in Finland, and VAT-compliant billing.',
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
            name: 'Budgero Cloud (monthly)',
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Budgero Cloud (yearly)',
            price: pricing.yearly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ],
        featureList: [
          'Zero-based budgeting',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Multi-currency (168 currencies) with live FX rates',
          'Data hosted in Finland (EU)',
          'No telemetry unless explicitly enabled',
          'VAT-compliant invoicing',
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
          {
            '@type': 'ListItem',
            position: 2,
            name: 'YNAB Alternative for Europe',
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
                  <span>{t('built_for_europe_168_currencies')}</span>
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_ynab_alternative_for_europe')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('multi_currency_data_hosted_in_finland')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('ynab_bills_in_usd_still_doesn')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('see_the_europe_comparison')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('no_card_vat_compliant_invoicing_168')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why European YNAB users are leaving */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_european_ynab_users_are_leaving')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('ynab_is_a_great_american_app')} <em>{t('american')}</em>{t('the_envelope_budgeting_philosophy_travels_well')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">{t('ynab_s_uk_return_is_via')}</strong>{' '} {t('ynab_withdrew_from_the_uk_in')} </p>
                  <p>
                    <strong className="text-foreground">{t('eu_bank_sync_is_uneven')}</strong> {t('ynab_s_direct_import_covers_select')} </p>
                  <p>
                    <strong className="text-foreground"> {t('multi_currency_is_effectively_not_supported')} </strong>{' '} {t('ynab_treats_each_account_as_a')} </p>
                  <p>
                    <strong className="text-foreground"> {t('no_vat_compliant_invoicing_for_freelancers')} </strong>{' '} {t('ynab_does_not_issue_proper_vat')} </p>
                  <p>
                    <strong className="text-foreground">{t('data_lives_under_us_law')}</strong> {t('ynab_stores_your_budget_on_us')} </p>
                  <p>
                    <strong className="text-foreground">{t('billed_in_usd')}</strong> {t('ynab_is_14_99_month_or')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_ynab_the_european_view')} </h2>
                <p className="text-lg text-foreground/70"> {t('where_it_actually_matters_for_households')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_168_currencies_vat_compliant')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* EU Banking Landscape */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_understands_the_european_banking_landsca')} </h2>
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto"> {t('plaid_does_not_budgero_skips_the')} </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {euBankingExamples.map((c) => (
                  <div
                    key={c.country}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{c.flag}</span>
                      <h3 className="font-semibold text-foreground text-lg">{c.country}</h3>
                    </div>
                    <p className="text-sm text-foreground/65 mb-3">
                      <strong className="text-foreground/85">{t('common_banks')}</strong> {c.banks}
                    </p>
                    <p className="text-sm text-foreground/70">
                      <strong className="text-foreground/85">{t('ynab_problem')}</strong> {c.pain}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-foreground/60 max-w-2xl mx-auto"> {t('in_budgero_it_does_not_matter')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Multi-currency deep section */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('real_multi_currency_not_one_currency')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('a_lot_of_european_budgeters_have')} </p>
                <p> {t('budgero_lets_you_hold_accounts_in')}{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('168_currencies')} </Link>{' '} {t('inside_the_same_budget_pick_a')} </p>
                <p> {t('this_is_the_number_one_reason')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* GDPR and privacy */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border/70">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-[#2f6246]" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {t('your_data_lives_in_finland_and')} </h2>
                </div>
                <p className="text-lg text-foreground/75 leading-relaxed mb-4"> {t('budgero_cloud_is_hosted_in_finland')} </p>
                <p className="text-lg text-foreground/75 leading-relaxed mb-4"> {t('concretely_that_means')} </p>
                <ul className="space-y-3 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('no_telemetry_no_usage_tracking_no')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('your_data_export_request_is_instant')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('right_to_be_forgotten_is_mechanical')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('data_breach_risk_is_minimized_even')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('full_data_sovereignty_is_one_docker')}{' '}
                      <Link
                        href="/self-hostable"
                        className="underline hover:text-foreground"
                      > {t('budgero_self_host')} </Link>{' '} {t('on_your_own_eu_server_if')} </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Pricing in EUR context */}
            <section className="py-16 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Euro className="w-6 h-6 text-foreground/70" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground"> {t('priced_for_europe')} </h2>
              </div>
              <p className="text-lg text-foreground/75 leading-relaxed mb-6"> {t('budgero_cloud_is')} {pricing.monthly}{t('month_or')} {pricing.yearly}{t('year_roughly_3_50_per_month')} </p>
              <p className="text-lg text-foreground/75 leading-relaxed"> {t('if_you_would_rather_not_pay')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('who_budgero_is_built_for')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('you_are_a_good_fit_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('live_in_the_eu_uk_switzerland')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('earn_or_spend_in_more_than')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('are_a_freelancer_who_needs_vat')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('care_that_your_financial_data_is')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_the_option_to_self_host')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('already_have_a_ynab_budget_you')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('you_might_be_better_off_with')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('only_use_usd_and_are_based')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_automatic_bank_sync_and_refuse')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('prefer_native_ios_and_android_apps')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('are_not_concerned_about_data_sovereignty')} </span>
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
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> {t('35_days_free_no_card')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('budget_in_every_currency_privately_from')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_budgero_cloud')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <Link href="/self-hosted-ynab-alternative">{t('prefer_to_self_host')}</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('also_see')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('best_ynab_alternatives_in_2026')} </Link>{' '}·{' '}
                  <Link href="/ynab-alternative-uk" className="underline hover:text-foreground"> {t('ynab_alternative_for_the_uk')} </Link>{' '}·{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground"> {t('full_budgero_vs_ynab_comparison')} </Link>{' '}·{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('multi_currency_budgeting')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
