import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, Check, X, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Zero-Knowledge Encrypted Budgeting App | Budgero',
  description:
    'Budgero encrypts your financial data on your device before sync using AES-256-GCM. We cannot read your budget. Zero-knowledge privacy by design.',
  keywords: [
    'encrypted budgeting app',
    'private budgeting app',
    'zero knowledge budgeting',
    'budgeting app privacy',
    'secure budget app',
    'encrypted finance app',
    'private finance tracker',
    'zero knowledge encryption budget',
  ],
  alternates: { canonical: 'https://budgero.app/encrypted-budgeting' },
  openGraph: {
    title: 'Zero-Knowledge Encrypted Budgeting App | Budgero',
    description:
      'Budgero encrypts your financial data on your device before sync using AES-256-GCM. We cannot read your budget.',
    url: 'https://budgero.app/encrypted-budgeting',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero-Knowledge Encrypted Budgeting App | Budgero',
    description: 'Your budget is encrypted before it leaves your device. We cannot read it.',
  },
};

const privacyComparison = [
  {
    feature: 'Data encrypted at rest on server',
    budgero: 'Zero-knowledge',
    ynab: 'Standard',
    monarch: 'Standard',
  },
  {
    feature: 'Provider can read your data',
    budgero: false,
    ynab: true,
    monarch: true,
  },
  {
    feature: 'Encryption method',
    budgero: 'AES-256-GCM (client-side)',
    ynab: 'TLS + server-side',
    monarch: 'TLS + server-side',
  },
  {
    feature: 'Bank connection required',
    budgero: false,
    ynab: false,
    monarch: true,
    budgeroNote: 'By design',
    ynabNote: 'Optional',
  },
  {
    feature: 'Self-host option',
    budgero: true,
    ynab: false,
    monarch: false,
  },
];

export default async function EncryptedBudgetingPage(
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
  const t = await getTranslations('encrypted_budgeting');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    image: 'https://budgero.app/logo_512.png',
    name: 'Budgero',
    applicationCategory: 'FinanceApplication',
    operatingSystem: ['Web', 'Windows', 'macOS', 'Linux'],
    url: 'https://budgero.app/encrypted-budgeting',
    description:
      'Zero-knowledge encrypted budgeting app. Data is encrypted on-device with AES-256-GCM before sync.',
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
        name: 'Budgero Cloud (yearly)',
        price: pricing.yearly.replace(/[^0-9.]/g, ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    ],
    featureList: [
      'Zero-knowledge encryption (AES-256-GCM)',
      'Client-side encryption before sync',
      'Self-host option',
      'No bank connections required',
      'Multi-currency support',
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
                  <Lock className="w-3.5 h-3.5 mr-2" /> {t('zero_knowledge_encryption')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('your_budget_is_none_of_our')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('zero_knowledge_encrypted_budgeting')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('most_encrypted_budgeting_apps_store_your')} </p>

                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=encrypted-budgeting&utm_content=hero"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>

                <p className="mt-4 text-sm text-foreground/60"> {t('35_days_free_no_credit_card')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Zero-Knowledge Means */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('what_zero_knowledge_means')} </h2>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('your_data_is_encrypted_with_a')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('encryption_happens_in_your_browser_or')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('we_store_encrypted_blobs_we_cannot')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span> {t('if_you_forget_your_master_password')} </span>
                  </li>
                </ul>
                <p className="mt-6 text-sm text-foreground/55"> {t('this_is_not_marketing_speak_this')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How It Works */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('how_it_works')} </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('you_enter_data')}</h3>
                  <p className="text-sm text-foreground/70"> {t('transactions_accounts_budgets_all_entered_in')} </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('your_device_encrypts')}</h3>
                  <p className="text-sm text-foreground/70"> {t('aes_256_gcm_encryption_runs_client')} </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('we_store_ciphertext')}</h3>
                  <p className="text-sm text-foreground/70"> {t('our_servers_receive_and_store_encrypted')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why This Matters */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_this_matters')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('your_budget_contains_some_of_the')} </p>
                <p> {t('most_budgeting_apps_can_access_this')} </p>
                <p> {t('zero_knowledge_encryption_means_there_is')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Privacy Comparison */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('privacy_compared')} </h2>
                <p className="text-lg text-foreground/70"> {t('how_budgeting_apps_handle_your_data')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('budgero')} </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        YNAB
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground"> {t('monarch')} </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {privacyComparison.map((row, index) => (
                      <tr
                        key={row.feature}
                        className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/25'}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          {row.feature}
                        </td>
                        {(['budgero', 'ynab', 'monarch'] as const).map((col) => {
                          const val = row[col];
                          const note = (row as Record<string, unknown>)[`${col}Note`] as
                            | string
                            | undefined;
                          return (
                            <td key={col} className="px-4 py-4 text-center">
                              {typeof val === 'boolean' ? (
                                <div className="flex flex-col items-center gap-1">
                                  {val ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <X className="w-5 h-5 text-foreground/35" />
                                  )}
                                  {note && (
                                    <span className="text-xs text-foreground/55">{note}</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={`text-sm ${col === 'budgero' ? 'font-medium text-[#2f6246]' : 'text-foreground/65'}`}
                                  >
                                    {val}
                                  </span>
                                  {note && (
                                    <span className="text-xs text-foreground/55">{note}</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* The Trade-off */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6"> {t('the_trade_off')} </h2>
                <p className="text-lg text-foreground/75 mb-6"> {t('zero_knowledge_encryption_is_not_free')} </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('no_automatic_bank_sync')}</strong> {t('your_bank_would_need_to_send')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground"> {t('no_server_side_ai_categorization')} </strong>{' '} {t('we_cannot_read_your_transactions_to')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('password_recovery_is_impossible')}</strong>{' '} {t('we_do_not_have_your_encryption')} </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('manual_entry_required')}</strong> {t('budgero_has_autofill_rules_and_smart')} </span>
                  </li>
                </ul>
                <p className="mt-6 text-sm text-foreground/55"> {t('these_are_intentional_design_decisions_not')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('try_zero_knowledge_budgeting_free_for')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('no_credit_card_required_your_data')} </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=encrypted-budgeting&utm_content=final"> {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60"> {t('want_full_control')}{' '}
                  <a href="/self-hostable" className="underline hover:text-foreground"> {t('self_host_budgero')} </a>{' '} {t('on_your_own_infrastructure')} </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
