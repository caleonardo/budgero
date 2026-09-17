import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check, X, Server, Shield, Terminal, Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';
import { TrackedLink } from '@/components/TrackedLink';

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
  const t = await getTranslations({ locale, namespace: 'self_hosted_ynab_alternative' });
  return withLocalizedUrls(locale, '/self-hosted-ynab-alternative', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_598d418eaa04'),
      copy('u_6faaeeed85b6'),
      copy('u_bb6b947b8525'),
      copy('u_a07fa3f555c2'),
      copy('u_3d444a38acfe'),
      copy('u_dc9fc9ab6d5f'),
      copy('u_072e8de77449'),
      copy('u_68154266b5f3'),
      copy('u_b05c62772f94'),
      copy('u_91987c6c4d13'),
      copy('u_5ee955fdc699'),
      copy('u_7305cf331288'),
      copy('u_e0d4febfb017'),
    ],
    alternates: { canonical: 'https://budgero.app/self-hosted-ynab-alternative' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/self-hosted-ynab-alternative',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makeComparisonData = (
  t: (key: string, values?: Record<string, string | number>) => string,
  copy: CopyTranslator
) => [
  {
    feature: t('comparisonData_where_your_data_lives'),
    budgero: t('comparisonData_your_server'),
    ynab: t('comparisonData_ynab_servers_us'),
    budgeroNote: t('comparisonData_you_control_backups_location_retention'),
    ynabNote: t('comparisonData_us_jurisdiction_their_retention'),
  },
  {
    feature: t('cell_price'),
    budgero: t('comparisonData_free_forever'),
    ynab: copy('u_ff027ceaf6a0'),
    budgeroNote: t('comparisonData_pay_for_your_vps_5_mo'),
    ynabNote: null,
  },
  {
    feature: copy('u_870a8ffd98f4'),
    budgero: t('comparisonData_docker_docker_compose'),
    ynab: t('comparisonData_n_a_saas_only'),
    budgeroNote: t('comparisonData_single_container_5_minute_setup'),
    ynabNote: null,
  },
  {
    feature: t('comparisonData_source_code'),
    budgero: t('comparisonData_open_source'),
    ynab: copy('u_4f2bbde16dab'),
    budgeroNote: t('comparisonData_open_source_on_github_agpl_3'),
    ynabNote: t('comparisonData_saas_only_no_binaries'),
  },
  {
    feature: t('comparisonData_zero_based_budgeting'),
    budgero: true,
    ynab: true,
    budgeroNote: null,
    ynabNote: null,
  },
  {
    feature: copy('u_e5bf6e1036a3'),
    budgero: t('comparisonData_168_currencies'),
    ynab: false,
    budgeroNote: t('comparisonData_live_fx_rates_auto_conversion'),
    ynabNote: t('comparisonData_one_currency_per_budget'),
  },
  {
    feature: t('comparisonData_offline_mode'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_pwa_full_offline_support'),
    ynabNote: t('comparisonData_requires_internet'),
  },
  {
    feature: t('comparisonData_end_to_end_encryption'),
    budgero: true,
    ynab: false,
    budgeroNote: t('comparisonData_even_on_your_own_server'),
    ynabNote: copy('u_0707c5d972a7'),
  },
  {
    feature: t('comparisonData_ynab_data_import'),
    budgero: true,
    ynab: 'N/A',
    budgeroNote: t('comparisonData_full_transaction_category_history'),
    ynabNote: null,
  },
  {
    feature: t('comparisonData_account_ownership_when_you_stop_paying'),
    budgero: t('comparisonData_n_a_no_subscription'),
    ynab: false,
    budgeroNote: t('comparisonData_always_yours'),
    ynabNote: t('comparisonData_lose_access'),
  },
  {
    feature: t('comparisonData_multi_user_shared_budget'),
    budgero: true,
    ynab: true,
    budgeroNote: t('comparisonData_up_to_5_users_on_shared'),
    ynabNote: t('comparisonData_up_to_6_users'),
  },
  {
    feature: t('comparisonData_update_cadence'),
    budgero: t('comparisonData_you_decide'),
    ynab: t('comparisonData_ynab_decides'),
    budgeroNote: t('comparisonData_docker_pull_when_ready'),
    ynabNote: t('comparisonData_forced_updates'),
  },
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_is_budgero_open_source'),
    a: t('faqs_yes_budgero_is_open_source_under'),
  },
  {
    q: t('faqs_how_do_i_self_host_budgero'),
    a: t('faqs_pull_the_docker_image_copy_the'),
  },
  {
    q: t('faqs_what_hardware_do_i_need_to'),
    a: t('faqs_very_little_budgero_runs_comfortably_on'),
  },
  {
    q: t('faqs_is_the_self_hosted_version_as'),
    a: t('faqs_yes_self_host_is_the_same'),
  },
  {
    q: t('faqs_what_if_i_want_to_stop'),
    a: t('faqs_export_your_data_from_self_hosted'),
  },
  {
    q: t('faqs_how_do_backups_work'),
    a: t('faqs_self_host_backups_are_your_responsibility'),
  },
  {
    q: t('faqs_can_i_use_a_custom_domain'),
    a: t('faqs_yes_point_your_domain_at_your'),
  },
  {
    q: t('faqs_will_there_be_updates_and_new'),
    a: t('faqs_yes_we_ship_new_features_continuously'),
  },
  {
    q: t('faqs_can_i_import_my_ynab_budget'),
    a: t('faqs_yes_budgero_ingests_ynab_export_files'),
  },
  {
    q: t('faqs_how_does_self_hosted_budgero_compare'),
    a: t('faqs_actual_budget_is_the_other_major'),
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

export default async function SelfHostedYnabAlternativePage({
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
    namespace: 'self_hosted_ynab_alternative',
  });
  const faqs = makeFaqs(t);
  const comparisonData = makeComparisonData(t, copy);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: copy('u_02c52ce2f60b'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: [copy('u_4828e60247c1'), copy('u_e6169e958b37'), copy('u_2975104784a4')],
        url: 'https://budgero.app/self-hosted-ynab-alternative',
        description: copy('u_f079999babfc'),
        offers: [
          {
            '@type': 'Offer',
            name: copy('u_02c52ce2f60b'),
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            description: copy('u_1ca537f14cc0'),
          },
          {
            '@type': 'Offer',
            name: copy('u_94523db6cbd4'),
            price: pricing.monthly.replace(/[^0-9.]/g, ''),
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
          copy('u_5e5f4a5fe879'),
          copy('u_0c3992b67600'),
          copy('u_84f3e2c6c962'),
          copy('u_42da692ff782'),
          copy('u_78bd93018b36'),
          copy('u_170eda937fe7'),
          copy('u_965742a116f6'),
          copy('u_b9bf8b197175'),
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
          {
            '@type': 'ListItem',
            position: 1,
            name: copy('u_3a78695388b3'),
            item: 'https://budgero.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy('u_fb2600bb3dcf'),
            item: 'https://budgero.app/self-hosted-ynab-alternative',
          },
        ],
      },
    ],
  };

  const composeSnippet = `services:
  budgero:
    image: ghcr.io/budgero/budgero:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: file:/data/budgero.db
      JWT_SECRET: \${JWT_SECRET}
      PUBLIC_URL: https://budgero.yourdomain.com
    volumes:
      - budgero-data:/data
    restart: unless-stopped

volumes:
  budgero-data:`;

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
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-[#564176]/30 text-[#564176] dark:text-purple-300 bg-[#564176]/10"
                >
                  <Server className="w-3.5 h-3.5 mr-2" />{' '}
                  {t('self_hosted_docker_free_forever')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('the_self_hosted_ynab_alternative')}{' '}
                  <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium">
                    {' '}
                    {t('your_server_your_data_zero_subscription')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {' '}
                  {t('budgero_is_a_zero_based_budgeting')}{' '}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="#deploy">
                      {' '}
                      {t('deploy_in_5_minutes')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=hero-cloud">
                      {' '}
                      {t('try_cloud_first')}{' '}
                    </a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  {' '}
                  {t('free_forever_docker_single_container_import')}{' '}
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why self-host */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('why_self_host_a_budgeting_app')}{' '}
              </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('your_budget_is_one_of_the')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">
                      {t('no_vendor_can_raise_your_price')}
                    </strong>{' '}
                    {t('ynab_has_raised_prices_multiple_times')}{' '}
                  </p>
                  <p>
                    <strong className="text-foreground">
                      {' '}
                      {t('no_vendor_can_lose_access_to')}{' '}
                    </strong>{' '}
                    {t('cancel_ynab_and_you_lose_your')}{' '}
                  </p>
                  <p>
                    <strong className="text-foreground">
                      {' '}
                      {t('no_vendor_can_be_breached_with')}{' '}
                    </strong>{' '}
                    {t('if_your_budget_lives_on_your')}{' '}
                  </p>
                  <p>
                    <strong className="text-foreground">
                      {' '}
                      {t('no_vendor_decides_your_feature_roadmap')}{' '}
                    </strong>{' '}
                    {t('you_update_when_you_want_to')}{' '}
                  </p>
                  <p>
                    <strong className="text-foreground">{t('no_ongoing_subscription')}</strong>{' '}
                    {t('you_pay_for_the_vps_or')}{' '}
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Deploy Section */}
            <section id="deploy" className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-[#111c34]/10 text-[#111c34] dark:text-slate-200 border-[#111c34]/30">
                  <Terminal className="w-3.5 h-3.5 mr-2" /> {t('5_minute_deploy')}{' '}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('deploy_budgero_in_5_minutes')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  {' '}
                  {t('if_you_can_run_a_docker')}{' '}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg">
                      {' '}
                      {t('spin_up_a_server')}{' '}
                    </h3>
                    <p className="text-foreground/70">
                      {' '}
                      {t('any_linux_vps_with_docker_installed')}{' '}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg">
                      {' '}
                      {t('drop_in_docker_compose_yml')}{' '}
                    </h3>
                    <p className="text-foreground/70 mb-3">
                      {' '}
                      {t('a_minimal_compose_file_looks_like')}{' '}
                    </p>
                    <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
                      <code>{composeSnippet}</code>
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">3</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg">
                      {' '}
                      {t('bring_it_up')}{' '}
                    </h3>
                    <p className="text-foreground/70 mb-3"> {t('run_one_command')} </p>
                    <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
                      <code>docker compose up -d</code>
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">4</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg">
                      {' '}
                      {t('point_a_domain_add_tls')}{' '}
                    </h3>
                    <p className="text-foreground/70"> {t('put_caddy_or_traefik_in_front')} </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">5</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg">
                      {' '}
                      {t('import_your_ynab_data')}{' '}
                    </h3>
                    <p className="text-foreground/70"> {t('export_your_ynab_budget_as_a')} </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 text-base border-border/80"
                >
                  <Link href="/self-hostable">
                    {' '}
                    {t('read_the_full_self_host_guide')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <p className="mt-5 text-sm text-foreground/70">
                  {' '}
                  {copy('u_b0e4e795e360')}{' '}
                  <TrackedLink
                    href="/donate"
                    event="Self-Host - Donate (YNAB Alternative)"
                    className="text-foreground underline underline-offset-4 hover:text-foreground/70"
                  >
                    {' '}
                    {copy('u_57e9e7d9a2b1')}{' '}
                  </TrackedLink>
                  .
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('budgero_self_host_vs_ynab')}{' '}
                </h2>
                <p className="text-lg text-foreground/70">
                  {' '}
                  {t('feature_by_feature_the_tradeoffs_of')}{' '}
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                        {' '}
                        {t('feature')}{' '}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                        {' '}
                        {t('budgero_self_host')}{' '}
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
                  <Link href="/self-hostable">
                    {' '}
                    {t('get_the_self_host_guide')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <span className="text-sm text-foreground/60">
                  {' '}
                  {copy('u_0568bd03b8eb')}{' '}
                  <a
                    href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=mid-table"
                    className="underline hover:text-foreground"
                  >
                    {' '}
                    {t('try_cloud_free_for_35_days')}{' '}
                  </a>
                </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why Budgero specifically */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('why_budgero_over_other_self_hosted')}{' '}
              </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('if_you_have_been_researching_self')} </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Package className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">
                        {' '}
                        {t('multi_currency_done_right')}{' '}
                      </h3>
                      <p className="text-foreground/75">
                        {' '}
                        {t('most_self_hosted_budgeting_apps_are')}{' '}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">
                        {' '}
                        {t('end_to_end_encryption_even_on')}{' '}
                      </h3>
                      <p className="text-foreground/75">
                        {' '}
                        {t('budgero_encrypts_data_client_side_with')}{' '}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Server className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">
                        {' '}
                        {t('cloud_fallback_if_you_ever_stop')}{' '}
                      </h3>
                      <p className="text-foreground/75">
                        {' '}
                        {t('with_actual_or_firefly_if_you')} {pricing.monthly}
                        {t('month_same_app_same_features_fully')}{' '}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Terminal className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg">
                        {' '}
                        {t('genuinely_simple_deploy')}{' '}
                      </h3>
                      <p className="text-foreground/75">
                        {' '}
                        {t('single_docker_image_sqlite_by_default')}{' '}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                {' '}
                {t('should_you_self_host_budgero')}{' '}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('self_host_if_you')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('already_run_a_homelab_or_personal')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_full_control_over_where_your')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('prefer_running_your_own_server_to')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_the_app_to_outlive_any')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('are_comfortable_running_docker_and_setting')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{t('want_to_be_responsible_for_your')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-foreground/35" />{' '}
                    {t('try_cloud_instead_if_you')}{' '}
                  </h3>
                  <ul className="space-y-3 text-foreground/70">
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span>{t('do_not_want_to_run_servers')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('want_automated_backups_updates_and_uptime')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('want_to_try_budgero_for_35')} </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="w-4 h-4 text-foreground/35 mt-1 flex-shrink-0" />
                      <span> {t('care_less_about_ownership_and_more')} </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-sm text-foreground/55">
                    {' '}
                    {t('good_news_the_app_is_identical')}{' '}
                  </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                {' '}
                {t('frequently_asked_questions')}{' '}
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

            <TestimonialsSection />

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Final CTA */}
            <section className="py-20 text-center">
              <div className="max-w-2xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" />{' '}
                  {t('free_forever_on_your_own_server')}{' '}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {' '}
                  {t('budget_on_your_own_box')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 mb-8">
                  {' '}
                  {t('pull_the_image_start_the_container')}{' '}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <Link href="/self-hostable">
                      {' '}
                      {t('read_the_self_host_guide')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=final-cloud">
                      {' '}
                      {t('prefer_cloud_try_free')}{' '}
                    </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {t('also_see')}{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground">
                    {' '}
                    {t('full_budgero_vs_ynab_comparison')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/ynab-alternative-europe" className="underline hover:text-foreground">
                    {' '}
                    {t('ynab_alternative_for_europe')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/best-ynab-alternatives" className="underline hover:text-foreground">
                    {' '}
                    {t('best_ynab_alternatives_in_2026')}{' '}
                  </Link>{' '}
                  ·{' '}
                  <Link href="/firefly-iii-alternative" className="underline hover:text-foreground">
                    {' '}
                    {t('firefly_iii_alternative')}{' '}
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
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
