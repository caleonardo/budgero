import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Globe } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'monarch_money_multi_currency' });
  return withLocalizedUrls(locale, '/monarch-money-multi-currency', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_bdbf605648a6'),
      copy('u_9bca87cab95c'),
      copy('u_ac525e4450cd'),
      copy('u_a2c40bce8cd3'),
      copy('u_d70d7f79828a'),
      copy('u_4ab89c69912d'),
      copy('u_dd3dbf279bc5'),
      copy('u_9ebde0721714'),
      copy('u_4183a3bbd525'),
      copy('u_cb964e85a702'),
    ],
    alternates: { canonical: 'https://budgero.app/monarch-money-multi-currency' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/monarch-money-multi-currency',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makeComparisonData = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: t('comparisonData_currencies_per_budget'),
    monarch: t('comparisonData_one_usd_or_cad'),
    budgero: t('comparisonData_168_mixed_freely'),
  },
  {
    feature: t('comparisonData_live_exchange_rates'),
    monarch: false,
    budgero: true,
  },
  {
    feature: t('comparisonData_home_currency_rollup'),
    monarch: false,
    budgero: true,
  },
  {
    feature: t('comparisonData_supported_countries'),
    monarch: t('comparisonData_us_canada'),
    budgero: copy('u_dcc10bfd55ac'),
  },
  {
    feature: t('comparisonData_foreign_accounts_eur_gbp_aud'),
    monarch: t('comparisonData_manual_workarounds'),
    budgero: t('cell_native'),
  },
  {
    feature: t('cell_price'),
    monarch: copy('u_f5a033caadb8'),
    budgero: t('comparisonData_yearly_yr_or_free_self_host', {
      yearly: pricing.yearly,
    }),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_does_monarch_money_support_multiple_currencies'),
    a: t('faqs_no_as_of_2026_monarch_money'),
  },
  {
    q: t('faqs_which_countries_does_monarch_money_support'),
    a: t('faqs_monarch_money_officially_supports_the_united'),
  },
  {
    q: t('faqs_what_workarounds_do_people_use_for'),
    a: t('faqs_the_common_ones_tracking_foreign_accounts'),
  },
  {
    q: t('faqs_what_should_i_use_instead_if'),
    a: t('faqs_use_an_app_where_multi_currency'),
  },
  {
    q: t('faqs_is_monarch_money_planning_to_add'),
    a: t('faqs_multi_currency_has_been_a_long'),
  },
];

function renderCell(val: unknown, highlight?: boolean) {
  if (typeof val === 'boolean') {
    return val ? (
      <Check className="w-5 h-5 text-green-600 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-foreground/35 mx-auto" />
    );
  }
  return (
    <span className={`text-sm ${highlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}>
      {String(val)}
    </span>
  );
}

export default async function MonarchMultiCurrencyPage({
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
    namespace: 'monarch_money_multi_currency',
  });
  const faqs = makeFaqs(t);
  const comparisonData = makeComparisonData(t, copy);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Does Monarch Money Support Multiple Currencies? (2026)',
        author: { '@type': 'Organization', name: copy('u_045497ff4fcf') },
        datePublished: '2026-06-11',
        dateModified: '2026-06-11',
        description: copy('u_d9080ebd4804'),
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
            name: copy('u_10d85ae47488'),
            item: 'https://budgero.app/monarch-money-multi-currency',
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
            <section className="pt-24 pb-12 md:pt-32 md:pb-16 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-border/50"
                >
                  <Globe className="w-3.5 h-3.5 mr-2" /> {t('updated_june_2026')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.15]">
                  {' '}
                  {t('does_monarch_money_support_multiple_currencies')}{' '}
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-4 max-w-2xl mx-auto leading-relaxed">
                  <strong className="text-foreground">{t('short_answer_no')}</strong>{' '}
                  {t('monarch_money_is_built_for_the')}{' '}
                </p>
                <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                  {' '}
                  {t('here_s_exactly_what_monarch_does')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Monarch supports */}
            <section className="py-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {t('what_monarch_actually_supports_in_2026')}{' '}
              </h2>
              <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
                <p>
                  {' '}
                  {t('monarch_money_operates_in')}{' '}
                  <strong className="text-foreground">{t('usd_for_us_users_and_cad')}</strong>{' '}
                  {t('one_currency_per_budget_chosen_by')}{' '}
                </p>
                <p> {t('this_is_a_deliberate_product_choice')} </p>
                <p> {t('if_you_only_ever_touch_dollars')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Workarounds */}
            <section className="py-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {t('the_workarounds_and_why_they_break')}{' '}
              </h2>
              <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
                <p>
                  <strong className="text-foreground">
                    {t('manual_accounts_at_a_fixed_rate')}
                  </strong>{' '}
                  {t('you_add_your_eur_account_as')}{' '}
                </p>
                <p>
                  <strong className="text-foreground">{t('the_side_spreadsheet')}</strong>{' '}
                  {t('foreign_accounts_live_in_a_spreadsheet')}{' '}
                </p>
                <p>
                  <strong className="text-foreground">{t('just_ignoring_it')}</strong>{' '}
                  {t('the_most_common_one_the_foreign')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison */}
            <section className="py-12 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('monarch_vs_a_multi_currency_native')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">
                  {' '}
                  {t('what_native_multi_currency_actually_means')}{' '}
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                        {' '}
                        {t('feature')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('monarch_money')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('budgero')}{' '}
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
                        <td className="px-4 py-4 text-center">{renderCell(row.monarch)}</td>
                        <td className="px-4 py-4 text-center">{renderCell(row.budgero, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-foreground/60 text-sm max-w-3xl">
                {' '}
                {t('being_fair_to_monarch_it_has')}{' '}
                <Link href="/monarch-money-alternative" className="underline hover:text-foreground">
                  {' '}
                  {t('monarch_money_alternative_comparison')}{' '}
                </Link>{' '}
                {t('for_the_honest_breakdown')}{' '}
              </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What to use instead */}
            <section className="py-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {' '}
                {t('if_you_need_real_multi_currency')}{' '}
              </h2>
              <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
                <p>
                  {' '}
                  {t('budgero_treats_currencies_as_a_first')}{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {t('168_currencies')}{' '}
                  </Link>{' '}
                  {t('inside_one_budget_with_live_exchange')}{' '}
                </p>
                <p>
                  {' '}
                  {t('if_zero_based_budgeting_isn_t')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    {' '}
                    {t('9_app_comparison')}{' '}
                  </Link>
                  .
                </p>
                <p>
                  {' '}
                  {t('based_in_europe_monarch_doesn_t')}{' '}
                  <Link
                    href="/monarch-money-europe-alternative"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {t('monarch_money_alternative_for_europe')}{' '}
                  </Link>
                  .
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-12 max-w-3xl mx-auto">
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

            {/* Final CTA */}
            <section className="py-16 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {' '}
                  {t('budget_in_every_currency_you_actually')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  {' '}
                  {t('168_currencies_live_fx_rates_one')} {pricing.monthly}
                  {t('mo_or_free_if_you_self')}{' '}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-multi-currency&utm_content=final">
                    {' '}
                    {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {t('no_card_needed_import_from_monarch')}{' '}
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
