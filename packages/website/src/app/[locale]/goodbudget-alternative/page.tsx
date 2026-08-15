import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, Check, X, Shield, Globe, BarChart3, Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Goodbudget Alternative - Encrypted Envelope Budgeting | Budgero',
  description:
    'Looking for a Goodbudget alternative? Budgero offers envelope budgeting with zero-knowledge encryption, 168 currencies, modern UI, and powerful reporting.',
  keywords: [
    'goodbudget alternative',
    'goodbudget replacement',
    'envelope budgeting app',
    'goodbudget vs budgero',
    'envelope budgeting private',
    'budget app for couples',
  ],
  alternates: { canonical: 'https://budgero.app/goodbudget-alternative' },
  openGraph: {
    title: 'Goodbudget Alternative - Encrypted Envelope Budgeting | Budgero',
    description:
      'Looking for a Goodbudget alternative? Budgero offers envelope budgeting with zero-knowledge encryption, 168 currencies, modern UI, and powerful reporting.',
    url: 'https://budgero.app/goodbudget-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goodbudget Alternative - Encrypted Envelope Budgeting | Budgero',
    description:
      'Looking for a Goodbudget alternative? Budgero offers envelope budgeting with zero-knowledge encryption, 168 currencies, modern UI, and powerful reporting.',
  },
};

const comparisonData = [
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    goodbudget: '$70/year',
    budgeroNote: 'Or free with Self-Host',
    goodbudgetNote: 'Plus plan; free tier available',
  },
  {
    feature: 'Envelope / zero-based method',
    budgero: true,
    goodbudget: true,
    budgeroNote: null,
    goodbudgetNote: null,
  },
  {
    feature: 'Zero-knowledge encryption',
    budgero: true,
    goodbudget: false,
    budgeroNote: 'We cannot see your data',
    goodbudgetNote: 'Standard server-side storage',
  },
  {
    feature: 'Bank sync',
    budgero: false,
    goodbudget: false,
    budgeroNote: null,
    goodbudgetNote: null,
  },
  {
    feature: 'Multi-currency support',
    budgero: true,
    goodbudget: false,
    budgeroNote: '168 currencies, live FX rates',
    goodbudgetNote: 'Single currency only',
  },
  {
    feature: 'Works offline',
    budgero: true,
    goodbudget: true,
    budgeroNote: null,
    goodbudgetNote: null,
  },
  {
    feature: 'Shared budgets',
    budgero: true,
    goodbudget: true,
    budgeroNote: '5 seats included',
    goodbudgetNote: 'Sync between partners',
  },
  {
    feature: 'Reporting & analytics',
    budgero: 'Advanced',
    goodbudget: 'Basic',
    budgeroNote: 'Spending breakdowns, net worth, trends',
    goodbudgetNote: 'Simple spending reports',
  },
  {
    feature: 'Mobile app',
    budgero: 'PWA',
    goodbudget: 'Native',
    budgeroNote: 'Works on any device via browser',
    goodbudgetNote: 'iOS and Android apps',
  },
  {
    feature: 'Self-host option',
    budgero: true,
    goodbudget: false,
    budgeroNote: 'Full features, free forever',
    goodbudgetNote: null,
  },
  {
    feature: 'CSV / data import',
    budgero: true,
    goodbudget: true,
    budgeroNote: 'CSV, PDF, YNAB import',
    goodbudgetNote: 'CSV import',
  },
];

export default async function GoodbudgetAlternativePage(
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
  const t = await getTranslations('goodbudget_alternative');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    image: 'https://budgero.app/logo_512.png',
    name: 'Budgero',
    applicationCategory: 'FinanceApplication',
    operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
    url: 'https://budgero.app/goodbudget-alternative',
    description:
      'Goodbudget alternative with envelope budgeting, zero-knowledge encryption, 168 currencies, and modern reporting.',
    offers: {
      '@type': 'Offer',
      price: pricing.yearly.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Envelope / zero-based budgeting',
      'Zero-knowledge encryption',
      '168 currencies with live exchange rates',
      'Spending breakdowns and trend analysis',
      'Shared budgets with 5 seats',
      'Self-host option',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-600/30 text-green-700 bg-green-50"
                >
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('modern_envelope_budgeting')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('goodbudget_alternative')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('envelope_budgeting_with_encryption_multi_currenc')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('goodbudget_is_simple_and_reliable_but')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=goodbudget-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_switch_from_goodbudget')} </h2>
                <p className="text-lg text-foreground/70"> {t('goodbudget_nails_the_basics_here_s')} </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_knowledge_encryption')} </h3>
                  <p className="text-foreground/70"> {t('goodbudget_uses_standard_server_side_storage')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('168_currencies')} </h3>
                  <p className="text-foreground/70"> {t('goodbudget_is_single_currency_only_budgero')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('modern_reporting')} </h3>
                  <p className="text-foreground/70"> {t('goodbudget_offers_basic_spending_reports_budgero')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <Paintbrush className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('modern_interface')} </h3>
                  <p className="text-foreground/70"> {t('goodbudget_s_ui_hasn_t_changed')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_goodbudget')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_comparison')} </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('goodbudget')} </th>
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
                          {typeof row.goodbudget === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.goodbudget ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.goodbudgetNote && (
                                <span className="text-xs text-foreground/55">{row.goodbudgetNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">
                                {row.goodbudget}
                              </span>
                              {row.goodbudgetNote && (
                                <span className="text-xs text-foreground/55">{row.goodbudgetNote}</span>
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

            {/* Where Goodbudget Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('where_goodbudget_wins')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('goodbudget_has_real_strengths_here_s')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('simpler_learning_curve')}</strong>{' '} {t('goodbudget_keeps_things_minimal_if_you')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('native_mobile_apps')}</strong>{' '} {t('goodbudget_has_dedicated_ios_and_android')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('free_tier')}</strong>{' '} {t('goodbudget_offers_a_free_plan_with')}{' '}
                      <a href="/self-hostable" className="underline hover:text-foreground"> {t('self_host_for_free')} </a>).
                                          </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('long_track_record_for_couples')}</strong>{' '} {t('goodbudget_has_been_helping_couples_budget')} </span>
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
                      <span>{t('you_manage_money_in_multiple_currencies')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_need_deeper_reporting_spending_breakdowns')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_a_modern_polished_interface')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('you_want_to')}{' '}
                        <a href="/self-hostable" className="underline"> {t('self_host')} </a>{' '} {t('with_full_features_for_free')} </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_goodbudget_if')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_the_simplest_possible_envelope')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_need_a_native_app_from')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_want_a_free_plan_for')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_only_use_one_currency_and')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_to_switch_from_goodbudget')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('try_budgero_free_for_35_days')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=goodbudget-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_all_features_for_free')}{' '}
                  <a
                    href="/self-hostable"
                    className="underline hover:text-foreground"
                  > {t('self_host_budgero')} </a>{' '} {t('with_full_sync_multi_currency_and')} </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('still_exploring_compare_the')}{' '}
                  <a
                    href="/best-ynab-alternatives"
                    className="underline hover:text-foreground"
                  > {t('ynab_alternatives')} </a>{' '} {t('worth_switching_to')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
