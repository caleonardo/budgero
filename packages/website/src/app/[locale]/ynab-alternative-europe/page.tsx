import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Download, Globe, Shield, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'YNAB Alternative for Europe — Hosted in Finland | Budgero',
  description: `The YNAB alternative built for Europe. EUR, GBP, CHF, PLN and 168 currencies in one budget, end-to-end encrypted, data hosted in Finland, and no telemetry unless you allow it. From ${pricing.monthly}/mo. 35-day free trial.`,
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
      'The YNAB alternative built for Europe. EUR, GBP, CHF, PLN and 168 currencies in one budget, end-to-end encrypted, data hosted in Finland, no telemetry unless you allow it.',
    url: 'https://budgero.app/ynab-alternative-europe',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YNAB Alternative for Europe — Hosted in Finland | Budgero',
    description:
      'EUR, GBP, CHF and 168 currencies in one budget. End-to-end encrypted, hosted in Finland, no telemetry by default.',
  },
};

const comparisonData = [
  {
    feature: 'Works across Europe',
    budgero: true,
    ynab: 'Partial',
    budgeroNote: 'Every country, every currency',
    ynabNote: 'UK/EU bank sync via Plaid only (select banks)',
  },
  {
    feature: 'Multi-currency in one budget',
    budgero: '168 currencies',
    ynab: false,
    budgeroNote: 'EUR, GBP, CHF, PLN, SEK, NOK + live FX',
    ynabNote: 'One currency per budget, no conversion',
  },
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    ynab: '$109/year (~€100)',
    budgeroNote: 'Or free with Self-Host',
    ynabNote: null,
  },
  {
    feature: 'Where your data lives',
    budgero: 'Finland 🇫🇮',
    ynab: 'United States',
    budgeroNote: 'EU jurisdiction, zero-knowledge encrypted',
    ynabNote: 'US servers, subject to US data law',
  },
  {
    feature: 'Telemetry & tracking',
    budgero: 'Opt-in only',
    ynab: true,
    budgeroNote: 'No telemetry unless you explicitly allow it',
    ynabNote: 'Third-party analytics by default',
  },
  {
    feature: 'End-to-end encryption',
    budgero: true,
    ynab: false,
    budgeroNote: 'AES-256-GCM, zero-knowledge',
    ynabNote: 'Plaintext on their servers',
  },
  {
    feature: 'Offline mode',
    budgero: true,
    ynab: false,
    budgeroNote: 'PWA works fully offline',
    ynabNote: 'Requires internet',
  },
  {
    feature: 'Billing in your currency',
    budgero: true,
    ynab: false,
    budgeroNote: 'VAT-compliant EU invoicing',
    ynabNote: 'USD-only charges',
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
    budgeroNote: 'Full categories, transactions, history',
    ynabNote: null,
  },
  {
    feature: 'Self-host option',
    budgero: true,
    ynab: false,
    budgeroNote: 'Docker, your EU server',
    ynabNote: null,
  },
];

const euBankingExamples = [
  {
    country: 'Germany',
    flag: '🇩🇪',
    banks: 'N26, DKB, Deutsche Bank, ING, Commerzbank',
    pain: 'YNAB\u2019s Plaid sync covers only select German banks — N26, DKB, and regional Sparkassen still mean manual CSV.',
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    banks: 'Monzo, Revolut, Starling, HSBC, Lloyds',
    pain: 'YNAB returned in 2024–25 via Plaid, but Starling and Lloyds are still outside coverage — and billing stays in USD.',
  },
  {
    country: 'Netherlands',
    flag: '🇳🇱',
    banks: 'ING, ABN AMRO, Rabobank, Bunq',
    pain: 'Plaid coverage is spotty and iDEAL-linked transfers rarely show up correctly.',
  },
  {
    country: 'Switzerland',
    flag: '🇨🇭',
    banks: 'UBS, Raiffeisen, PostFinance, Revolut CH',
    pain: 'CHF is not a first-class citizen in YNAB. Manual FX conversion every time.',
  },
  {
    country: 'Nordics',
    flag: '🇸🇪',
    banks: 'Swedbank, Nordea, SEB, DNB',
    pain: 'SEK and NOK are not supported as budget currencies alongside EUR.',
  },
  {
    country: 'Central Europe',
    flag: '🇵🇱',
    banks: 'mBank, PKO BP, Revolut, ING PL',
    pain: 'PLN, CZK, HUF are second-class currencies in most US-built apps.',
  },
];

