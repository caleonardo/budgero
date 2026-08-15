import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Download, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Budgero vs YNAB — The Free YNAB Alternative (2026)',
  description: `Budgero vs YNAB, compared feature by feature. The free YNAB alternative: self-host at no cost, or Cloud from ${pricing.monthly}/mo — a third of YNAB's price, tax included. Import your YNAB budget in 5 minutes.`,
  keywords: [
    'free ynab alternative',
    'ynab free alternative',
    'ynab alternative free',
    'budgero vs ynab',
    'ynab vs budgero',
    'free alternative to ynab',
    'ynab free version',
    'apps like ynab but free',
    'switch from ynab',
    'ynab import',
    'ynab replacement',
    'ynab alternative encrypted',
  ],
  alternates: { canonical: 'https://budgero.app/vs-ynab' },
  openGraph: {
    title: 'Budgero vs YNAB — The Free YNAB Alternative (2026)',
    description:
      "Free to self-host, or Cloud at half YNAB's price. Zero-based budgeting in 168 currencies with end-to-end encryption. Import your YNAB budget in 5 minutes.",
    url: 'https://budgero.app/vs-ynab',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budgero vs YNAB — The Free YNAB Alternative (2026)',
    description:
      "Free to self-host, or Cloud at half YNAB's price. Zero-based budgeting in 168 currencies, end-to-end encrypted.",
  },
};

const comparisonData = [
  { feature: 'Monthly price', cloud: `${pricing.monthly}/mo (${pricing.yearly}/yr)`, selfHost: 'Free forever', ynab: '$14.99/mo ($109/yr)' },
  { feature: 'Free trial', cloud: '35 days, no credit card', selfHost: 'N/A — always free', ynab: '34 days' },
  { feature: 'Zero-based budgeting', cloud: true, selfHost: true, ynab: true },
  { feature: 'End-to-end encryption', cloud: 'AES-256-GCM, zero-knowledge', selfHost: 'Local encryption', ynab: false, ynabNote: 'Data stored in plaintext' },
  { feature: 'Offline mode', cloud: true, selfHost: true, ynab: false },
  { feature: 'Multi-currency support', cloud: '168 currencies', selfHost: '168 currencies', ynab: false, ynabNote: 'Manual workarounds only' },
  { feature: 'Bank sync', cloud: false, selfHost: false, ynab: true, cloudNote: 'Manual entry by design', ynabNote: 'US/Canada/EU via Plaid' },
  { feature: 'YNAB data import', cloud: true, selfHost: true, ynab: 'N/A' },
  { feature: 'Self-hosting option', cloud: false, selfHost: true, ynab: false, cloudNote: 'Use Self-Host edition' },
  { feature: 'Works if you cancel', cloud: 'Export anytime', selfHost: 'Your data, your server', ynab: false, ynabNote: 'Lose access to budgets' },
  { feature: 'Mobile app', cloud: 'PWA', selfHost: 'PWA', ynab: 'Native iOS & Android' },
  { feature: 'Shared budgets', cloud: true, selfHost: 'Via shared server', ynab: true, cloudNote: 'Encrypted shared workspaces', ynabNote: 'Up to 5 users' },
  { feature: 'AI categorization', cloud: true, selfHost: true, ynab: false, cloudNote: 'Local LLM, optional' },
  { feature: 'Receipt scanning', cloud: true, selfHost: true, ynab: false, cloudNote: 'AI-powered, privacy-first' },
  { feature: 'Reports & analytics', cloud: 'Modern dashboards', selfHost: 'Modern dashboards', ynab: 'Basic reports' },
  { feature: 'API access', cloud: true, selfHost: true, ynab: false, cloudNote: 'Push API' },
];

