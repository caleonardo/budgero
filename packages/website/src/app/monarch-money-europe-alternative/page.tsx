import { ComparisonReferences } from '@/components/comparison-references';
import { MultiCurrencyExample } from '@/components/multi-currency-example';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Globe, Shield, Euro, DollarSign, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Monarch Money Alternative for Europe — Multi-Currency Budgeting | Budgero',
  description:
    'Monarch Money is US and Canada only. Budgero is the Monarch alternative for Europe — multi-currency, end-to-end encrypted, and built for EUR, GBP, CHF, and 165 more. 35-day free trial.',
  keywords: [
    'monarch money europe',
    'monarch money europe alternative',
    'monarch money uk',
    'monarch money eu',
    'monarch alternative europe',
    'monarch alternative uk',
    'monarch money germany',
    'monarch money netherlands',
    'european budgeting app',
    'monarch money international',
    'monarch money outside us',
    'budgeting app europe monarch',
    'monarch money multi currency',
  ],
  alternates: { canonical: 'https://budgero.app/monarch-money-europe-alternative' },
  openGraph: {
    title: 'Monarch Money Alternative for Europe — Multi-Currency Budgeting | Budgero',
    description:
      'Monarch Money is US and Canada only. Budgero is the Monarch alternative for Europe — multi-currency, encrypted, and built for EUR, GBP, CHF, and more.',
    url: 'https://budgero.app/monarch-money-europe-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monarch Money Alternative for Europe — Multi-Currency Budgeting | Budgero',
    description:
      'Monarch is US/Canada only. Budgero works across Europe with 168 currencies and zero-knowledge encryption.',
  },
};

const comparisonData = [
  {
    feature: 'Official availability in Europe',
    budgero: true,
    monarch: false,
    budgeroNote: 'Browser app; no bank connection required',
    monarchNote: 'US and Canada only',
  },
  {
    feature: 'Currencies in one budget',
    budgero: '168 currencies',
    monarch: 'USD or CAD display',
    budgeroNote: 'Original amounts plus conversion',
    monarchNote: 'No native currency conversion',
  },
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    monarch: '$99.99/year',
    budgeroNote: 'Or free with self-hosting; hosting costs may apply',
    monarchNote: 'Check current plan and offers',
  },
  {
    feature: 'Zero-knowledge budget encryption',
    budgero: true,
    monarch: false,
    budgeroNote: 'Encrypted before syncing',
    monarchNote: 'Server-managed encryption',
  },
  {
    feature: 'European bank transactions',
    budgero: 'Manual or file import',
    monarch: 'No European bank sync',
    budgeroNote: 'Preview your bank’s supported export',
    monarchNote: 'Official coverage is US/Canada',
  },
  {
    feature: 'Investment tracking',
    budgero: 'Manual asset values',
    monarch: 'Brokerage connections',
    budgeroNote: 'No automatic security prices or brokerage sync',
    monarchNote: 'Check your supported institution',
  },
  {
    feature: 'Self-host option',
    budgero: true,
    monarch: false,
    budgeroNote: 'Docker; choose your hosting location',
    monarchNote: null,
  },
];

