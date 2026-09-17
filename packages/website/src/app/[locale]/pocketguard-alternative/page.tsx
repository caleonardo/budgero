import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ComparisonReferences } from '@/components/comparison-references';
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
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pocketguard_alternative' });
  return withLocalizedUrls(locale, '/pocketguard-alternative', {
    title: copy('u_7b93742a32a8'),
    description: copy('u_d6720af3f551'),
    keywords: [
      copy('u_a457491c6c7e'),
      copy('u_318c5b27dc2f'),
      copy('u_d63abd376d02'),
      copy('u_bc0f00903a9d'),
      copy('u_8ab103d41e04'),
      copy('u_56ae51a39198'),
    ],
    alternates: { canonical: 'https://budgero.app/pocketguard-alternative' },
    openGraph: {
      title: copy('u_7b93742a32a8'),
      description: copy('u_d6720af3f551'),
      url: 'https://budgero.app/pocketguard-alternative',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy('u_7b93742a32a8'),
      description: copy('u_d6720af3f551'),
    },
  });
}

const makeComparisonData = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: t('comparisonData_annual_price'),
    budgero: copy('u_6730f1c07c70', {
      p0: pricing.yearly,
    }),
    pocketguard: copy('u_75aa59003f5b'),
    budgeroNote: copy('u_2c803e265a8f'),
    pocketguardNote: copy('u_c7fe7f3335c5'),
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
    feature: copy('u_f49ab0989c2c'),
    budgero: true,
    pocketguard: true,
    budgeroNote: copy('u_2b34fa8f0fdf'),
    pocketguardNote: copy('u_60458631346c'),
  },
  {
    feature: t('comparisonData_multi_currency_support'),
    budgero: true,
    pocketguard: false,
    budgeroNote: copy('u_88469300764a'),
    pocketguardNote: copy('u_9b8e41fb5af5'),
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

export default async function PocketGuardAlternativePage({
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
    namespace: 'pocketguard_alternative',
  });
  const comparisonData = makeComparisonData(t, copy);
  const jsonLd = {
    '@context': 'https://schema.org',
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
    url: 'https://budgero.app/pocketguard-alternative',
    description: copy('u_a8cf54ab69ca'),
    offers: {
      '@type': 'Offer',
      price: pricing.yearly.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      copy('u_0c3992b67600'),
      copy('u_699441c94b63'),
      copy('u_fc54b0c889cf'),
      copy('u_8e49033eb893'),
      copy('u_9a326d07d39f'),
      copy('u_a75e1bcc9dad'),
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
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('no_bank_connection_required')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('pocketguard_alternative')}{' '}
                  <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium">
                    {' '}
                    {t('budget_without_handing_your_bank_credentials')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {copy('u_a281496a5987')}{' '}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=pocketguard-alternative&utm_content=hero">
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
                  {t('why_switch_from_pocketguard')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">
                  {' '}
                  {t('pocketguard_tracks_spending_after_the_fact')}{' '}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_ac8609b36f3a')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_eafcb79a2202')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {' '}
                    {copy('u_d32e38482f73')}{' '}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_419d173643e2')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {copy('u_d01330fb57b5')}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_8fc794a3cdd5')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {copy('u_528dc6c22635')}
                  </h3>
                  <p className="text-foreground/70"> {copy('u_86cc14ddc229')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {copy('u_750920ea7c17')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">{copy('u_ca7a476ede2f')}</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                <table className="w-full">
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
                        {t('pocketguard')}{' '}
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
                          {typeof row.pocketguard === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.pocketguard ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.pocketguardNote && (
                                <span className="text-xs text-foreground/55">
                                  {row.pocketguardNote}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">{row.pocketguard}</span>
                              {row.pocketguardNote && (
                                <span className="text-xs text-foreground/55">
                                  {row.pocketguardNote}
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

            {/* Where PocketGuard Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  {' '}
                  {t('where_pocketguard_wins')}{' '}
                </h2>
                <p className="text-lg text-foreground/75 mb-6">
                  {' '}
                  {t('pocketguard_is_a_solid_app_for')}{' '}
                </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{copy('u_84155dc092ea')}</strong>{' '}
                      {copy('u_725c1d8bc4e3')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{copy('u_3911b9262f3a')}</strong>{' '}
                      {copy('u_700ec98bc67b')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{copy('u_45c36c55ee9d')}</strong>{' '}
                      {copy('u_035fe7d33c96')}{' '}
                    </span>
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
                    <Check className="w-6 h-6 text-green-600" /> {t('switch_to_budgero_if')}{' '}
                  </h3>
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
                      <span>
                        {' '}
                        {t('you_want_a')}{' '}
                        <Link href="/self-hostable" className="underline">
                          {' '}
                          {t('self_host_option')}{' '}
                        </Link>{' '}
                        {t('with_full_features_for_free')}{' '}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" />{' '}
                    {t('stick_with_pocketguard_if')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {copy('u_819f19213abc')} </span>
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
                      <span> {copy('u_3bde7d74d2a4')} </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <ComparisonReferences
              reviewedOn="2026-09-05"
              sources={[
                { label: copy('u_9821910bc773'), href: 'https://pocketguard.com/pricing/' },
                {
                  label: copy('u_7849f7b0c54d'),
                  href: 'https://pocketguard.com/help/track-cash-in-pocketguard/',
                },
                {
                  label: copy('u_7116d6d652dd'),
                  href: 'https://pocketguard.com/helps/import-transactions-to-track-expenses-manually/',
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
                  {t('ready_to_switch_from_pocketguard')}{' '}
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
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=pocketguard-alternative&utm_content=final">
                      {' '}
                      {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {copy('u_bc51f48dbe61')}{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_a967afa170d4')}{' '}
                  </Link>{' '}
                  {copy('u_ec636432ff1b')}{' '}
                </p>
                <p className="mt-3 text-sm text-foreground/60">
                  {' '}
                  {copy('u_a4ac163e74ad')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    {' '}
                    {copy('u_4c3763d11fdd')}{' '}
                  </Link>{' '}
                  {copy('u_eb95eacfe17a')}{' '}
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
