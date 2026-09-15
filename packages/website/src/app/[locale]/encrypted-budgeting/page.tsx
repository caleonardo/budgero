import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { ArrowRight, Check, X, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
  const copy = await getTranslations({
    locale: (await params).locale,
    namespace: 'updates',
  });
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'encrypted_budgeting' });
  return withLocalizedUrls(locale, '/encrypted-budgeting', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_2e81c0adf2bb'),
      copy('u_d64cce054cfa'),
      copy('u_3b7f9f60a2e8'),
      copy('u_9fe8e6064378'),
      copy('u_d5ab7434b05d'),
      copy('u_8fe4c82376ed'),
      copy('u_e2acf21410d6'),
      copy('u_0479d28081ac'),
    ],
    alternates: { canonical: 'https://budgero.app/encrypted-budgeting' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/encrypted-budgeting',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makePrivacyComparison = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: t('privacyComparison_data_encrypted_at_rest_on_server'),
    budgero: copy('u_e38163aa3fd2'),
    ynab: copy('u_ef6691545d2c'),
    monarch: copy('u_ef6691545d2c'),
  },
  {
    feature: t('privacyComparison_provider_can_read_your_data'),
    budgero: false,
    ynab: true,
    monarch: true,
  },
  {
    feature: t('privacyComparison_encryption_method'),
    budgero: t('privacyComparison_aes_256_gcm_client_side'),
    ynab: t('privacyComparison_tls_server_side'),
    monarch: t('privacyComparison_tls_server_side'),
  },
  {
    feature: t('privacyComparison_bank_connection_required'),
    budgero: false,
    ynab: false,
    monarch: true,
    budgeroNote: t('privacyComparison_by_design'),
    ynabNote: copy('u_59be71333c96'),
  },
  {
    feature: t('privacyComparison_self_host_option'),
    budgero: true,
    ynab: false,
    monarch: false,
  },
];

export default async function EncryptedBudgetingPage({
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
    namespace: 'encrypted_budgeting',
  });
  const privacyComparison = makePrivacyComparison(t, copy);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    image: 'https://budgero.app/logo_512.png',
    name: copy('u_045497ff4fcf'),
    applicationCategory: 'FinanceApplication',
    operatingSystem: [
      copy('u_2975104784a4'),
      copy('u_d598026a9cbc'),
      copy('u_aed6b7aa2a05'),
      copy('u_4828e60247c1'),
    ],
    url: 'https://budgero.app/encrypted-budgeting',
    description: copy('u_f303c67c9581'),
    offers: [
      {
        '@type': 'Offer',
        name: copy('u_02c52ce2f60b'),
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: copy('u_6fdf0566337b'),
        price: pricing.yearly.replace(/[^0-9.]/g, ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    ],
    featureList: [
      copy('u_e6072dcb869e'),
      copy('u_d4843b7baada'),
      copy('u_a87f8b3aa36a'),
      copy('u_935eae8c60f0'),
      copy('u_d458c964237f'),
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
                  <Lock className="w-3.5 h-3.5 mr-2" /> {t('zero_knowledge_encryption')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('your_budget_is_none_of_our')}{' '}
                  <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium">
                    {' '}
                    {t('zero_knowledge_encrypted_budgeting')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {t('most_encrypted_budgeting_apps_store_your')}{' '}
                </p>

                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=encrypted-budgeting&utm_content=hero">
                    {' '}
                    {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>

                <p className="mt-4 text-sm text-foreground/60">
                  {' '}
                  {t('35_days_free_no_credit_card')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* What Zero-Knowledge Means */}
            <section className="py-16 max-w-3xl mx-auto">
              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  {' '}
                  {t('what_zero_knowledge_means')}{' '}
                </h2>
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
                <p className="mt-6 text-sm text-foreground/55">
                  {' '}
                  {t('this_is_not_marketing_speak_this')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* How It Works */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('how_it_works')}{' '}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('you_enter_data')}</h3>
                  <p className="text-sm text-foreground/70">
                    {' '}
                    {t('transactions_accounts_budgets_all_entered_in')}{' '}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('your_device_encrypts')}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {' '}
                    {t('aes_256_gcm_encryption_runs_client')}{' '}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/70 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-foreground">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('we_store_ciphertext')}</h3>
                  <p className="text-sm text-foreground/70">
                    {' '}
                    {t('our_servers_receive_and_store_encrypted')}{' '}
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why This Matters */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('why_this_matters')}{' '}
              </h2>
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('privacy_compared')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">
                  {' '}
                  {t('how_budgeting_apps_handle_your_data')}{' '}
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
                        {t('budgero')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        YNAB
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('monarch')}{' '}
                      </th>
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
                            string | undefined;
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
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  {' '}
                  {t('the_trade_off')}{' '}
                </h2>
                <p className="text-lg text-foreground/75 mb-6">
                  {' '}
                  {t('zero_knowledge_encryption_is_not_free')}{' '}
                </p>
                <ul className="space-y-4 text-foreground/75">
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('no_automatic_bank_sync')}</strong>{' '}
                      {t('your_bank_would_need_to_send')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">
                        {' '}
                        {t('no_server_side_ai_categorization')}{' '}
                      </strong>{' '}
                      {t('we_cannot_read_your_transactions_to')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">
                        {t('password_recovery_is_impossible')}
                      </strong>{' '}
                      {t('we_do_not_have_your_encryption')}{' '}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-foreground/45 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">{t('manual_entry_required')}</strong>{' '}
                      {t('budgero_has_autofill_rules_and_smart')}{' '}
                    </span>
                  </li>
                </ul>
                <p className="mt-6 text-sm text-foreground/55">
                  {' '}
                  {t('these_are_intentional_design_decisions_not')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {' '}
                  {t('try_zero_knowledge_budgeting_free_for')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  {' '}
                  {t('no_credit_card_required_your_data')}{' '}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                >
                  <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=encrypted-budgeting&utm_content=final">
                    {' '}
                    {t('start_free_trial')} <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {t('want_full_control')}{' '}
                  <Link href="/self-hostable" className="underline hover:text-foreground">
                    {' '}
                    {t('self_host_budgero')}{' '}
                  </Link>{' '}
                  {t('on_your_own_infrastructure')}{' '}
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