const faqs = [
  {
    q: 'Does Budgero work across Europe?',
    a: "Yes. Budgero works in every EU country plus the UK, Switzerland, Norway, and Iceland. The app, billing, onboarding, and support are all built without US-centric assumptions. Our users are concentrated across Germany, the UK, the Netherlands, France, Spain, Poland, and Sweden.",
  },
  {
    q: 'Is Budgero GDPR-compliant?',
    a: "Yes — structurally, not just on paper. Your data is hosted in Finland under EU jurisdiction, and it is encrypted on your device before it ever reaches our servers, so we literally cannot decrypt it. There is no sensitive personal data for us to expose, lose, or be compelled to hand over, and no telemetry runs unless you explicitly enable it. You can also self-host on your own EU infrastructure if you prefer full data sovereignty.",
  },
  {
    q: 'What happened to YNAB in the UK and Europe?',
    a: "YNAB officially withdrew from the UK in 2022, citing the cost of maintaining UK-specific features. In 2024\u201325 it returned via Plaid's Open Banking integration — UK users can now link select banks (Revolut, Monzo, Nationwide, NatWest, HSBC, American Express and others) and import transactions directly. Coverage is real but selective: many UK and EU banks are still outside Plaid's supported list, billing remains in USD, there is still no multi-currency support, EU-specific flows like SEPA direct debits or iDEAL-linked transfers don't map cleanly, and VAT-compliant invoicing isn't offered. So YNAB works in the UK again, it just doesn't work the way most European households need it to.",
  },
  {
    q: 'Can I budget in EUR, GBP, and other European currencies?',
    a: `Yes. Budgero supports 168 currencies natively — EUR, GBP, CHF, PLN, SEK, NOK, DKK, CZK, HUF, RON, HRK, BGN and more. You can hold accounts in multiple currencies simultaneously, see your total net worth in your home currency, and assign budget amounts across currencies. Live exchange rates update automatically.`,
  },
  {
    q: 'How much does Budgero cost in euros?',
    a: `Budgero Cloud is ${pricing.monthly}/month or ${pricing.yearly}/year. At current rates that is roughly €3.50/month or €30/year — about a third of what YNAB charges, tax included. Payments run through Lemon Squeezy, our merchant of record, which handles VAT and issues proper VAT-compliant invoices for freelancers and businesses. If you prefer to not pay anything, Budgero Self-Host is free forever on your own server.`,
  },
  {
    q: 'Can I get a VAT invoice?',
    a: "Yes. Every payment generates a VAT-compliant invoice downloadable from your account. For freelancers and small businesses across the EU, this means Budgero is properly deductible as a business expense. YNAB does not issue VAT invoices by default.",
  },
  {
    q: 'Can I import my YNAB budget?',
    a: 'Yes. Budgero imports YNAB export files directly. Categories, transactions, budget groups, and accounts come across intact. The process takes about 5 minutes. Your years of YNAB history are preserved.',
  },
  {
    q: 'Does Budgero connect to European banks?',
    a: "No, and that is deliberate. Automatic bank sync requires sharing your banking credentials with a third-party aggregator like Plaid or Tink. Budgero is manual-first: you either enter transactions yourself or import a CSV from your bank. This keeps your credentials under your control and is part of why Budgero can offer true end-to-end encryption. If automatic bank sync is a dealbreaker, Budgero is not the right choice.",
  },
  {
    q: 'Where is my data stored?',
    a: "In Finland. Budgero Cloud runs on EU infrastructure under EU jurisdiction — your encrypted data never sits on US servers. And because it is encrypted on your device with a key we never see, even we cannot read it where it sits. If you want full control over hosting location, Budgero Self-Host lets you run the same app on your own server with Docker in under an hour.",
  },
  {
    q: 'Does Budgero work offline?',
    a: "Yes. Budgero is a Progressive Web App with full offline support. Add transactions on a train without signal, review your budget on a flight, or keep your data off the network entirely. Everything syncs automatically when you reconnect.",
  },
  {
    q: 'Does Budgero collect telemetry or usage analytics?',
    a: 'Not unless you explicitly allow it. By default the app sends no telemetry, no usage tracking, and no analytics events. If you opt in, anonymized diagnostics help us fix bugs — and you can turn it off again at any time.',
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
        className={`text-sm ${
          isHighlight ? 'font-medium text-[#2f6246]' : 'text-foreground/65'
        }`}
      >
        {String(val)}
      </span>
      {note && <span className="text-xs text-foreground/55">{note}</span>}
    </div>
  );
}

