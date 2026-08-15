import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Download, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'YNAB Alternative for Australia — AUD Budgeting | Budgero',
  description: `The YNAB alternative built for Australia. Budget in AUD (and 167 other currencies), works with every Australian bank via CSV, end-to-end encrypted. From ${pricing.monthly}/mo. 35-day free trial.`,
  keywords: [
    'ynab alternative australia',
    'ynab australia',
    'ynab australia alternative',
    'australian budgeting app',
    'budgeting app australia',
    'ynab aud',
    'ynab commbank',
    'ynab up bank',
    'zero based budgeting australia',
    'envelope budgeting app australia',
    'best budgeting app australia',
    'monarch money australia',
  ],
  alternates: { canonical: 'https://budgero.app/ynab-alternative-australia' },
  openGraph: {
    title: 'YNAB Alternative for Australia — AUD Budgeting | Budgero',
    description:
      'The YNAB alternative built for Australia. AUD budgeting, works with every Australian bank via CSV, end-to-end encrypted.',
    url: 'https://budgero.app/ynab-alternative-australia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YNAB Alternative for Australia — AUD Budgeting | Budgero',
    description:
      'AUD budgeting that works with every Australian bank. End-to-end encrypted, a third the price of YNAB.',
  },
};

const comparisonData = [
  {
    feature: 'Built for Australia',
    budgero: true,
    ynab: false,
    budgeroNote: 'AUD-first, works with every Australian bank',
    ynabNote: 'No Australian bank sync — manual only',
  },
  {
    feature: 'Works with your bank',
    budgero: 'All AU banks',
    ynab: 'No native sync',
    budgeroNote: 'CSV import from CommBank, Up, anyone',
    ynabNote: 'Third-party syncers only, at extra cost',
  },
  {
    feature: 'AUD + other currencies in one budget',
    budgero: true,
    ynab: false,
    budgeroNote: '168 currencies with live FX',
    ynabNote: 'One currency per budget',
  },
  {
    feature: 'Annual price',
    budgero: `${pricing.yearly}/year`,
    ynab: '$109 USD/year (~A$165)',
    budgeroNote: 'Or free with Self-Host',
    ynabNote: 'USD billing + card FX fees',
  },
  {
    feature: 'End-to-end encryption',
    budgero: true,
    ynab: false,
    budgeroNote: 'AES-256-GCM, zero-knowledge',
    ynabNote: 'Plaintext on US servers',
  },
  {
    feature: 'Telemetry & tracking',
    budgero: 'Opt-in only',
    ynab: true,
    budgeroNote: 'No telemetry unless you explicitly allow it',
    ynabNote: 'Third-party analytics by default',
  },
  {
    feature: 'Offline mode',
    budgero: true,
    ynab: false,
    budgeroNote: 'PWA works fully offline',
    ynabNote: 'Requires internet',
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
    budgeroNote: 'Docker, your own server',
    ynabNote: null,
  },
];

