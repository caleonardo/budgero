import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Server, Shield, Terminal, Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestimonialsSection } from '@/components/landing/Testimonials';
import { pricing } from '@/lib/pricing';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Self-Hosted YNAB Alternative — Docker, NAS, Free | Budgero',
  description:
    'The free, self-hosted YNAB alternative. Zero-based budgeting with 168 currencies and end-to-end encryption, running on your own Docker server. No subscription, no license keys, no feature gating, no telemetry.',
  keywords: [
    'self hosted ynab alternative',
    'self-hosted ynab alternative',
    'ynab alternative docker',
    'ynab alternative self hosted',
    'ynab replacement self hosted',
    'self hosted budgeting app',
    'docker budgeting app',
    'self host budgeting',
    'free ynab alternative',
    'ynab alternative no subscription',
    'ynab alternative no license',
    'ynab alternative no telemetry',
    'private ynab alternative',
  ],
  alternates: { canonical: 'https://budgero.app/self-hosted-ynab-alternative' },
  openGraph: {
    title: 'Self-Hosted YNAB Alternative — Docker, NAS, Free | Budgero',
    description:
      'The free, self-hosted YNAB alternative. Zero-based budgeting with multi-currency support, running on your own Docker server. No subscription, no license keys, no telemetry.',
    url: 'https://budgero.app/self-hosted-ynab-alternative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Self-Hosted YNAB Alternative — Docker, NAS, Free | Budgero',
    description:
      'Zero-based budgeting. Multi-currency. Your server, your rules. Free forever with Docker.',
  },
};

const comparisonData = [
  {
    feature: 'Where your data lives',
    budgero: 'Your server',
    ynab: 'YNAB servers (US)',
    budgeroNote: 'You control backups, location, retention',
    ynabNote: 'US jurisdiction, their retention',
  },
  {
    feature: 'Price',
    budgero: 'Free forever',
    ynab: '$109/year',
    budgeroNote: 'Pay for your VPS (~€5/mo)',
    ynabNote: null,
  },
  {
    feature: 'Deployment',
    budgero: 'Docker / docker-compose',
    ynab: 'N/A (SaaS only)',
    budgeroNote: 'Single container, 5-minute setup',
    ynabNote: null,
  },
  {
    feature: 'Source code',
    budgero: 'Open source',
    ynab: 'Closed-source',
    budgeroNote: 'Open source on GitHub (AGPL-3.0), free Docker image, no license keys',
    ynabNote: 'SaaS only, no binaries',
  },
  {
    feature: 'Zero-based budgeting',
    budgero: true,
    ynab: true,
    budgeroNote: null,
    ynabNote: null,
  },
  {
    feature: 'Multi-currency',
    budgero: '168 currencies',
    ynab: false,
    budgeroNote: 'Live FX rates, auto conversion',
    ynabNote: 'One currency per budget',
  },
  {
    feature: 'Offline mode',
    budgero: true,
    ynab: false,
    budgeroNote: 'PWA, full offline support',
    ynabNote: 'Requires internet',
  },
  {
    feature: 'End-to-end encryption',
    budgero: true,
    ynab: false,
    budgeroNote: 'Even on your own server',
    ynabNote: 'Plaintext',
  },
  {
    feature: 'YNAB data import',
    budgero: true,
    ynab: 'N/A',
    budgeroNote: 'Full transaction + category history',
    ynabNote: null,
  },
  {
    feature: 'Account ownership when you stop paying',
    budgero: 'N/A — no subscription',
    ynab: false,
    budgeroNote: 'Always yours',
    ynabNote: 'Lose access',
  },
  {
    feature: 'Multi-user / shared budget',
    budgero: true,
    ynab: true,
    budgeroNote: 'Up to 5 users on shared server',
    ynabNote: 'Up to 6 users',
  },
  {
    feature: 'Update cadence',
    budgero: 'You decide',
    ynab: 'YNAB decides',
    budgeroNote: 'docker pull when ready',
    ynabNote: 'Forced updates',
  },
];

