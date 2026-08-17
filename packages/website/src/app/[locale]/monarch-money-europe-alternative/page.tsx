import { getTranslations, setRequestLocale } from 'next-intl/server';
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
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'monarch_money_europe_alternative' });
  return withLocalizedUrls(locale, '/monarch-money-europe-alternative', {
  title: t('meta_title'),
  description: t('meta_description'),
  keywords: [
    'monarch money europe',
    'monarch money europe alternative',
    'monarch money uk',
    'monarch money eu',
    'monarch alternative europe',
    'monarch alternative uk',
    'monarch money germany',
    'monarch money netherlands',
    'european budgeting app',
    'monarch money international',
    'monarch money outside us',
    'budgeting app europe monarch',
    'monarch money multi currency',
  ],
  alternates: { canonical: 'https://budgero.app/monarch-money-europe-alternative' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
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

const makeComparisonData = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    feature: t('comparisonData_available_in_europe'),
    budgero: true,
    monarch: false,
    budgeroNote: t('comparisonData_every_eu_country_uk_ch'),
    monarchNote: t('comparisonData_us_and_canada_only'),
  },
  {
    feature: t('comparisonData_multi_currency_support'),
    budgero: t('comparisonData_168_currencies'),
    monarch: t('comparisonData_usd_only'),
    budgeroNote: t('comparisonData_eur_gbp_chf_pln_sek_live'),
    monarchNote: t('comparisonData_foreign_currency_shown_as'),
  },
  {
    feature: t('comparisonData_billing_currency'),
    budgero: t('comparisonData_eur_gbp_usd_etc'),
    monarch: t('comparisonData_usd_only'),
    budgeroNote: t('comparisonData_vat_invoices_included'),
    monarchNote: t('comparisonData_fx_fees_on_every_charge'),
  },
  {
    feature: t('comparisonData_annual_price'),
    budgero: `${pricing.yearly}/year`,
    monarch: '$99.99/year',
    budgeroNote: t('comparisonData_or_free_with_self_host'),
    monarchNote: null,
  },
  {
    feature: t('comparisonData_gdpr_compliant_by_design'),
    budgero: true,
    monarch: false,
    budgeroNote: t('comparisonData_zero_knowledge_architecture'),
    monarchNote: t('comparisonData_us_based_data_storage'),
  },
  {
    feature: t('comparisonData_zero_knowledge_encryption'),
    budgero: true,
    monarch: false,
    budgeroNote: t('comparisonData_we_cannot_decrypt_your_data'),
    monarchNote: t('comparisonData_bank_level_but_not_zero_knowledge'),
  },
  {
    feature: t('comparisonData_works_offline'),
    budgero: true,
    monarch: false,
    budgeroNote: t('comparisonData_pwa_full_offline'),
    monarchNote: 'Cloud-only',
  },
  {
    feature: t('comparisonData_bank_sync_for_european_banks'),
    budgero: t('comparisonData_csv_manual'),
    monarch: false,
    budgeroNote: t('comparisonData_import_from_any_eu_bank'),
    monarchNote: t('comparisonData_no_eu_banks_supported'),
  },
  {
    feature: t('comparisonData_investment_tracking'),
    budgero: t('cell_manual'),
    monarch: t('comparisonData_automatic_us_brokers'),
    budgeroNote: t('comparisonData_track_any_asset_manually'),
    monarchNote: t('comparisonData_us_brokers_only'),
  },
  {
    feature: t('comparisonData_self_host_option'),
    budgero: true,
    monarch: false,
    budgeroNote: t('comparisonData_docker_on_eu_server'),
    monarchNote: null,
  },
  {
    feature: t('comparisonData_mobile_app_in_eu_app_store'),
    budgero: t('comparisonData_pwa_works_everywhere'),
    monarch: false,
    budgeroNote: null,
    monarchNote: t('comparisonData_ios_us_store_only'),
  },
];

const makeEuBankingExamples = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    country: t('cell_germany'),
    flag: '🇩🇪',
    note: t('euBankingExamples_n26_dkb_deutsche_bank_none_connect'),
  },
  {
    country: t('euBankingExamples_united_kingdom'),
    flag: '🇬🇧',
    note: t('euBankingExamples_monzo_revolut_starling_not_available'),
  },
  {
    country: 'France',
    flag: '🇫🇷',
    note: t('euBankingExamples_bnp_paribas_cre_dit_agricole_socie'),
  },
  {
    country: t('cell_netherlands'),
    flag: '🇳🇱',
    note: t('euBankingExamples_ing_abn_amro_bunq_unsupported'),
  },
  {
    country: 'Spain',
    flag: '🇪🇸',
    note: t('euBankingExamples_santander_bbva_caixabank_not_available'),
  },
  {
    country: t('cell_switzerland'),
    flag: '🇨🇭',
    note: t('euBankingExamples_ubs_raiffeisen_postfinance_no_chf_support'),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_why_is_monarch_money_not_available'),
    a: t('faqs_monarch_money_was_built_for_the'),
  },
  {
    q: t('faqs_what_is_the_best_monarch_money'),
    a: t('faqs_budgero_it_is_the_budgeting_app'),
  },
  {
    q: t('faqs_can_i_hold_accounts_in_eur'),
    a: t('faqs_yes_in_the_same_budget_pick'),
  },
  {
    q: t('faqs_does_budgero_connect_to_european_banks'),
    a: t('faqs_no_and_this_is_by_design'),
  },
  {
    q: t('faqs_is_budgero_gdpr_compliant'),
    a: t('faqs_yes_because_budgero_uses_zero_knowledge'),
  },
  {
    q: t('faqs_does_budgero_have_investment_tracking_like'),
    a: t('faqs_budgero_supports_manual_investment_tracking_you'),
  },
  {
    q: t('faqs_how_does_budgero_bill_customers_in'),
    a: t('faqs_via_lemon_squeezy_our_merchant_of'),
  },
  {
    q: t('faqs_is_budgero_cheaper_than_monarch'),
    a: t('faqs_yes_budgero_cloud_is_monthly_month', {
      monthly: pricing.monthly,
      yearly: pricing.yearly
    }),
  },
  {
    q: t('faqs_can_i_import_my_monarch_money'),
    a: t('faqs_yes_budgero_imports_csv_exports_from'),
  },
  {
    q: t('faqs_does_budgero_work_offline'),
    a: t('faqs_yes_budgero_is_a_progressive_web'),
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

const MONARCH_YEARLY_USD = 99.99;

export default async function MonarchMoneyEuropeAlternativePage(
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
  const t = await getTranslations('monarch_money_europe_alternative');
  const faqs = makeFaqs(t);
  const euBankingExamples = makeEuBankingExamples(t);
  const comparisonData = makeComparisonData(t);
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
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/monarch-money-europe-alternative',
        description:
          'Monarch Money alternative for Europe — multi-currency budgeting in EUR, GBP, CHF, PLN and 168 currencies, with GDPR-compliant zero-knowledge encryption.',
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
          'Available across Europe',
          'Multi-currency (168 currencies) with live FX',
          'GDPR-compliant zero-knowledge encryption',
          'VAT-compliant billing in local currency',
          'Offline support',
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
            name: 'Monarch Money Alternative for Europe',
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
                  <Ban className="w-3.5 h-3.5 mr-2" /> {t('monarch_money_isn_t_available_in')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_monarch_money_alternative_for_europe')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('because_monarch_literally_doesn_t_work')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('monarch_money_is_a_us_and')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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

                <p className="mt-4 text-sm text-foreground/60"> {t('35_days_free_no_card_needed')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why Monarch doesn't work */}
            <section id="why-not-monarch" className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_monarch_money_doesn_t_work')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('monarch_money_is_a_genuinely_good')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">{t('no_european_banks')}</strong> {t('monarch_s_bank_sync_is_powered')} </p>
                  <p>
                    <strong className="text-foreground">{t('no_non_usd_currencies')}</strong> {t('monarch_displays_every_transaction_with_a')} </p>
                  <p>
                    <strong className="text-foreground">{t('usd_billing_only')}</strong> {t('monarch_charges_in_usd_through_the')} </p>
                  <p>
                    <strong className="text-foreground">{t('ios_app_not_in_european_stores')}</strong>{' '} {t('the_monarch_ios_app_is_listed')} </p>
                  <p>
                    <strong className="text-foreground">{t('data_stored_under_us_law')}</strong>{' '} {t('monarch_s_servers_are_in_the')} </p>
                </div>

                <p className="pt-4"> {t('the_short_version_monarch_is_a')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* EU Banking Examples */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('not_a_single_european_bank_connects')} </h2>
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto"> {t('here_are_the_common_banks_across')} </p>
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
                    <p className="text-sm text-foreground/70">{c.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Key Advantages */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_european_households_choose_budgero')} </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('actually_works_in_europe')} </h3>
                  <p className="text-foreground/70"> {t('every_eu_country_the_uk_switzerland')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Euro className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('billed_in_your_currency')} </h3>
                  <p className="text-foreground/70"> {t('pay_in_eur_gbp_or_whichever')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('gdpr_by_design')} </h3>
                  <p className="text-foreground/70"> {t('zero_knowledge_encryption_means_we_cannot')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {percentCheaper}{t('cheaper')} </h3>
                  <p className="text-foreground/70"> {t('monarch_costs_99_99_year_budgero')} {pricing.yearly}{t('year_save')}{yearlySavings}{t('year_or')}{' '}
                    <Link href="/self-hostable" className="underline hover:text-foreground"> {t('self_host')} </Link>{' '} {t('on_your_own_eu_server_for')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_monarch_money_the_european')} </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('monarch_money')} </th>
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_eur_gbp_billing_168')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('who_this_is_for')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('you_re_a_great_fit_if')} </h3>
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
                      <span>{t('want_gdpr_grade_privacy_with_zero')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('are_a_freelancer_or_small_business')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_the_option_to_self_host')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_monarch_if_you')} </h3>
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
                      <span>{t('only_budget_in_usd_and_never')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('prefer_fully_hands_off_bank_sync')} </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55"> {t('monarch_is_a_solid_app_for')} </p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('a_budgeting_app_that_actually_works')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_budgero_trial')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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
                <p className="mt-6 text-sm text-foreground/60"> {t('also_see')}{' '}
                  <Link
                    href="/monarch-money-alternative"
                    className="underline hover:text-foreground"
                  > {t('full_budgero_vs_monarch')} </Link>{' '}·{' '}
                  <Link
                    href="/ynab-alternative-europe"
                    className="underline hover:text-foreground"
                  > {t('ynab_alternative_for_europe')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
