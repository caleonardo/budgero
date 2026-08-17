import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { ArrowRight, Check, X, Shield, Lock, Target, Globe } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'pocketguard_alternative' });
  return withLocalizedUrls(locale, '/pocketguard-alternative', {
  title: t('meta_title'),
  description: t('meta_description'),
  keywords: [
    'pocketguard alternative',
    'pocketguard replacement',
    'budgeting app without bank connection',
    'pocketguard vs budgero',
    'private budget app',
    'budget app no plaid',
  ],
  alternates: { canonical: 'https://budgero.app/pocketguard-alternative' },
  openGraph: {
    title: t('meta_title'),
    description: t('meta_description'),
    url: 'https://budgero.app/pocketguard-alternative',
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
    pocketguard: '$34.99/year',
    budgeroNote: t('comparisonData_or_free_with_self_host'),
    pocketguardNote: t('comparisonData_7_99_mo_if_monthly'),
  },
  {
    feature: t('comparisonData_budgeting_method'),
    budgero: t('cell_zero_based'),
    pocketguard: t('comparisonData_spending_tracker'),
    budgeroNote: t('comparisonData_every_dollar_gets_a_job'),
    pocketguardNote: t('comparisonData_in_my_pocket_after_bills'),
  },
  {
    feature: t('comparisonData_zero_knowledge_encryption'),
    budgero: true,
    pocketguard: false,
    budgeroNote: t('comparisonData_we_cannot_see_your_data'),
    pocketguardNote: t('comparisonData_standard_server_side_encryption'),
  },
  {
    feature: t('comparisonData_bank_sync_required'),
    budgero: false,
    pocketguard: true,
    budgeroNote: t('comparisonData_manual_first_works_without_it'),
    pocketguardNote: t('comparisonData_core_functionality_depends_on_it'),
  },
  {
    feature: t('comparisonData_multi_currency_support'),
    budgero: true,
    pocketguard: false,
    budgeroNote: t('comparisonData_168_currencies_live_fx_rates'),
    pocketguardNote: t('comparisonData_usd_only'),
  },
  {
    feature: t('comparisonData_works_offline'),
    budgero: true,
    pocketguard: false,
    budgeroNote: null,
    pocketguardNote: t('comparisonData_requires_internet_for_sync'),
  },
  {
    feature: t('comparisonData_shared_budgets'),
    budgero: true,
    pocketguard: false,
    budgeroNote: t('comparisonData_5_seats_included'),
    pocketguardNote: t('comparisonData_single_user_only'),
  },
  {
    feature: t('comparisonData_self_host_option'),
    budgero: true,
    pocketguard: false,
    budgeroNote: t('comparisonData_free_forever_full_features'),
    pocketguardNote: null,
  },
  {
    feature: t('comparisonData_data_export'),
    budgero: true,
    pocketguard: true,
    budgeroNote: t('comparisonData_csv_export'),
    pocketguardNote: t('comparisonData_csv_export'),
  },
  {
    feature: t('comparisonData_works_worldwide'),
    budgero: true,
    pocketguard: false,
    budgeroNote: t('comparisonData_168_currencies_any_country'),
    pocketguardNote: t('comparisonData_us_and_canada_focused'),
  },
];

export default async function PocketGuardAlternativePage(
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
  const t = await getTranslations('pocketguard_alternative');
  const comparisonData = makeComparisonData(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    image: 'https://budgero.app/logo_512.png',
    name: 'Budgero',
    applicationCategory: 'FinanceApplication',
    operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
    url: 'https://budgero.app/pocketguard-alternative',
    description:
      'PocketGuard alternative with zero-based budgeting, zero-knowledge encryption, multi-currency support, and no bank connection required.',
    offers: {
      '@type': 'Offer',
      price: pricing.yearly.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Zero-based budgeting',
      'Zero-knowledge encryption',
      'No bank connection required',
      'Multi-currency with live exchange rates',
      'Offline support',
      'Works worldwide',
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
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('no_bank_connection_required')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('pocketguard_alternative')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('budget_without_handing_your_bank_credentials')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('pocketguard_requires_plaid_to_connect_your')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=pocketguard-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_switch_from_pocketguard')} </h2>
                <p className="text-lg text-foreground/70"> {t('pocketguard_tracks_spending_after_the_fact')} </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('no_bank_credentials_shared')} </h3>
                  <p className="text-foreground/70"> {t('pocketguard_requires_plaid_to_access_your')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_knowledge_encryption')} </h3>
                  <p className="text-foreground/70"> {t('pocketguard_stores_your_financial_data_on')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_based_method')} </h3>
                  <p className="text-foreground/70"> {t('pocketguard_tracks_spending_after_the_fact_2')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('works_worldwide')} </h3>
                  <p className="text-foreground/70"> {t('pocketguard_is_focused_on_the_us')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_pocketguard')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_comparison')} </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('pocketguard')} </th>
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
                          {typeof row.pocketguard === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.pocketguard ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.pocketguardNote && (
                                <span className="text-xs text-foreground/55">{row.pocketguardNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">
                                {row.pocketguard}
                              </span>
                              {row.pocketguardNote && (
                                <span className="text-xs text-foreground/55">{row.pocketguardNote}</span>
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

            {/* Where PocketGuard Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('where_pocketguard_wins')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('pocketguard_is_a_solid_app_for')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('automatic_spending_tracking')}</strong>{' '} {t('if_you_are_ok_with_bank')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {t('in_my_pocket_feature')} </strong>{' '} {t('pocketguard_s_signature_feature_shows_you')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {t('simpler_for_passive_users')} </strong>{' '} {t('if_you_do_not_want_to')} </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Switch / Stick Grid */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('switch_to_budgero_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_do_not_want_to_share')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_zero_knowledge_encryption_for')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_proactive_budgeting_over_passive')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_manage_money_in_multiple_currencies')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_need_shared_budgets_for_your')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('you_want_a')}{' '}
                        <a href="/self-hostable" className="underline"> {t('self_host_option')} </a>{' '} {t('with_full_features_for_free')} </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_pocketguard_if')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_fully_automatic_bank_sync')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('you_rely_on_the_in_my')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_only_use_usd_and_live')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_want_a_passive_spending_tracker')}</span>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_to_switch_from_pocketguard')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('try_budgero_free_for_35_days')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=pocketguard-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('no_credit_card_required_want_all')}{' '}
                  <a
                    href="/self-hostable"
                    className="underline hover:text-foreground"
                  > {t('self_host_budgero')} </a>{' '} {t('on_your_own_infrastructure')} </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('weighing_your_options_compare_the')}{' '}
                  <a
                    href="/best-ynab-alternatives"
                    className="underline hover:text-foreground"
                  > {t('top_budgeting_apps')} </a>{' '} {t('side_by_side')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