const faqs = [
  {
    q: 'Does Budgero work outside the US?',
    a: "Yes — that's a core reason people switch. Budgero works in every country, supports 168 currencies natively (with automatic conversion to your home currency), and the app, billing, and onboarding are all built to work without US-centric assumptions. Budgero is especially popular with users in Europe, the UK, Australia, and across Asia where YNAB's bank sync and pricing don't fit.",
  },
  {
    q: 'How is Budgero different from YNAB on multi-currency?',
    a: `YNAB treats each account as a single currency and has no native way to show a unified home-currency total across accounts in different currencies. Budgero is multi-currency from the ground up: hold accounts in EUR, USD, GBP, JPY, and 164 other currencies simultaneously, with live exchange rates and a consolidated dashboard in your home currency. It is the feature most European and expat users cite as the reason they left YNAB.`,
  },
  {
    q: 'Is there a free version of Budgero?',
    a: `Yes — Budgero Self-Host is completely free. You run it on your own server with Docker. No trial period, no feature gating. Budgero Cloud is the same app fully managed (we handle hosting, updates, and backups) for ${pricing.monthly}/month or ${pricing.yearly}/year. Both editions include the full feature set.`,
  },
  {
    q: 'Does Budgero offer discounts like YNAB student pricing?',
    a: `No — Budgero keeps pricing simple instead. Cloud costs ${pricing.monthly}/month or ${pricing.yearly}/year, tax included, for everyone, everywhere — roughly a third of YNAB's price without any discount program. And Self-Host is entirely free.`,
  },
  {
    q: 'Can I import my YNAB budget into Budgero?',
    a: 'Yes. Budgero imports YNAB export files and automatically maps your transactions, categories, groups, and accounts. The process takes about 5 minutes and preserves your full history.',
  },
  {
    q: 'Does Budgero connect to my bank?',
    a: "No, and that's intentional. Bank sync requires sharing your credentials with third-party aggregators like Plaid. Budgero is manual-first: you enter transactions yourself (or scan receipts), which means your bank credentials never leave your control.",
  },
  {
    q: 'How does Budgero keep my data private?',
    a: "Budgero uses end-to-end encryption (AES-256-GCM with PBKDF2-HMAC-SHA256 key derivation at 600,000 iterations). Your data is encrypted on your device before it's sent to our servers. We literally cannot read your budget. Even if someone breached our servers, they'd get encrypted gibberish.",
  },
  {
    q: 'Does Budgero work offline?',
    a: "Yes. Budgero is built as a Progressive Web App with full offline support. You can add transactions, review your budget, and make changes without an internet connection. Everything syncs automatically when you're back online.",
  },
  {
    q: 'Can I budget in multiple currencies?',
    a: 'Yes. Budgero supports 168 currencies with automatic exchange rates and a unified dashboard in your home currency. This is one of the most common reasons international users switch from YNAB.',
  },
  {
    q: 'What happens if I cancel Budgero Cloud?',
    a: 'Your data is yours. You can export it anytime. If you cancel Cloud, you can also switch to the free Self-Host edition and keep budgeting without interruption. Unlike YNAB, canceling does not mean losing access to your data.',
  },
];