export default async function YnabAlternativeEuropePage(
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
  const t = await getTranslations('ynab_alternative_europe');
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
          'No telemetry unless explicitly enabled',
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
                  <span>{t('built_for_europe_168_currencies')}</span>
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_ynab_alternative_for_europe')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('multi_currency_data_hosted_in_finland')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('ynab_bills_in_usd_still_doesn')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('see_the_europe_comparison')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('no_card_vat_compliant_invoicing_168')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why European YNAB users are leaving */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_european_ynab_users_are_leaving')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('ynab_is_a_great_american_app')} <em>{t('american')}</em>{t('the_envelope_budgeting_philosophy_travels_well')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">{t('ynab_s_uk_return_is_via')}</strong>{' '} {t('ynab_withdrew_from_the_uk_in')} </p>
                  <p>
                    <strong className="text-foreground">{t('eu_bank_sync_is_uneven')}</strong> {t('ynab_s_direct_import_covers_select')} </p>
                  <p>
                    <strong className="text-foreground"> {t('multi_currency_is_effectively_not_supported')} </strong>{' '} {t('ynab_treats_each_account_as_a')} </p>
                  <p>
                    <strong className="text-foreground"> {t('no_vat_compliant_invoicing_for_freelancers')} </strong>{' '} {t('ynab_does_not_issue_proper_vat')} </p>
                  <p>
                    <strong className="text-foreground">{t('data_lives_under_us_law')}</strong> {t('ynab_stores_your_budget_on_us')} </p>
                  <p>
                    <strong className="text-foreground">{t('billed_in_usd')}</strong> {t('ynab_is_14_99_month_or')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_ynab_the_european_view')} </h2>
                <p className="text-lg text-foreground/70"> {t('where_it_actually_matters_for_households')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_168_currencies_vat_compliant')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* EU Banking Landscape */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_understands_the_european_banking_landsca')} </h2>
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto"> {t('plaid_does_not_budgero_skips_the')} </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {euBankingExamples.map((c) => (
                  <div
                    key={c.country}
                    className="bg-card rounded-xl p-6 border border-border/70"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{c.flag}</span>
                      <h3 className="font-semibold text-foreground text-lg">{c.country}</h3>
                    </div>
                    <p className="text-sm text-foreground/65 mb-3">
                      <strong className="text-foreground/85">{t('common_banks')}</strong> {c.banks}
                    </p>
                    <p className="text-sm text-foreground/70">
                      <strong className="text-foreground/85">{t('ynab_problem')}</strong> {c.pain}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-foreground/60 max-w-2xl mx-auto"> {t('in_budgero_it_does_not_matter')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Multi-currency deep section */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('real_multi_currency_not_one_currency')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('a_lot_of_european_budgeters_have')} </p>
                <p> {t('budgero_lets_you_hold_accounts_in')}{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('168_currencies')} </Link>{' '} {t('inside_the_same_budget_pick_a')} </p>
                <p> {t('this_is_the_number_one_reason')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* GDPR and privacy */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border/70">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-[#2f6246]" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {t('your_data_lives_in_finland_and')} </h2>
                </div>
                <p className="text-lg text-foreground/75 leading-relaxed mb-4"> {t('budgero_cloud_is_hosted_in_finland')} </p>
                <p className="text-lg text-foreground/75 leading-relaxed mb-4"> {t('concretely_that_means')} </p>
                <ul className="space-y-3 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('no_telemetry_no_usage_tracking_no')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('your_data_export_request_is_instant')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('right_to_be_forgotten_is_mechanical')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('data_breach_risk_is_minimized_even')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('full_data_sovereignty_is_one_docker')}{' '}
                      <Link
                        href="/self-hostable"
                        className="underline hover:text-foreground"
                      > {t('budgero_self_host')} </Link>{' '} {t('on_your_own_eu_server_if')} </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Pricing in EUR context */}
            <section className="py-16 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Euro className="w-6 h-6 text-foreground/70" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground"> {t('priced_for_europe')} </h2>
              </div>
              <p className="text-lg text-foreground/75 leading-relaxed mb-6"> {t('budgero_cloud_is')} {pricing.monthly}{t('month_or')} {pricing.yearly}{t('year_roughly_3_50_per_month')} </p>
              <p className="text-lg text-foreground/75 leading-relaxed"> {t('if_you_would_rather_not_pay')} </p>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('who_budgero_is_built_for')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('you_are_a_good_fit_if')} </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('live_in_the_eu_uk_switzerland')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('earn_or_spend_in_more_than')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('are_a_freelancer_who_needs_vat')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span> {t('care_that_your_financial_data_is')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_the_option_to_self_host')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('already_have_a_ynab_budget_you')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" /> {t('you_might_be_better_off_with')} </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('only_use_usd_and_are_based')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('need_automatic_bank_sync_and_refuse')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('prefer_native_ios_and_android_apps')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('are_not_concerned_about_data_sovereignty')} </span>
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
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> {t('35_days_free_no_card')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('budget_in_every_currency_privately_from')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_budgero_cloud')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-europe&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <Link href="/self-hosted-ynab-alternative">{t('prefer_to_self_host')}</Link>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('also_see')}{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground"> {t('best_ynab_alternatives_in_2026')} </Link>{' '}·{' '}
                  <Link href="/ynab-alternative-uk" className="underline hover:text-foreground"> {t('ynab_alternative_for_the_uk')} </Link>{' '}·{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground"> {t('full_budgero_vs_ynab_comparison')} </Link>{' '}·{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('multi_currency_budgeting')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
