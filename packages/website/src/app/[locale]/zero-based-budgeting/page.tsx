import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'What is Zero-Based Budgeting? A Complete Guide | Budgero',
  description:
    'Learn how zero-based budgeting works, why it is effective, and how to start. Give every dollar a job and take control of your finances.',
  keywords: [
    'zero based budgeting',
    'what is zero based budgeting',
    'envelope budgeting method',
    'give every dollar a job',
    'zero based budget',
    'how to zero based budget',
    'budgeting method',
    'envelope budgeting',
  ],
  alternates: { canonical: 'https://budgero.app/zero-based-budgeting' },
  openGraph: {
    title: 'What is Zero-Based Budgeting? A Complete Guide | Budgero',
    description:
      'Learn how zero-based budgeting works, why it is effective, and how to start.',
    url: 'https://budgero.app/zero-based-budgeting',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is Zero-Based Budgeting? A Complete Guide | Budgero',
    description: 'Give every dollar a job. A practical guide to zero-based budgeting.',
  },
};

const steps = [
  {
    number: '1',
    title: 'Calculate Your Income',
    description:
      'Start with what you will earn this month. Salary, freelance income, side gigs. Everything that is coming in.',
  },
  {
    number: '2',
    title: 'List Your Expenses',
    description:
      'Fixed costs (rent, utilities, insurance), variable costs (groceries, dining, transport), and savings goals. Everything that needs money.',
  },
  {
    number: '3',
    title: 'Assign Every Dollar',
    description:
      'Distribute your income across categories until you reach zero. If you have $200 left, put it toward savings or debt. If you are over, cut something.',
  },
  {
    number: '4',
    title: 'Track and Adjust',
    description:
      'As the month progresses, track actual spending against your plan. Move money between categories when priorities shift. This is normal and expected.',
  },
];

const methods = [
  {
    name: 'Zero-Based (Envelope)',
    description:
      'Every dollar assigned to a category. Proactive. You decide before spending.',
    bestFor: 'People who want full control over every dollar.',
  },
  {
    name: '50/30/20 Rule',
    description:
      '50% needs, 30% wants, 20% savings. Simple percentages, no detailed tracking.',
    bestFor: 'People who want a rough framework without tracking every transaction.',
  },
  {
    name: 'Pay Yourself First',
    description:
      'Save a fixed amount first, spend the rest freely. No category tracking needed.',
    bestFor: 'High earners who want to prioritize savings without detailed budgeting.',
  },
];

export default async function ZeroBasedBudgetingPage(
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
  const t = await getTranslations('zero_based_budgeting');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What is Zero-Based Budgeting? A Complete Guide',
    author: { '@type': 'Organization', name: 'Budgero' },
    datePublished: '2026-04-11',
    description:
      'Learn how zero-based budgeting works, why it is effective, and how to get started.',
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
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-border/50">
                  <BookOpen className="w-3.5 h-3.5 mr-2" /> {t('budgeting_guide')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('what_is_zero_based_budgeting')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('give_every_dollar_a_job')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('zero_based_budgeting_is_a_method')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How It Works */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_it_works')} </h2>
                <p className="text-lg text-foreground/70">{t('four_steps_repeated_every_month')}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <span className="text-lg font-bold text-foreground">{step.number}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{step.title}</h3>
                    <p className="text-foreground/70">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why It Works */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{t('why_it_works')}</h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('zero_based_budgeting_forces_intentional_decision')} </p>
                <p> {t('the_method_works_because_it_eliminates')} </p>
                <p> {t('it_also_surfaces_trade_offs_when')} </p>
                <p> {t('people_who_use_zero_based_budgeting')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison with Other Methods */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('zero_based_vs_other_methods')} </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {methods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <h3 className="font-semibold text-foreground mb-3 text-lg">{method.name}</h3>
                    <p className="text-foreground/70 mb-4 text-sm">{method.description}</p>
                    <p className="text-xs text-foreground/55">
                      <strong className="text-foreground/70">{t('best_for')}</strong> {method.bestFor}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-foreground/60"> {t('zero_based_budgeting_requires_the_most')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Getting Started */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('getting_started')} </h2>
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-foreground min-w-[24px]">1.</span>
                    <span> {t('start_with_last_month_s_bank')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-foreground min-w-[24px]">2.</span>
                    <span> {t('do_not_try_to_be_perfect')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-foreground min-w-[24px]">3.</span>
                    <span> {t('budget_for_irregular_expenses_car_maintenance')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-foreground min-w-[24px]">4.</span>
                    <span> {t('review_your_budget_weekly_for_the')} </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Soft Budgero Mention */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border/70">
                <p className="text-foreground/75 mb-6"> {t('if_you_want_a_zero_based')} {pricing.yearly}{t('yr_budgero_might_be_a_good')} </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=zero-based-budgeting&utm_content=final"> {t('try_budgero_free')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <p className="mt-4 text-sm text-foreground/55"> {t('35_day_trial_no_credit_card')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
