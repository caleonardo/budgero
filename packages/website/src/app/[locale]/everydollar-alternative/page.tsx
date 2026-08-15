import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, Check, X, Globe, Shield, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'EveryDollar Alternative - Private Zero-Based Budgeting | Budgero',
  description:
    'Looking for an EveryDollar alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, multi-currency support, and no bank connection required.',
  keywords: [
    'everydollar alternative',
    'everydollar replacement',
    'ramsey budgeting alternative',
    'zero based budgeting app private',
    'budgeting app without bank connection',
    'everydollar vs budgero',
  ],
  alternates: { canonical: 'https://budgero.app/everydollar-alternative' },
  openGraph: {
    title: 'EveryDollar Alternative - Private Zero-Based Budgeting | Budgero',
    description:
      'Looking for an EveryDollar alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, multi-currency support, and no bank connection required.',
    url: 'https://budgero.app/everydollar-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EveryDollar Alternative - Private Zero-Based Budgeting | Budgero',
    description:
      'Looking for an EveryDollar alternative? Budgero offers zero-based budgeting with zero-knowledge encryption, multi-currency support, and no bank connection required.',
  },
};

const comparisonData = [
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    everydollar: 'Free / $79.99/yr Premium',
    budgeroNote: 'Or free with Self-Host',
    everydollarNote: null,
  },
  {
    feature: 'Zero-based budgeting',
    budgero: true,
    everydollar: true,
    budgeroNote: null,
    everydollarNote: null,
  },
  {
    feature: 'Encryption',
    budgero: 'AES-256-GCM',
    everydollar: 'Standard',
    budgeroNote: 'Zero-knowledge, client-side',
    everydollarNote: 'Server-side, Ramsey can access data',
  },
  {
    feature: 'Bank sync',
    budgero: 'No (by design)',
    everydollar: 'Premium only',
    budgeroNote: 'Privacy-first approach',
    everydollarNote: 'US banks only',
  },
  {
    feature: 'Multi-currency',
    budgero: '168 currencies',
    everydollar: 'No',
    budgeroNote: 'Live FX rates',
    everydollarNote: 'USD only',
  },
  {
    feature: 'Works offline',
    budgero: true,
    everydollar: false,
    budgeroNote: null,
    everydollarNote: 'Limited offline support',
  },
  {
    feature: 'Shared budgets',
    budgero: '5 seats',
    everydollar: 'Per user',
    budgeroNote: 'Included in plan',
    everydollarNote: 'Each user needs own subscription',
  },
  {
    feature: 'Self-host option',
    budgero: true,
    everydollar: false,
    budgeroNote: 'Free forever',
    everydollarNote: null,
  },
  {
    feature: 'Works worldwide',
    budgero: true,
    everydollar: false,
    budgeroNote: null,
    everydollarNote: 'US only',
  },
  {
    feature: 'YNAB/CSV import',
    budgero: true,
    everydollar: false,
    budgeroNote: null,
    everydollarNote: null,
  },
  {
    feature: 'Debt tracking',
    budgero: true,
    everydollar: true,
    budgeroNote: null,
    everydollarNote: null,
  },
  {
    feature: 'AI features',
    budgero: 'Local LLM',
    everydollar: 'No',
    budgeroNote: 'Data stays on your device',
    everydollarNote: null,
  },
];

const faqs = [
  {
    q: 'Can I keep following the Baby Steps with Budgero?',
    a: "Yes — the Ramsey method is app-agnostic. Budgero is zero-based budgeting, the same engine EveryDollar runs on: give every dollar a job, fund your emergency starter fund, attack debts smallest-first with the debt snowball (Budgero's debt tracking handles payoff ordering), then build the full emergency fund as a sinking-fund envelope. You lose the Ramsey branding and FPU integration, not the method.",
  },
  {
    q: 'Is there a free version like EveryDollar\u2019s free tier?',
    a: "EveryDollar's free tier is manual-entry with the basics; the $79.99/yr premium adds bank sync and extras. Budgero's equivalent: a 35-day free Cloud trial, and Budgero Self-Host — free forever with every feature, if you're willing to run it on your own server with Docker.",
  },
  {
    q: 'How does the debt snowball work in Budgero?',
    a: 'Budgero tracks each debt account with its balance and payoff progress. Order them smallest to largest, give your snowball payment envelope a fixed amount each month, and roll the freed-up minimum into the next debt when one closes. The mechanics are manual where EveryDollar automates the Ramsey ordering — the trade-off is flexibility if you ever want avalanche ordering instead.',
  },
  {
    q: 'Does EveryDollar work outside the US?',
    a: 'Not meaningfully. EveryDollar is USD-only with US bank sync, and the Ramsey content assumes US financial products. If you live elsewhere or budget in multiple currencies, Budgero gives you the same zero-based method with 168 currencies and no geographic assumptions.',
  },
  {
    q: 'How do I switch from EveryDollar to Budgero?',
    a: 'Export your transactions from EveryDollar as CSV (premium feature), or simply start fresh — many EveryDollar users carry over only category names and current balances, which takes about 20 minutes. Set up your envelopes to mirror your EveryDollar budget, enter starting balances, and continue your Baby Step wherever you left off.',
  },
];

