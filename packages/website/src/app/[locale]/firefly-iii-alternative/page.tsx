import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Server } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'firefly_iii_alternative' });
  return withLocalizedUrls(locale, '/firefly-iii-alternative', {
  title: t('meta_title'),
  description: t('meta_description'),
  keywords: [
    'firefly iii alternative',
    'firefly iii alternatives',
    'firefly alternative',
    'self hosted budgeting app',
    'self hosted personal finance',
    'firefly iii vs',
    'firefly iii replacement',
    'docker budgeting app',
    'envelope budgeting self hosted',
  ],
  alternates: { canonical: 'https://budgero.app/firefly-iii-alternative' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
    url: 'https://budgero.app/firefly-iii-alternative',
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
    feature: t('comparisonData_price_self_hosted'),
    budgero: t('cell_free'),
    firefly: t('cell_free'),
    budgeroNote: t('comparisonData_full_feature_parity_no_gating'),
    fireflyNote: t('comparisonData_free_and_open_source'),
  },
  {
    feature: t('comparisonData_open_source'),
    budgero: false,
    firefly: true,
    budgeroNote: t('comparisonData_open_source_agpl_self_hostable'),
    fireflyNote: t('comparisonData_agpl_community_driven'),
  },
  {
    feature: t('comparisonData_budgeting_method'),
    budgero: t('comparisonData_zero_based_envelopes'),
    firefly: t('comparisonData_double_entry_ledger'),
    budgeroNote: t('comparisonData_ynab_style_every_dollar_a_job'),
    fireflyNote: t('comparisonData_budgets_exist_but_accounting_first'),
  },
  {
    feature: t('comparisonData_multi_currency_budgeting'),
    budgero: t('comparisonData_168_currencies_live_fx'),
    firefly: t('cell_partial'),
    budgeroNote: t('comparisonData_one_budget_across_currencies'),
    fireflyNote: t('comparisonData_currencies_supported_cross_currency_budgeting'),
  },
  {
    feature: t('comparisonData_end_to_end_encryption'),
    budgero: true,
    firefly: false,
    budgeroNote: t('comparisonData_aes_256_gcm_zero_knowledge'),
    fireflyNote: t('comparisonData_server_side_data_protected_by_your'),
  },
  {
    feature: t('comparisonData_mobile_experience'),
    budgero: t('comparisonData_pwa_offline_first'),
    firefly: t('comparisonData_community_apps'),
    budgeroNote: t('comparisonData_installable_works_offline'),
    fireflyNote: t('comparisonData_no_official_mobile_app'),
  },
  {
    feature: 'Setup',
    budgero: t('comparisonData_docker_compose'),
    firefly: t('comparisonData_docker_compose'),
    budgeroNote: t('comparisonData_single_compose_file_10_minutes'),
    fireflyNote: t('comparisonData_app_separate_data_importer'),
  },
  {
    feature: t('comparisonData_managed_cloud_option'),
    budgero: true,
    firefly: false,
    budgeroNote: t('comparisonData_monthly_mo_if_you_stop_wanting', {
      monthly: pricing.monthly
    }),
    fireflyNote: t('comparisonData_self_host_only'),
  },
  {
    feature: t('comparisonData_ynab_import'),
    budgero: true,
    firefly: t('comparisonData_via_importer'),
    budgeroNote: t('comparisonData_direct_import_5_minutes'),
    fireflyNote: t('comparisonData_csv_through_the_data_importer'),
  },
  {
    feature: t('comparisonData_api_access'),
    budgero: true,
    firefly: true,
    budgeroNote: t('comparisonData_push_api'),
    fireflyNote: t('comparisonData_full_rest_api'),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_why_would_i_switch_from_firefly'),
    a: t('faqs_the_two_most_common_reasons_budgeting'),
  },
  {
    q: t('faqs_is_budgero_open_source_like_firefly'),
    a: t('faqs_yes_budgero_is_open_source_under'),
  },
  {
    q: t('faqs_how_does_multi_currency_compare_between'),
    a: t('faqs_firefly_iii_supports_multiple_currencies_at'),
  },
  {
    q: t('faqs_can_i_migrate_my_firefly_iii'),
    a: t('faqs_yes_via_csv_export_your_transactions'),
  },
  {
    q: t('faqs_what_does_budgero_self_host_require'),
    a: t('faqs_docker_and_roughly_10_minutes_pull'),
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

export default async function FireflyAlternativePage(
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
  const t = await getTranslations('firefly_iii_alternative');
  const faqs = makeFaqs(t);
  const comparisonData = makeComparisonData(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/firefly-iii-alternative',
        description:
          'Firefly III alternative — free, self-hosted, zero-based envelope budgeting with 168 currencies, end-to-end encryption, and an offline-first PWA.',
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
          'Zero-based envelope budgeting',
          'Free self-host edition (Docker)',
          'Multi-currency (168 currencies) with live FX',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Offline-first PWA',
          'YNAB and CSV import',
          'Managed Cloud option',
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
            name: 'Firefly III Alternative',
            item: 'https://budgero.app/firefly-iii-alternative',
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
                  <Server className="w-3.5 h-3.5 mr-2" /> {t('self_hosted_free_docker_based')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_firefly_iii_alternative')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('same_self_hosted_freedom_with_envelope')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('firefly_iii_is_a_great_ledger')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <Link href="/docs/self-hosting-guide"> {t('self_host_for_free')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('compare_with_firefly_iii')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('or_try_budgero_cloud_free_for')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Honest framing */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('firefly_iii_is_a_ledger_budgero')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('let_s_be_fair_to_firefly')} </p>
                <p> {t('the_reason_people_go_looking_for')} <em>{t('next')}</em>{t('every_unit_of_money_gets_a')} <em>is</em> {t('the_core_the_same_philosophy_that')}{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('168_currencies')} </Link>{' '} {t('handled_natively')} </p>
                <p> {t('the_second_reason_is_the_household')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_self_host_vs_firefly_iii')} </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero_self_host')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('firefly_iii')} </th>
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
                          {renderCellValue(row.firefly, row.fireflyNote, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-foreground/60 text-sm max-w-3xl">
                <strong className="text-foreground">{t('key_takeaway')}</strong> {t('pick_firefly_iii_for_an_open')} </p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('your_server_your_data_a_budget')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('spin_up_budgero_self_host_with')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <Link href="/docs/self-hosting-guide"> {t('read_the_self_hosting_guide')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=firefly-iii-alternative&utm_content=final"> {t('try_cloud_free_instead')} </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('also_see')}{' '}
                  <Link
                    href="/self-hosted-ynab-alternative"
                    className="underline hover:text-foreground"
                  > {t('self_hosted_ynab_alternative')} </Link>{' '}·{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('best_ynab_alternatives_in_2026')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
