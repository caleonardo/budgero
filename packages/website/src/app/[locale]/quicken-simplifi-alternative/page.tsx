import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ComparisonReferences } from '@/components/comparison-references';
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
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quicken_simplifi_alternative' });
  return withLocalizedUrls(locale, '/quicken-simplifi-alternative', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_af3a38f038ee'),
      copy('u_9dc82f0819ee'),
      copy('u_aa5d72e41419'),
      copy('u_68247decdc47'),
      copy('u_a6df6a01a87b'),
      copy('u_721a673e490a'),
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

const makeComparisonData = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: copy('u_c0c1679b46bf'),
    budgero: copy('u_6730f1c07c70', {
      p0: pricing.yearly,
    }),
    simplifi: copy('u_3b61da207fe1'),
    budgeroNote: copy('u_2c803e265a8f'),
    simplifiNote: copy('u_9cb9b85fc149'),
  },
  {
    feature: t('comparisonData_works_outside_the_us'),
    budgero: true,
    simplifi: false,
    budgeroNote: copy('u_295e2f4bc23c'),
    simplifiNote: copy('u_0801c44fffc5'),
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
    budgeroNote: copy('u_8c1d2da0deb1'),
    simplifiNote: copy('u_39b17420cbc4'),
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
    simplifiNote: copy('u_dd1642721ccd'),
  },
];

const makeFaqs = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    q: t('faqs_what_is_the_difference_between_simplifi'),
    a: t('faqs_philosophy_simplifi_is_automation_first_it'),
  },
  {
    q: copy('u_d580752b8b5e'),
    a: copy('u_f15e5ac2ac2a', {
      p0: pricing.yearly,
    }),
  },
  {
    q: copy('u_821eea80cbc2'),
    a: copy('u_be54c614bce9'),
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

export default async function QuickenSimplifiAlternativePage({
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
    namespace: 'quicken_simplifi_alternative',
  });
  const faqs = makeFaqs(t, copy);
  const comparisonData = makeComparisonData(t, copy);
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
        url: 'https://budgero.app/quicken-simplifi-alternative',
        description: copy('u_75cfbd5908a8'),
        offers: {
          '@type': 'Offer',
          price: pricing.yearly.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          copy('u_0c3992b67600'),
          copy('u_699441c94b63'),
          copy('u_e2ce38399846'),
          copy('u_fc54b0c889cf'),
          copy('u_9a326d07d39f'),
          copy('u_965742a116f6'),
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
          {
            '@type': 'ListItem',
            position: 1,
            name: copy('u_3a78695388b3'),
            item: 'https://budgero.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy('u_e9f62182092b'),
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
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('privacy_first_budgeting')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('quicken_simplifi_alternative')}{' '}
                  <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium">
                    {' '}
                    {t('budget_without_sharing_your_bank_credentials')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {copy('u_d7153f398eb9')}{' '}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=quicken-simplifi-alternative&utm_content=hero">
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
                    <Link href="/self-hostable">{copy('u_b921dabc8643')}</Link>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  {' '}
                  {copy('u_afe641225326')} <br /> {copy('u_0568bd03b8eb')}{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_2da350be8075')}{' '}
                  </Link>{' '}
                  {copy('u_57462bbc2467')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Key Differences Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('key_differences_from_simplifi')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">
                  {' '}
                  {t('different_philosophy_different_approach_to_your')}{' '}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {t('zero_knowledge_encryption')}{' '}
                  </h3>
                  <p className="text-foreground/70">
                    {' '}
                    {t('simplifi_stores_your_financial_data_on')}{' '}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {t('zero_based_budgeting')}{' '}
                  </h3>
                  <p className="text-foreground/70">
                    {' '}
                    {t('simplifi_tracks_your_spending_after_the')}{' '}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {copy('u_ba9955814769')}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_6aaa48929945')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <WifiOff className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_3d80bc518dec')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_30c5dbb13a5d')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {copy('u_d0a44e2d5b0e')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">{copy('u_ca7a476ede2f')}</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        {' '}
                        {t('feature')}{' '}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('budgero')}{' '}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('quicken_simplifi')}{' '}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparisonData.map((row, index) => (
                      <tr
                        key={row.feature}
                        className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/25'}
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
                                <span className="text-xs text-foreground/55">
                                  {row.budgeroNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-medium text-[#2f6246]">
                                {row.budgero}
                              </span>
                              {row.budgeroNote && (
                                <span className="text-xs text-foreground/55">
                                  {row.budgeroNote}
                                </span>
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
                                <span className="text-xs text-foreground/55">
                                  {row.simplifiNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">{row.simplifi}</span>
                              {row.simplifiNote && (
                                <span className="text-xs text-foreground/55">
                                  {row.simplifiNote}
                                </span>
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('spending_plan_vs_zero_based_why')}{' '}
              </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {copy('u_e8a279e8f2cf')} </p>
                <p>
                  {' '}
                  {copy('u_58bb4aac354b')} <em>{copy('u_10c22bcf4c76')}</em>
                  {copy('u_046cf243a166')}{' '}
                </p>
                <p>
                  {' '}
                  {copy('u_c4915dad5dfc')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_68e0657fa94e')}{' '}
                  </Link>
                  .
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Where Simplifi Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  {' '}
                  {t('where_simplifi_wins')}{' '}
                </h2>
                <p className="text-lg text-foreground/75 mb-6">
                  {' '}
                  {t('simplifi_is_a_solid_product_here')}{' '}
                </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {copy('u_c6d2dda896cf')} </strong>{' '}
                      {copy('u_1428b16bf7fe')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">
                        {t('bill_tracking_and_reminders')}
                      </strong>{' '}
                      {t('simplifi_detects_recurring_bills_from_your')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{copy('u_533312fb9cc1')}</strong>{' '}
                      {copy('u_ec8953f90e4c')} {pricing.yearly}
                      {copy('u_5cd8b326a8b0')}{' '}
                      <Link href="/self-hostable" className="underline hover:text-foreground">
                        {' '}
                        {copy('u_be30270d0afb')}{' '}
                      </Link>
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {copy('u_37dcdc012df6')} </strong>{' '}
                      {copy('u_0280201ef6b5')}{' '}
                    </span>
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
                    <Check className="w-6 h-6 text-green-600" /> {t('switch_to_budgero_if')}{' '}
                  </h3>
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
                      <span>
                        {' '}
                        {t('you_want_to')}{' '}
                        <Link href="/self-hostable" className="underline">
                          {' '}
                          {t('self_host')}{' '}
                        </Link>{' '}
                        {t('your_budgeting_app_for_free')}{' '}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_simplifi_if')}{' '}
                  </h3>
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
                  label: copy('u_b3934c3de2cb'),
                  href: 'https://www.quicken.com/products/simplifi/',
                },
                {
                  label: copy('u_9179af7192b1'),
                  href: 'https://support.simplifi.quicken.com/en/articles/3828353-what-currencies-does-quicken-simplifi-support',
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
                  {t('ready_to_switch_from_quicken_simplifi')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  {' '}
                  {t('try_budgero_free_for_35_days')}{' '}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=quicken-simplifi-alternative&utm_content=final">
                      {' '}
                      {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {copy('u_f970e30131a2')}{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_a967afa170d4')}{' '}
                  </Link>{' '}
                  {copy('u_48113592907c')}{' '}
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