const faqs = [
  {
    q: 'Is Monarch Money available in Europe?',
    a: 'Monarch’s official FAQ lists the US and Canada as its supported countries. Its currency documentation describes dollar display without conversion between currencies, so a European household needing EUR and GBP accounts in one budget should consider another option.',
  },
  {
    q: 'Is Budgero a suitable Monarch Money alternative for Europe?',
    a: 'Budgero can suit households that need multiple currencies and end-to-end encrypted budgeting. It does not offer automatic bank or brokerage sync. If bank feeds are essential, check an alternative with documented support for your specific European institutions.',
  },
  {
    q: 'Can I hold EUR and GBP accounts in Budgero?',
    a: 'Yes. Choose a budget currency and set each account’s currency separately. Transactions retain their original amounts and use exchange rates for budget totals. You can override a transaction’s rate or converted amount when a statement uses a different rate.',
  },
  {
    q: 'Does Budgero connect to European banks?',
    a: 'No automatic bank connection is available. Use manual entry or import a supported file such as CSV, OFX, or CAMT.053. Preview date and number formats and reconcile balances; do not assume every bank’s export needs no adjustments.',
  },
  {
    q: 'How does Budgero protect my budget?',
    a: 'Budget contents are encrypted on your device before they sync. Cloud hosts encrypted budget data in Finland; self-hosting lets you choose your server location. Account and billing data are handled separately under the privacy policy.',
  },
  {
    q: 'Does Budgero track investments like Monarch?',
    a: 'Budgero lets you record asset values manually. It does not replace Monarch’s automatic brokerage connections or security-level investment tools. Decide whether a manually updated net-worth view meets your needs.',
  },
  {
    q: 'How much does Budgero cost in Europe?',
    a: `Cloud is listed at ${pricing.monthly}/month or ${pricing.yearly}/year in USD, tax included. Check the checkout total and your payment provider’s conversion terms. Self-hosting has no software subscription fee; hosting costs are separate.`,
  },
  {
    q: 'Can I import my Monarch Money transactions?',
    a: 'You can map a Monarch transaction CSV in Budgero’s file importer. Create or select the destination accounts, check dates and amounts in the preview, then reconcile each account. CSV transaction import does not recreate every budget setting, target, or account balance history. Avoid importing overlapping date ranges because file imports do not automatically deduplicate existing transactions.',
  },
];

