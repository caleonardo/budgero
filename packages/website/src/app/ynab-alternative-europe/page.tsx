import { ComparisonReferences } from '@/components/comparison-references';
import { MultiCurrencyExample } from '@/components/multi-currency-example';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'YNAB Alternative for Europe — Hosted in Finland | Budgero',
  description: `The YNAB alternative built for Europe. EUR, GBP, CHF, PLN and 168 currencies in one budget, end-to-end encrypted, data hosted in Finland. From ${pricing.monthly}/mo. 35-day free trial.`,
  keywords: [
    'ynab alternative europe',
    'ynab alternative eu',
    'ynab europe',
    'ynab uk alternative',
    'ynab germany',
    'ynab netherlands',
    'ynab spain',
    'ynab multi currency europe',
    'european budgeting app',
    'eu budgeting app',
    'gdpr budgeting app',
    'budgeting app europe',
    'ynab alternative gdpr',
    'best budgeting app europe',
  ],
  alternates: { canonical: 'https://budgero.app/ynab-alternative-europe' },
  openGraph: {
    title: 'YNAB Alternative for Europe — Hosted in Finland | Budgero',
    description:
      'The YNAB alternative built for Europe. EUR, GBP, CHF, PLN and 168 currencies in one budget, end-to-end encrypted, data hosted in Finland.',
    url: 'https://budgero.app/ynab-alternative-europe',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YNAB Alternative for Europe — Hosted in Finland | Budgero',
    description:
      'EUR, GBP, CHF and 168 currencies in one budget. End-to-end encrypted, hosted in Finland.',
  },
};

const comparisonData = [
  {
    feature: 'Bank transactions',
    budgero: 'Manual or file import',
    ynab: 'Direct Import, file import, or manual',
    budgeroNote: 'No automatic bank connection',
    ynabNote: 'Select banks in supported UK/EU countries',
  },
  {
    feature: 'Multi-currency in one budget',
    budgero: '168 currencies',
    ynab: false,
    budgeroNote: 'Original amounts plus conversion to your budget currency',
    ynabNote: 'One currency per plan; no native conversion',
  },
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    ynab: '$109/year',
    budgeroNote: 'Or free with self-hosting; hosting costs may apply',
    ynabNote: 'USD; applicable taxes extra',
  },
  {
    feature: 'End-to-end budget encryption',
    budgero: true,
    ynab: false,
    budgeroNote: 'AES-256-GCM; keys stay on your devices',
    ynabNote: 'Encryption at rest and in transit; not zero-knowledge',
  },
  {
    feature: 'Offline access',
    budgero: true,
    ynab: 'Mobile offline use',
    budgeroNote: 'Installed PWA; reconnect to sync',
    ynabNote: 'Reconnect for bank imports and sync',
  },
  {
    feature: 'Zero-based budgeting',
    budgero: true,
    ynab: true,
    budgeroNote: null,
    ynabNote: null,
  },
  {
    feature: 'YNAB data import',
    budgero: true,
    ynab: 'N/A',
    budgeroNote: 'Direct API or export ZIP; review after import',
    ynabNote: null,
  },
  {
    feature: 'Self-host option',
    budgero: true,
    ynab: false,
    budgeroNote: 'Docker; choose your hosting location',
    ynabNote: null,
  },
];