const faqs = [
  {
    q: 'Is Budgero open source?',
    a: 'Yes — Budgero is open source under the AGPL-3.0, an OSI-approved license. The full source code is public on GitHub: you can read, audit, modify, self-host, redistribute — and contribute to — it; the AGPL\'s condition is that offering a modified version over a network requires sharing your modified source with its users. Self-hosters get a free Docker image with the full feature set, no license keys, and no feature gating, running on your own infrastructure under your control. Because the code is open source, what you run today keeps working regardless of what happens to the company.',
  },
  {
    q: 'How do I self-host Budgero?',
    a: 'Pull the Docker image, copy the example docker-compose.yml, set a few environment variables (database URL, JWT secret, base URL), and docker compose up. Typical setup is under 10 minutes on a fresh VPS. There is a full walkthrough in the self-host documentation.',
  },
  {
    q: 'What hardware do I need to self-host?',
    a: 'Very little. Budgero runs comfortably on any VPS with 1 vCPU and 1 GB of RAM. A €4–€6/month DigitalOcean, Hetzner, or OVH droplet is more than enough for a household. Raspberry Pi 4 also works.',
  },
  {
    q: 'Is the self-hosted version as fully-featured as Cloud?',
    a: 'Yes. Self-host is the same codebase as Cloud. You get zero-based budgeting, 168-currency multi-currency support, end-to-end encryption, offline PWA, YNAB import, shared budgets, AI-powered categorization (bring your own LLM or local Ollama), the push API, and everything else. The only difference is we do not manage the hosting, updates, or backups for you.',
  },
  {
    q: 'What if I want to stop self-hosting later?',
    a: 'Export your data from self-hosted Budgero, then import it directly into Budgero Cloud. There is no lock-in in either direction. Your encrypted SQLite database is yours, in a standard format.',
  },
  {
    q: 'How do backups work?',
    a: "Self-host backups are your responsibility. Budgero's database is a single SQLite file (encrypted end-to-end with your key), so backup is as simple as scheduling a nightly copy to S3, Backblaze B2, or another server. The documentation includes a sample backup script. Because data is encrypted client-side, your backup storage provider cannot see your financial data even if they wanted to.",
  },
  {
    q: 'Can I use a custom domain?',
    a: "Yes. Point your domain at your server, put a reverse proxy (Caddy, Traefik, nginx) in front of Budgero, and you get a TLS-terminated, custom-domain deployment. The documentation has reference configs for Caddy and Traefik.",
  },
  {
    q: 'Will there be updates and new features?',
    a: "Yes. We ship new features continuously to the main branch, and tag stable Docker images. Self-hosters pull the latest image on their own schedule. You will never be forced to update, but you also will not miss out on improvements if you want them.",
  },
  {
    q: 'Can I import my YNAB budget into self-hosted Budgero?',
    a: 'Yes. Budgero ingests YNAB export files directly — categories, transactions, budget groups, accounts, history. Same import flow as Cloud. Takes about 5 minutes.',
  },
  {
    q: 'How does self-hosted Budgero compare to Actual Budget?',
    a: "Actual Budget is the other major self-hosted, open-source YNAB-style app. We like Actual and think it is a great project. The differences most people care about: Budgero supports 168 currencies natively in a single budget with live FX rates (Actual is largely single-currency). Budgero includes end-to-end encryption with zero-knowledge server architecture. Budgero ships a fully managed Cloud option if you ever stop wanting to run servers yourself. If you only need single-currency budgeting on your own box, Actual is a fine choice. If you need multi-currency or want a Cloud fallback, Budgero is the better fit.",
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

export default async function SelfHostedYnabAlternativePage(
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
  const t = await getTranslations('self_hosted_ynab_alternative');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero Self-Host',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Linux', 'Docker', 'Web'],
        url: 'https://budgero.app/self-hosted-ynab-alternative',
        description:
          'Self-hosted YNAB alternative. Zero-based budgeting with 168-currency multi-currency support and end-to-end encryption, deployed via Docker to your own server. Free forever.',
        offers: [
          {
            '@type': 'Offer',
            name: 'Budgero Self-Host',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            description: 'Run Budgero on your own server with Docker. No subscription.',
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
          'Self-hosted with Docker',
          'Zero-based budgeting',
          '168-currency multi-currency support',
          'End-to-end encryption (AES-256-GCM)',
          'Offline PWA',
          'YNAB import',
          'Shared budgets',
          'Custom-domain deployment',
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
            name: 'Self-Hosted YNAB Alternative',
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
                  <Server className="w-3.5 h-3.5 mr-2" /> {t('self_hosted_docker_free_forever')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_self_hosted_ynab_alternative')} <span className="block text-2xl md:text-3xl mt-3 text-foreground/70 font-medium"> {t('your_server_your_data_zero_subscription')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"> {t('budgero_is_a_zero_based_budgeting')} </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <a href="#deploy"> {t('deploy_in_5_minutes')} <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=hero-cloud"> {t('try_cloud_first')} </a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-foreground/60"> {t('free_forever_docker_single_container_import')} </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why self-host */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_self_host_a_budgeting_app')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('your_budget_is_one_of_the')} </p>

                <div className="space-y-4">
                  <p>
                    <strong className="text-foreground">{t('no_vendor_can_raise_your_price')}</strong>{' '} {t('ynab_has_raised_prices_multiple_times')} </p>
                  <p>
                    <strong className="text-foreground"> {t('no_vendor_can_lose_access_to')} </strong>{' '} {t('cancel_ynab_and_you_lose_your')} </p>
                  <p>
                    <strong className="text-foreground"> {t('no_vendor_can_be_breached_with')} </strong>{' '} {t('if_your_budget_lives_on_your')} </p>
                  <p>
                    <strong className="text-foreground"> {t('no_vendor_decides_your_feature_roadmap')} </strong>{' '} {t('you_update_when_you_want_to')} </p>
                  <p>
                    <strong className="text-foreground">{t('no_ongoing_subscription')}</strong> {t('you_pay_for_the_vps_or')} </p>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Deploy Section */}
            <section id="deploy" className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-[#111c34]/10 text-[#111c34] dark:text-slate-200 border-[#111c34]/30">
                  <Terminal className="w-3.5 h-3.5 mr-2" /> {t('5_minute_deploy')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('deploy_budgero_in_5_minutes')} </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto"> {t('if_you_can_run_a_docker')} </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('spin_up_a_server')} </h3>
                    <p className="text-foreground/70"> {t('any_linux_vps_with_docker_installed')} </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('drop_in_docker_compose_yml')} </h3>
                    <p className="text-foreground/70 mb-3"> {t('a_minimal_compose_file_looks_like')} </p>
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
                    <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('bring_it_up')} </h3>
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
                    <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('point_a_domain_add_tls')} </h3>
                    <p className="text-foreground/70"> {t('put_caddy_or_traefik_in_front')} </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg font-bold text-foreground">5</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('import_your_ynab_data')} </h3>
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
                  <Link href="/self-hostable"> {t('read_the_full_self_host_guide')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Comparison Table */}
            <section className="py-16 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('budgero_self_host_vs_ynab')} </h2>
                <p className="text-lg text-foreground/70"> {t('feature_by_feature_the_tradeoffs_of')} </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-muted/35">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-foreground"> {t('feature')} </th>
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
                  <Link href="/self-hostable"> {t('get_the_self_host_guide')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <span className="text-sm text-foreground/60">
                  Or{' '}
                  <a
                    href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=mid-table"
                    className="underline hover:text-foreground"
                  > {t('try_cloud_free_for_35_days')} </a>
                </span>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why Budgero specifically */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('why_budgero_over_other_self_hosted')} </h2>
              <div className="space-y-6 text-lg text-foreground/75 leading-relaxed">
                <p> {t('if_you_have_been_researching_self')} </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Package className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('multi_currency_done_right')} </h3>
                      <p className="text-foreground/75"> {t('most_self_hosted_budgeting_apps_are')} </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('end_to_end_encryption_even_on')} </h3>
                      <p className="text-foreground/75"> {t('budgero_encrypts_data_client_side_with')} </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Server className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('cloud_fallback_if_you_ever_stop')} </h3>
                      <p className="text-foreground/75"> {t('with_actual_or_firefly_if_you')} {pricing.monthly}{t('month_same_app_same_features_fully')} </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Terminal className="w-6 h-6 text-[#2f6246] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-lg"> {t('genuinely_simple_deploy')} </h3>
                      <p className="text-foreground/75"> {t('single_docker_image_sqlite_by_default')} </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Who This Is For */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8"> {t('should_you_self_host_budgero')} </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#e8f0e8] rounded-2xl p-8 border border-[#bfd7c2]">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> {t('self_host_if_you')} </h3>
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
                    <X className="w-6 h-6 text-foreground/35" /> {t('try_cloud_instead_if_you')} </h3>
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
                  <p className="mt-6 text-sm text-foreground/55"> {t('good_news_the_app_is_identical')} </p>
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
                  <Download className="w-3.5 h-3.5 mr-2" /> {t('free_forever_on_your_own_server')} </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6"> {t('budget_on_your_own_box')} </h2>
                <p className="text-lg text-foreground/70 mb-8"> {t('pull_the_image_start_the_container')} </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-lg bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
                  >
                    <Link href="/self-hostable"> {t('read_the_self_host_guide')} <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg border-border/80"
                  >
                    <a href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hosted-ynab-alternative&utm_content=final-cloud"> {t('prefer_cloud_try_free')} </a>
                  </Button>
                </div>
                <p className="mt-6 text-sm text-foreground/60"> {t('also_see')}{' '}
                  <Link href="/vs-ynab" className="underline hover:text-foreground"> {t('full_budgero_vs_ynab_comparison')} </Link>{' '}·{' '}
                  <Link
                    href="/ynab-alternative-europe"
                    className="underline hover:text-foreground"
                  > {t('ynab_alternative_for_europe')} </Link>{' '}·{' '}
                  <Link
                    href="/best-ynab-alternatives"
                    className="underline hover:text-foreground"
                  > {t('best_ynab_alternatives_in_2026')} </Link>{' '}·{' '}
                  <Link
                    href="/firefly-iii-alternative"
                    className="underline hover:text-foreground"
                  > {t('firefly_iii_alternative')} </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