const faqs = [
  {
    q: 'Does YNAB work in Australia?',
    a: "You can use YNAB in Australia, but it doesn't work the way it does in the US. YNAB's native bank import covers US, Canadian, and (since 2024–25) select UK banks — Australian banks aren't supported directly. Third-party services like Redbark or Budget Feeder can sync AU banks into YNAB via Open Banking, but that's an additional subscription on top of YNAB's $109 USD/year (roughly A$165 once FX fees hit your card), and another company handling your transaction data.",
  },
  {
    q: 'Does Budgero work with Australian banks like CommBank and Up?',
    a: 'Yes — with every Australian bank, because Budgero is deliberately manual-first. Export a CSV from CommBank, Westpac, ANZ, NAB, Macquarie, ING, or Up (app-first banks like Up make this especially painless) and import it in seconds, or enter transactions as you spend. No bank credentials are shared with anyone.',
  },
  {
    q: 'Can I budget in AUD and other currencies together?',
    a: 'Yes. Budgero supports 168 currencies in one budget with live exchange rates — AUD as your home currency with NZD, USD, EUR, or GBP accounts alongside. If you have overseas income, family abroad, or just a Wise account for travel, it all rolls up into one picture in dollars.',
  },
  {
    q: 'How much does Budgero cost in Australian dollars?',
    a: `Budgero Cloud is ${pricing.monthly}/month or ${pricing.yearly}/year — roughly a third of YNAB's $109 USD (~A$165), and the price is tax-inclusive — what you see is what you pay, with no foreign-transaction surprises. Budgero Self-Host is free forever on your own server.`,
  },
  {
    q: 'Can I import my YNAB budget?',
    a: 'Yes. Budgero imports YNAB export files directly — categories, transactions, budget groups, and accounts come across intact in about 5 minutes. Export from YNAB before your subscription lapses, because YNAB cuts off export access when you stop paying.',
  },
  {
    q: 'Does Monarch Money work in Australia?',
    a: "No. Monarch Money officially supports only the US and Canada — Australian banks can't connect and there's no AUD support. If you were considering Monarch as your YNAB replacement, it's not an option in Australia; Budgero, PocketSmith (NZ-based, strong AU bank feeds), and Actual Budget (self-hosted) are the realistic shortlist.",
  },
  {
    q: 'Where is my data stored?',
    a: 'Budgero Cloud data is hosted in Finland, in the EU — and it is encrypted on your device with a key we never see before it gets there, so we cannot read it regardless. No telemetry runs unless you explicitly opt in. If you want your data on Australian soil, Budgero Self-Host runs on any local server or NAS.',
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

export default async function YnabAlternativeAustraliaPage(
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
  const t = await getTranslations('ynab_alternative_australia');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Budgero',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
        url: 'https://budgero.app/ynab-alternative-australia',
        description:
          'YNAB alternative for Australia — zero-based budgeting in AUD and 168 currencies, works with every Australian bank via CSV, end-to-end encrypted.',
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
          'AUD-first budgeting with 168 currencies',
          'Zero-knowledge encryption (AES-256-GCM)',
          'Works with every Australian bank via CSV',
          'No telemetry unless explicitly enabled',
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
            name: 'YNAB Alternative for Australia',
            item: 'https://budgero.app/ynab-alternative-australia',
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
                  <DollarSign className="w-3.5 h-3.5 mr-2 shrink-0" />
                  <span>{t('built_for_australia_aud_first')}</span>
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_ynab_alternative_for_australia')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('aud_budgeting_that_works_with_every')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('ynab_s_bank_sync_doesn_t')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-australia&utm_content=hero"> {t('start_35_day_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="#comparison">{t('see_the_australian_comparison')}</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('35_days_free_no_card_needed')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why AU YNAB users are switching */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_australian_ynab_users_are_switching')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('australians_have_always_been_second_class')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">{t('no_native_australian_bank_sync')}</strong>{' '} {t('ynab_s_direct_import_covers_the')} </p>
                  <p>
                    <strong className="text-foreground">{t('you_pay_in_us_dollars')}</strong> {t('109_usd_year_lands_as_roughly')} </p>
                  <p>
                    <strong className="text-foreground">{t('no_multi_currency')}</strong> {t('overseas_income_a_wise_account_nzd')} </p>
                  <p>
                    <strong className="text-foreground">{t('your_data_lives_on_us_servers')}</strong>{' '} {t('in_plaintext_under_us_data_law')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section id="comparison" className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_vs_ynab_the_australian_view')} </h2>
                <p className="text-lg text-foreground/70"> {t('where_it_actually_matters_for_australian')} </p>
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
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-australia&utm_content=mid-table"> {t('start_35_day_free_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <span className="text-sm text-foreground/60"> {t('no_card_aud_first_works_with')} </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* AU banking reality */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('works_with_commbank_up_and_the')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('budgero_skips_the_bank_aggregator_question')} </p>
                <p> {t('no_sync_connections_to_babysit_no')}{' '}
                  <Link
                    href="/multi-currency-budgeting"
                    className="underline hover:text-foreground"
                  > {t('aud_alongside_167_other_currencies')} </Link>{' '} {t('with_live_exchange_rates_something_ynab')} </p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('budget_in_dollars_privately_without_the')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('start_your_35_day_budgero_cloud')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=ynab-alternative-australia&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
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
                  <Link href="/vs-ynab" className="underline hover:text-foreground"> {t('full_budgero_vs_ynab_comparison')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