export default async function EveryDollarAlternativePage(
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
  const t = await getTranslations('everydollar_alternative');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/everydollar-alternative',
        description:
          'EveryDollar alternative with zero-knowledge encryption, multi-currency support, offline mode, and no philosophy lock-in.',
        offers: {
          '@type': 'Offer',
          price: pricing.yearly.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'Zero-based budgeting',
          'Zero-knowledge encryption',
          'Multi-currency with live exchange rates',
          'Debt payoff tracking',
          'Offline support',
          'Integrates with locally-hosted LLMs',
          'Works worldwide',
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
            name: 'EveryDollar Alternative',
            item: 'https://budgero.app/everydollar-alternative',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-amber-500/30 text-amber-700 bg-amber-500/10"
                >
                  <Shield className="w-3.5 h-3.5 mr-2" /> {t('privacy_first_budgeting')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('everydollar_alternative')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('zero_based_budgeting_without_the_ramsey')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('everydollar_is_a_solid_zero_based')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=everydollar-alternative&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison"> {t('compare_features')} </a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('no_credit_card_required_zero_knowledge')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Key Differences Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_switch_from_everydollar')} </h2>
                <p className="text-lg text-foreground/70"> {t('same_zero_based_budgeting_approach_none')} </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('zero_knowledge_encryption')} </h3>
                  <p className="text-foreground/70"> {t('everydollar_stores_your_data_on_ramsey')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('168_currencies')} </h3>
                  <p className="text-foreground/70"> {t('everydollar_is_us_only_budgero_handles')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('no_philosophy_lock_in')} </h3>
                  <p className="text-foreground/70"> {t('budgero_uses_zero_based_budgeting_without')} </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg"> {t('5_seats_included')} </h3>
                  <p className="text-foreground/70"> {t('share_your_budget_with_up_to')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_everydollar')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_comparison')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground"> {t('everydollar')} </th>
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
                          {typeof row.everydollar === 'boolean' ? (
                            <div className="flex flex-col items-center gap-1">
                              {row.everydollar ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-foreground/35" />
                              )}
                              {row.everydollarNote && (
                                <span className="text-xs text-foreground/55">{row.everydollarNote}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm text-foreground/65">
                                {row.everydollar}
                              </span>
                              {row.everydollarNote && (
                                <span className="text-xs text-foreground/55">{row.everydollarNote}</span>
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

            {/* Where EveryDollar Wins */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('where_everydollar_wins')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('everydollar_has_genuine_strengths_here_s')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('simple_clean_interface_focused_on_one')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('tight_integration_with_ramsey_s_financial')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('bank_sync_in_premium_tier_us')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('large_community_of_ramsey_followers')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('free_tier_available_with_no_time')}</span>
                  </li>
                </ul>
                <p className="mt-6 text-foreground/70 italic"> {t('if_you_follow_the_ramsey_method')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Baby Steps compatibility */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('keep_the_baby_steps_upgrade_the')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('most_people_searching_for_an_everydollar')} </p>
                <p> {t('what_changes_when_you_switch_your')}{' '}
                  <a
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('multiple_currencies')} </a>{' '} {t('if_your_life_needs_that_what')}{' '}
                  <a href="/self-hostable" className="underline hover:text-foreground"> {t('budgero_self_host')} </a>{' '} {t('is_free_forever_if_you_ll')} </p>
                <p> {t('debt_payoff_specifically')}{' '}
                  <a href="/docs/debt-tracking" className="underline hover:text-foreground"> {t('budgero_s_debt_tracking')} </a>{' '} {t('handles_balances_and_payoff_progress_and')} </p>
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
                      <span>{t('you_live_outside_the_us')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_budget_in_multiple_currencies')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_want_5_seats_included_in')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('you_don_t_follow_the_ramsey')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('you_want_a')}{' '}
                        <a href="/self-hostable" className="underline"> {t('self_host_option')} </a>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('stick_with_everydollar_if')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_follow_the_ramsey_baby_steps')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_need_us_bank_sync')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_want_a_free_basic_tier')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('you_prefer_the_ramsey_ecosystem')}</span>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_to_try_a_zero_based')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('35_day_free_trial_no_credit')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=everydollar-alternative&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_all_features_for_free')}{' '}
                  <a
                    href="/self-hostable"
                    className="underline hover:text-foreground"
                  > {t('self_host_budgero')} </a>{' '} {t('with_full_sync_multi_currency_and')} </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('comparing_more_apps_see_the')}{' '}
                  <a
                    href="/best-ynab-alternatives"
                    className="underline hover:text-foreground"
                  > {t('best_ynab_alternatives')} </a>{' '} {t('for_2026')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