function renderCellValue(val: unknown, note?: string, isHighlight?: boolean) {
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
      <span className={`text-sm ${isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}>
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

export default async function VsYnabPage(
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
  const t = await getTranslations('vs_ynab');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/vs-ynab',
        description:
          'The free YNAB alternative — zero-based budgeting in 168 currencies with end-to-end encryption and offline mode. Free self-host edition, Cloud at half YNAB\u2019s price.',
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
          'Zero-based budgeting',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Multi-currency (168 currencies)',
          'Offline support',
          'YNAB import',
          'Self-host option',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://budgero.app/' },
          { '@type': 'ListItem', position: 2, name: 'Budgero vs YNAB', item: 'https://budgero.app/vs-ynab' },
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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> {t('35_day_free_trial_no_card')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('budgero_vs_ynab_the_free_ynab')} </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('everything_ynab_does_well_free_if')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('see_how_budgero_compares')}</a>
                  </Button>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why People Switch */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_european_international_ynab_users_are')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('ynab_pioneered_zero_based_budgeting_and')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground"> {t('no_native_multi_currency_support')} </strong>{' '} {t('ynab_has_no_concept_of_currencies')} </p>
                  <p>
                    <strong className="text-foreground">{t('bank_sync_is_us_first')}</strong> {t('ynab_s_bank_sync_works_well')} </p>
                  <p>
                    <strong className="text-foreground">{t('price_keeps_climbing')}</strong> {t('ynab_costs_14_99_month_or')} </p>
                  <p>
                    <strong className="text-foreground">{t('privacy_concerns')}</strong> {t('ynab_stores_your_budget_data_on')} </p>
                  <p>
                    <strong className="text-foreground">{t('no_offline_mode')}</strong> {t('ynab_is_a_web_first_app')} </p>
                  <p>
                    <strong className="text-foreground">{t('vendor_lock_in')}</strong> {t('cancel_your_ynab_subscription_and_you')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_ynab_feature_by_feature')} </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero_cloud')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero_self_host')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        YNAB
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
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.cloud, row.cloudNote, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.selfHost, undefined, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.ynab, row.ynabNote, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-foreground/60 text-sm max-w-3xl">
                <strong className="text-foreground">{t('key_takeaway')}</strong> {t('budgero_cloud_gives_you_everything_ynab')} </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_168_currencies_import_your')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Migration Walkthrough */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                  <Import className="w-3.5 h-3.5 mr-2" /> {t('seamless_migration')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_to_switch_from_ynab_to')} </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto"> {t('switching_does_not_mean_starting_over')} </p>
              </div>

              <div className="space-y-6 max-w-3xl mx-auto">
                {[
                  {
                    step: '1',
                    title: 'Export Your YNAB Data',
                    text: 'Open YNAB, go to your budget settings, and click "Export Budget." YNAB will download a ZIP file containing your transactions, budget amounts, and account info.',
                    tip: 'Export before your subscription ends. Once your YNAB subscription lapses, you lose access to the export feature.',
                  },
                  {
                    step: '2',
                    title: 'Create Your Budgero Account',
                    text: 'Head to my.budgero.app and sign up for a free Cloud trial. No credit card required. You get 35 days to explore everything.',
                  },
                  {
                    step: '3',
                    title: 'Import Your YNAB File',
                    text: 'In Budgero, open Settings and click "Import." Drop in your YNAB export file. Budgero automatically maps your categories, groups, and accounts. You will see a preview of everything before confirming.',
                  },
                  {
                    step: '4',
                    title: 'Review and Adjust',
                    text: 'Take a few minutes to review your imported data. Budgero preserves your category structure, but you might want to tweak a few names or merge groups. Your full transaction history is there, ready to go.',
                  },
                  {
                    step: '5',
                    title: 'Start Budgeting',
                    text: 'That is it. Your entire YNAB workflow, categories, balances, transaction history, is now in Budgero with end-to-end encryption.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-lg font-bold text-foreground">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">{item.title}</h3>
                      <p className="text-foreground/70">{item.text}</p>
                      {item.tip && (
                        <p className="mt-2 text-sm text-foreground/55 italic">{t('tip')} {item.tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-foreground/60"> {t('the_whole_process_takes_about_5')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Makes Budgero Different */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10"> {t('what_you_get_with_budgero_that')} </h2>

              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('true_zero_knowledge_privacy')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_encrypts_your_financial_data_on')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('works_everywhere_in_every_currency')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('ynab_was_built_for_the_us')}{' '}
                    <Link href="/multi-currency-budgeting" className="underline hover:text-foreground"> {t('168_currencies')} </Link>{' '} {t('with_automatic_conversion_rates_and_a')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('offline_first_architecture')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_s_progressive_web_app_works')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('ai_that_respects_your_privacy')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('budgero_integrates_with_local_llms_to')} </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3"> {t('you_own_your_data_period')} </h3>
                  <p className="text-lg text-foreground/75 leading-relaxed"> {t('cancel_budgero_cloud_and_your_data')}{' '}
                    <Link href="/self-hostable" className="underline hover:text-foreground"> {t('budgero_self_host')} </Link>{' '} {t('on_your_own_server_with_docker')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('is_budgero_the_right_ynab_alternative')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('budgero_is_a_great_fit_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_zero_based_budgeting_without_paying')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('care_about_financial_data_privacy_and')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('live_outside_the_us_canada_eu')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('budget_in_multiple_currencies_regularly')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('prefer_manual_transaction_entry_that_keeps')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_an_app_that_works_offline')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('have_years_of_ynab_data_you')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('budgero_might_not_be_the_right')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_automatic_bank_sync_and_will')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('want_native_ios_android_apps_budgero')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('are_happy_with_ynab_s_pricing')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_investment_tracking_in_the_same')}{' '}
                        <Link
                          href="/monarch-money-alternative"
                          className="underline hover:text-foreground"
                        > {t('monarch_money')} </Link>{' '} {t('for_that')} </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55"> {t('we_would_rather_be_honest_about')} </p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('ready_for_a_ynab_alternative_that')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_free_trial')} </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=vs-ynab&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60"> {t('prefer_to_self_host')}{' '}
                  <Link href="/self-hosted-ynab-alternative" className="underline hover:text-foreground"> {t('run_budgero_on_your_own_server')} </Link>
                </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('based_in_europe_see_the')}{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground"> {t('ynab_alternative_for_europe')} </Link>.
                                  </p>
                <p className="mt-3 text-sm text-foreground/60"> {t('comparing_more_apps_see_the')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('best_ynab_alternatives_in_2026')} </Link>.
                                  </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
