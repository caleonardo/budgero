import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { ArrowRight, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const t = await getTranslations({ locale, namespace: 'budgeting_multiple_currencies' });
  return withLocalizedUrls(locale, '/budgeting-multiple-currencies', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_c2c1e6bc8428'),
      copy('u_aed2b5e52f9c'),
      copy('u_8c5d4b28b32e'),
      copy('u_013559d46f68'),
      copy('u_5789b8e35cf6'),
      copy('u_ed3aacdb7847'),
      copy('u_0d07158db0e1'),
      copy('u_28cf554b9b73'),
    ],
    alternates: { canonical: 'https://budgero.app/budgeting-multiple-currencies' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/budgeting-multiple-currencies',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makeApproaches = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    title: t('approaches_the_spreadsheet'),
    description: t('approaches_convert_everything_to_one_base_currency'),
    pros: t('approaches_free_and_flexible'),
    cons: t('approaches_tedious_error_prone_and_you_will'),
  },
  {
    title: t('approaches_separate_budgets'),
    description: t('approaches_one_budget_per_currency_track_each'),
    pros: t('approaches_simple_per_budget'),
    cons: t('approaches_no_unified_view_cannot_see_total'),
  },
  {
    title: t('approaches_a_multi_currency_app'),
    description: t('approaches_use_a_budgeting_app_that_handles'),
    pros: t('approaches_accurate_automatic_and_sustainable'),
    cons: t('approaches_fewer_app_options_most_budgeting_apps'),
  },
];

const makeChecklist = (t: (key: string, values?: Record<string, string | number>) => string) => [
  t('checklist_native_currency_support_per_account_not'),
  t('checklist_live_exchange_rates_updated_automatically'),
  t('checklist_reporting_that_converts_to_your_display'),
  t('checklist_ability_to_budget_in_your_base'),
  t('checklist_support_for_50_currencies_minimum'),
  t('checklist_clear_handling_of_transfers_between_currencies'),
];

const makeTips = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    title: t('tips_pick_a_base_currency'),
    description: t('tips_choose_the_currency_you_think_in'),
  },
  {
    title: t('tips_do_not_convert_manually'),
    description: t('tips_manual_fx_conversion_is_the_fastest'),
  },
  {
    title: t('tips_budget_for_fx_fluctuations'),
    description: t('tips_add_a_3_5_buffer_to'),
  },
  {
    title: t('tips_review_in_one_currency'),
    description: t('tips_your_spending_reports_should_roll_up'),
  },
  {
    title: t('tips_track_transfers_separately'),
    description: t('tips_moving_money_between_currencies_is_not'),
  },
];

export default async function BudgetingMultipleCurrenciesPage({
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
    namespace: 'budgeting_multiple_currencies',
  });
  const tips = makeTips(t);
  const checklist = makeChecklist(t);
  const approaches = makeApproaches(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Budget with Multiple Currencies',
    author: { '@type': 'Organization', name: copy('u_045497ff4fcf') },
    datePublished: '2026-04-11',
    description: copy('u_37d3e6718c65'),
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
                  <Globe className="w-3.5 h-3.5 mr-2" /> {t('practical_guide')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('how_to_budget_with_multiple_currencies')}{' '}
                  <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium">
                    {' '}
                    {t('a_practical_guide_for_expats_nomads')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {t('if_you_earn_in_one_currency')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* The Challenge */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {t('the_challenge')}
              </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('exchange_rates_fluctuate_your_budget_in')} </p>
                <p> {t('category_tracking_gets_complicated_did_you')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Three Approaches */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('three_approaches')}{' '}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {approaches.map((approach) => (
                  <div
                    key={approach.title}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <h3 className="font-semibold text-foreground mb-3 text-lg">{approach.title}</h3>
                    <p className="text-foreground/70 text-sm mb-4">{approach.description}</p>
                    <p className="text-xs text-foreground/55 mb-1">
                      <strong className="text-green-600">{t('pros')}</strong> {approach.pros}
                    </p>
                    <p className="text-xs text-foreground/55">
                      <strong className="text-red-500">{t('cons')}</strong> {approach.cons}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What to Look For */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('what_to_look_for_in_a')}{' '}
              </h2>
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground/75">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Practical Tips */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('practical_tips')}{' '}
              </h2>
              <div className="space-y-6">
                {tips.map((tip, index) => (
                  <div key={tip.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-foreground">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                      <p className="text-foreground/70">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Soft Budgero Mention */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border/70">
                <p className="text-foreground/75 mb-6">
                  {' '}
                  {t('budgero_supports_100_currencies_with_live')}{' '}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup">
                    {' '}
                    {t('try_budgero_free')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <p className="mt-4 text-sm text-foreground/55">
                  {' '}
                  {t('35_day_trial')} {pricing.yearly}
                  {t('yr_no_credit_card_required')}{' '}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
