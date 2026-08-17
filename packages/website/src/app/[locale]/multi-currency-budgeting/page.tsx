import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import {
  ArrowRight,
  Globe,
  TrendingUp,
  Wallet,
  Briefcase,
  Plane,
  Users,
  X,
} from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'multi_currency_budgeting' });
  return withLocalizedUrls(locale, '/multi-currency-budgeting', {
  title: t('meta_title'),
  description: t('meta_description'),
  keywords: [
    'multi currency budgeting',
    'budgeting app multiple currencies',
    'budgeting for expats',
    'budgeting app for digital nomads',
    'multi currency budget app',
    'expense tracker multiple currencies',
    'budget app multiple currencies',
    'international budgeting app',
  ],
  alternates: { canonical: 'https://budgero.app/multi-currency-budgeting' },
  openGraph: {
    title: t('meta_title'),
    description: t('og_description'),
    url: 'https://budgero.app/multi-currency-budgeting',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta_title'),
    description: t('tw_description'),
  },
});
}

const makeFeatures = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    icon: Globe,
    title: t('features_any_currency_one_budget'),
    description:
      t('features_create_accounts_in_usd_eur_gbp'),
  },
  {
    icon: TrendingUp,
    title: t('features_live_exchange_rates'),
    description:
      t('features_budgero_fetches_live_fx_rates_automatically'),
  },
  {
    icon: Wallet,
    title: t('features_budget_in_your_base_currency'),
    description:
      t('features_set_your_preferred_currency_for_budgeting'),
  },
];

const makePersonas = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    icon: Plane,
    title: 'Expats',
    description:
      t('personas_you_earn_in_one_country_and'),
  },
  {
    icon: Globe,
    title: t('personas_digital_nomads'),
    description:
      t('personas_different_country_every_few_months_means'),
  },
  {
    icon: Briefcase,
    title: 'Freelancers',
    description:
      t('personas_you_invoice_in_usd_but_live'),
  },
  {
    icon: Users,
    title: t('personas_multi_country_households'),
    description:
      t('personas_partner_in_one_country_you_in'),
  },
];

export default async function MultiCurrencyBudgetingPage(
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
  const t = await getTranslations('multi_currency_budgeting');
  const personas = makePersonas(t);
  const features = makeFeatures(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    image: 'https://budgero.app/logo_512.png',
    name: 'Budgero',
    applicationCategory: 'FinanceApplication',
    operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
    url: 'https://budgero.app/multi-currency-budgeting',
    description:
      'Multi-currency budgeting app with 100+ currencies, live FX rates, and zero-knowledge encryption.',
    offers: {
      '@type': 'Offer',
      price: pricing.yearly.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      '100+ currencies with live exchange rates',
      'Zero-knowledge encryption',
      'Zero-based budgeting',
      'Multi-currency reporting',
      '5 seats per subscription',
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10"
                >
                  <Globe className="w-3.5 h-3.5 mr-2" /> {t('100_currencies')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('one_budget_every_currency')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('multi_currency_budgeting_built_for_real')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('most_multi_currency_budgeting_apps_assume')} </p>

                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=multi-currency-budgeting&utm_content=hero"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>

                <p className="mt-4 text-sm text-foreground/60"> {t('35_days_free_no_credit_card')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* The Problem */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{t('the_problem')}</h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('you_earn_in_eur_but_pay')} </p>
                <p> {t('most_budgeting_apps_force_one_currency')} </p>
                <p> {t('you_end_up_not_budgeting_at')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How Budgero Handles It */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_budgero_handles_it')} </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-[#314258]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{feature.title}</h3>
                    <p className="text-foreground/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('built_for_multi_currency_lives')} </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {personas.map((persona) => (
                  <div
                    key={persona.title}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center mb-4">
                      <persona.icon className="w-5 h-5 text-[#3f4756]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{persona.title}</h3>
                    <p className="text-sm text-foreground/70">{persona.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Other Apps Do Wrong */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('what_other_apps_get_wrong')} </h2>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">YNAB:</strong> {t('one_currency_per_budget_no_conversion')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('monarch_money')}</strong> {t('us_and_canada_only_shows_all')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('lunch_money')}</strong> {t('has_multi_currency_but_uses_a')} </span>
                  </li>
                </ul>
                <p className="mt-6 text-sm text-foreground/55"> {t('most_budgeting_apps_were_built_for')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('start_budgeting_in_every_currency_you')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('35_day_free_trial_no_credit')} </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=multi-currency-budgeting&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60">Or{' '}
                  <a href="/self-hostable" className="underline hover:text-foreground"> {t('self_host_for_free')} </a>{' '} {t('with_full_multi_currency_support')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