function renderCellValue(val: unknown, note?: string | null, isHighlight?: boolean) {
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
      <span
        className={`text-sm ${isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}
      >
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

const MONARCH_YEARLY_USD = 99.99;

export default function MonarchMoneyEuropeAlternativePage() {
  const budgeroYearly = parseFloat(pricing.yearly.replace(/[^0-9.]/g, ''));
  const yearlySavings = Math.max(0, Math.round(MONARCH_YEARLY_USD - budgeroYearly));
  const percentCheaper = Math.max(
    0,
    Math.round(((MONARCH_YEARLY_USD - budgeroYearly) / MONARCH_YEARLY_USD) * 100)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/monarch-money-europe-alternative',
        description:
          'Monarch Money alternative for Europe — multi-currency budgeting in EUR, GBP, CHF, PLN and 168 currencies, with zero-knowledge budget encryption.',
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
            name: 'Budgero Cloud (monthly)',
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Budgero Cloud (yearly)',
            price: pricing.yearly.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ],
        featureList: [
          'Available across Europe',
          'Multi-currency (168 currencies) with live FX',
          'zero-knowledge budget encryption',
          'VAT-compliant billing in local currency',
          'Offline support',
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
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Monarch Money Alternative for Europe',
            item: 'https://budgero.app/monarch-money-europe-alternative',
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
            <section className="pt-24 pb-16 md:pt-32 md:pb-24 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-red-500/30 text-red-700 dark:text-red-400 bg-red-500/10"
                >
                  <Ban className="w-3.5 h-3.5 mr-2" />
                  Monarch Money isn&apos;t available in Europe
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  The Monarch Money Alternative for Europe
                  <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium">
                    Manage EUR, GBP, and CHF accounts in one budget.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Monarch officially supports the US and Canada and does not convert currencies
                  within a budget. Budgero supports 168 currencies with end-to-end encrypted budget
                  sync. Bring transactions through file import or manual entry; Budgero does not
                  offer automatic bank connections.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=hero">
                      Start 35-Day Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#why-not-monarch">Why Monarch doesn&apos;t work in Europe</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  35 days free, no card needed. Works in every European country, in your currency.
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <section id="why-not-monarch" className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Monarch’s Europe and currency limits mean
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  Monarch’s{' '}
                  <a
                    href="https://help.monarch.com/hc/en-us/articles/19985735202068-FAQs-about-Monarch"
                    className="underline hover:text-foreground"
                  >
                    official FAQ
                  </a>{' '}
                  lists availability in the US and Canada. That limits the usefulness of its
                  bank-connected workflow for a household banking in Europe.
                </p>
                <p>
                  Its{' '}
                  <a
                    href="https://help.monarch.com/hc/en-us/articles/360048393552-International-Accounts-and-Currency"
                    className="underline hover:text-foreground"
                  >
                    currency documentation
                  </a>{' '}
                  explains that it displays dollar amounts without differentiating or converting
                  currencies. A £50 transaction and a €50 transaction cannot simply be combined into
                  a meaningful total without conversion.
                </p>
                <p>
                  Budgero records an original account amount and a converted budget amount. This
                  supports a household using EUR and GBP together, but it comes with a different
                  import workflow: you bring a statement file or enter transactions yourself.
                </p>
              </div>
            </section>

            <MultiCurrencyExample />

            {/* Key Advantages */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Why European Households Choose Budgero
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dfe4ec] flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#314258]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    Actually Works in Europe
                  </h3>
                  <p className="text-foreground/70">
                    Plan in EUR, GBP, CHF, and other supported currencies. Enter transactions
                    manually or preview a supported bank export before importing it.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#dde9df] flex items-center justify-center mb-4">
                    <Euro className="w-6 h-6 text-[#2f6246]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    Tax-Inclusive Cloud Pricing
                  </h3>
                  <p className="text-foreground/70">
                    Cloud prices are listed in USD with tax included. Check your checkout total and
                    payment provider’s conversion terms for your local cost.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#e4dff0] flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#564176]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    Encrypted Budget Contents
                  </h3>
                  <p className="text-foreground/70">
                    Zero-knowledge encryption means we cannot see your data. Even a server breach
                    yields encrypted blobs, not your financial history.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/70">
                  <div className="w-12 h-12 rounded-full bg-[#efe4d8] flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-[#8a5730]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {percentCheaper}% Cheaper
                  </h3>
                  <p className="text-foreground/70">
                    Monarch costs $99.99/year. Budgero Cloud is {pricing.yearly}/year — save ~$
                    {yearlySavings}/year. Or{' '}
                    <Link href="/self-hostable" className="underline hover:text-foreground">
                      self-host
                    </Link>{' '}
                    on your own EU server for free.
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Budgero vs. Monarch Money — The European View
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                        Feature
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        Budgero
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        Monarch Money
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
                          {renderCellValue(row.budgero, row.budgeroNote, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.monarch, row.monarchNote, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=mid-table">
                    Start 35-Day Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60">
                  No card · 168 currencies · Free self-host option
                </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Who This Is For
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" />
                    You&apos;re a great fit if you:
                  </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Live in the EU, UK, Switzerland, or the Nordics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Tried Monarch and discovered it doesn&apos;t work here</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Earn or spend in more than one European currency</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Want end-to-end encryption for budget contents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>
                        Want a manually maintained household budget in multiple currencies
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Want the option to self-host on your own EU infrastructure</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" />
                    Stick with Monarch if you:
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>Are based in the US or Canada and bank there</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>
                        Need automatic investment sync from a US broker (Fidelity, Schwab, etc.)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>Budget in USD or CAD without needing currency conversion</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>
                        Prefer automatic bank sync and are comfortable authorizing a supported bank
                        connection
                      </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55">
                    Monarch is a solid app for US households. We are honest about that.
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                Frequently Asked Questions
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
                  label: 'Monarch supported countries',
                  href: 'https://help.monarch.com/hc/en-us/articles/19985735202068-FAQs-about-Monarch',
                },
                {
                  label: 'Monarch international accounts and currency limits',
                  href: 'https://help.monarch.com/hc/en-us/articles/360048393552-International-Accounts-and-Currency',
                },
                {
                  label: 'Monarch subscription pricing',
                  href: 'https://help.monarch.com/hc/en-us/articles/44815447567636-Updating-Your-Subscription',
                },
              ]}
            />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  A budgeting app that actually works in Europe.
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  Start your 35-day Budgero trial. Bring a supported bank export and try budgeting
                  across currencies with zero-knowledge encryption. Cloud is {pricing.yearly}/year;
                  self-hosting has no software subscription fee.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=monarch-money-europe-alternative&utm_content=final">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <Link href="/self-hosted-ynab-alternative">Self-host for free</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  Also see:{' '}
                  <Link
                    href="/monarch-money-alternative"
                    className="underline hover:text-foreground"
                  >
                    Full Budgero vs Monarch
                  </Link>{' '}
                  ·{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground">
                    YNAB alternative for Europe
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