const faqs = [
  {
    q: 'Does YNAB work in Europe?',
    a: 'Yes. YNAB offers Direct Import for select banks in supported European countries, including the UK, Germany, France, and the Netherlands. Check your specific bank and account type. Manual entry and file import are also available without a bank connection.',
  },
  {
    q: 'Can I budget in EUR, GBP, and other European currencies?',
    a: 'Budgero lets accounts in different currencies share a single budget. Choose a budget currency, keep each account’s original amounts, and use fetched or custom exchange rates for budget totals. YNAB uses one currency per plan without native conversion.',
  },
  {
    q: 'How much does Budgero cost in euros?',
    a: `Budgero Cloud is listed in USD at ${pricing.monthly}/month or ${pricing.yearly}/year, tax included. Check the checkout total and your payment provider’s conversion terms for the euro cost. Self-hosting has no software subscription fee; any hosting costs are separate.`,
  },
  {
    q: 'Can I import my YNAB budget?',
    a: 'Yes. Connect through the YNAB API or import an export ZIP. Accounts, categories, transactions, and monthly assignments can be imported. Review the import results and account balances, and rebuild goals and scheduled transactions. The import guide explains the differences between the two methods.',
  },
  {
    q: 'Does Budgero connect to European banks?',
    a: 'Budgero has no automatic bank connection. Enter transactions manually or import a supported statement file, such as CSV, OFX, or CAMT.053. Check your bank’s export and preview its dates, amounts, and account mapping before importing.',
  },
  {
    q: 'Where is my budget stored?',
    a: 'Budgero Cloud hosts encrypted budget data in Finland. Budget contents are encrypted on your device before sync. Account and billing information are handled separately, as described in our privacy policy. Self-hosting lets you choose where to run your server.',
  },
  {
    q: 'Does Budgero work offline?',
    a: 'Yes. Once set up, the installed Progressive Web App lets you enter transactions and review your budget offline. Reconnect to sync between devices and refresh exchange rates; use cached or manual rates while offline.',
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

export default function YnabAlternativeEuropePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/ynab-alternative-europe',
        description:
          'YNAB alternative for Europe — zero-based budgeting in EUR, GBP, CHF, PLN and 168 currencies, with end-to-end encryption, data hosted in Finland, and VAT-compliant billing.',
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
          'Zero-based budgeting',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Multi-currency (168 currencies) with live FX rates',
          'Data hosted in Finland (EU)',
          'VAT-compliant invoicing',
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
          {
            '@type': 'ListItem',
            position: 2,
            name: 'YNAB Alternative for Europe',
            item: 'https://budgero.app/ynab-alternative-europe',
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
                  className="mb-6 max-w-full whitespace-normal text-center px-3 py-1.5 text-xs sm:text-sm font-medium border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10"
                >
                  <Globe className="w-3.5 h-3.5 mr-2 shrink-0" />
                  <span>Built for Europe — 168 currencies</span>
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  The YNAB Alternative for Europe
                  <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium">
                    Multi-currency, data hosted in Finland, and built for how European households
                    actually earn and spend.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Keep zero-based budgeting while managing EUR, GBP, CHF, and other currencies
                  together. Budgero offers encrypted budget sync hosted in Finland, manual or file
                  import, and Cloud at {pricing.yearly}/year. YNAB supports select European bank
                  connections; choose Budgero if currency conversion or self-hosting matters more.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=hero">
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
                    <a href="#comparison">See the Europe Comparison</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  No card. VAT-compliant invoicing. 168 currencies from day one.
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Choosing a YNAB alternative in Europe
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  Start with the problem you need to solve. If your budget uses one currency and
                  YNAB connects to your bank, its native apps and Direct Import may already suit
                  you. Budgero is worth considering when you need several account currencies in one
                  budget, end-to-end encryption, or your own server.
                </p>
                <p>
                  For example, a household earning GBP while paying rent in EUR needs a consistent
                  conversion rule. A traveller who only wants automatic imports from a German bank
                  has a different requirement. Currency support does not establish bank
                  connectivity.
                </p>
                <p>
                  For migration,{' '}
                  <Link href="/docs/ynab-import" className="underline hover:text-foreground">
                    connect through YNAB’s API or import its export ZIP
                  </Link>
                  . Compare account balances and category history before relying on the new budget.
                  Rebuild targets and scheduled transactions, and keep your source export.
                </p>
              </div>
            </section>

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Budgero vs. YNAB — The European View
                </h2>
                <p className="text-lg text-foreground/70">
                  Where it actually matters for households and freelancers on the continent.
                </p>
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
                          {renderCellValue(row.budgero, row.budgeroNote, true)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {renderCellValue(row.ynab, row.ynabNote, false)}
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=mid-table">
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

            <MultiCurrencyExample />

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Encrypted budget sync hosted in Finland
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  Budgero encrypts budget contents on your device before syncing them to Cloud.
                  Hosting in Finland and end-to-end encryption address different needs: one
                  determines the server location, while the other limits access to budget contents.
                </p>
                <p>
                  Encryption does not remove every category of personal information. Read our{' '}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    privacy policy
                  </Link>{' '}
                  for account and billing data, and our{' '}
                  <Link href="/docs/security" className="underline hover:text-foreground">
                    security guide
                  </Link>{' '}
                  for key management and recovery. You can also{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    self-host
                  </Link>{' '}
                  and manage your own server and backups.
                </p>
              </div>
            </section>

            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Cloud pricing and self-hosting costs
              </h2>
              <div className="space-y-5 text-lg text-foreground/75 leading-relaxed">
                <p>
                  Budgero Cloud costs {pricing.monthly}/month or {pricing.yearly}/year in USD, tax
                  included. Lemon Squeezy handles checkout as merchant of record. Check the checkout
                  total and your payment provider’s exchange terms for the amount you will pay in
                  euros or pounds.
                </p>
                <p>
                  Self-hosting has no Budgero subscription fee. You provide the server, updates, and
                  backups; the cost depends on whether you use hardware you already own or a paid
                  hosting service.
                </p>
              </div>
            </section>

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Who Budgero Is Built For
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" />
                    You are a good fit if you:
                  </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Live in the EU, UK, Switzerland, or the Nordics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Earn or spend in more than one currency</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Want to keep EUR and GBP accounts in one budget</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Want budget contents encrypted before they reach the server</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Want the option to self-host on EU infrastructure</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>Already have a YNAB budget you want to bring across</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" />
                    You might be better off with YNAB if you:
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>Use one budget currency and have a supported bank connection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>
                        Need automatic bank sync and refuse to consider CSV imports or manual entry
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>Prefer native iOS and Android apps over a PWA</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>Prefer a managed service and do not need self-hosting</span>
                    </li>
                  </ul>
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
                  label: 'YNAB Direct Import in Europe',
                  href: 'https://support.ynab.com/en_us/direct-import-in-europe-Syae1z_A9',
                },
                { label: 'YNAB pricing', href: 'https://www.ynab.com/pricing' },
                {
                  label: 'YNAB security and optional bank connections',
                  href: 'https://www.ynab.com/security',
                },
                {
                  label: 'YNAB features, including mobile offline access',
                  href: 'https://www.ynab.com/features',
                },
              ]}
            />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  35 days free, no card
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Budget in every currency. Privately. From Europe.
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  Start your 35-day Budgero Cloud trial. Import your YNAB budget in minutes. Or
                  self-host for free on your own server. Your data stays yours either way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=final">
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
                    <Link href="/self-hosted-ynab-alternative">Prefer to self-host?</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  Also see:{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    Best YNAB alternatives in 2026
                  </Link>{' '}
                  ·{' '}
                  <Link href="/ynab-alternative-uk" className="underline hover:text-foreground">
                    YNAB alternative for the UK
                  </Link>{' '}
                  ·{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground">
                    Full Budgero vs YNAB comparison
                  </Link>{' '}
                  ·{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  >
                    Multi-currency budgeting
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
