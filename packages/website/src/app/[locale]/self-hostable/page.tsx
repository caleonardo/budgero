import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import {
  Server,
  Shield,
  Lock,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Cloud,
  Database,
  Globe,
  Key,
  BookOpen,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SelfHostInstaller from '@/components/landing/SelfHostInstaller';
import { TrackedLink } from '@/components/TrackedLink';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Self-Hosted Budgeting App — Docker, NAS & Homelab | Budgero',
  description:
    'A self-hosted budgeting app you can run on your own server, NAS, Raspberry Pi, or homelab via Docker. Zero-knowledge encryption, 168 currencies, full feature set — free forever, no license, no feature gating.',
  keywords: [
    'self hosted budgeting app',
    'self hosted budget app',
    'self host budgeting software',
    'self hosted finance app',
    'self hosted budgero',
    'budget app docker',
    'budget app nas',
    'budget app synology',
    'budget app unraid',
    'budget app qnap',
    'budget app raspberry pi',
    'budget app home server',
    'budget app homelab',
    'run your own budget server',
    'privacy budget app',
    'no telemetry budget app',
    'no license budget app',
  ],
  alternates: { canonical: 'https://budgero.app/self-hostable' },
  openGraph: {
    title: 'Self-Hosted Budgeting App — Docker, NAS & Homelab | Budgero',
    description:
      'Run a self-hosted budgeting app on your own server, NAS, or homelab via Docker. Zero-knowledge encryption, 168 currencies, full feature set — free forever.',
    url: 'https://budgero.app/self-hostable',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Self-Hosted Budgeting App — Docker, NAS & Homelab | Budgero',
    description:
      'Run a self-hosted budgeting app on your own server, NAS, or homelab. Zero-knowledge encryption, 168 currencies, full feature set — free forever.',
  },
};

const features = [
  {
    icon: Server,
    title: 'Your Infrastructure',
    description:
      'Run Budgero on your own server, NAS, Raspberry Pi, or any cloud provider you trust.',
  },
  {
    icon: Shield,
    title: 'Zero-Knowledge Encryption',
    description:
      'Your data is encrypted with your master password. Even on your own server, data stays protected.',
  },
  {
    icon: Database,
    title: 'Own Your Data',
    description: 'Complete data ownership. Back up, migrate, or export anytime. No vendor lock-in.',
  },
  {
    icon: Globe,
    title: 'Access Anywhere',
    description: 'Access your budget from any device through your self-hosted instance.',
  },
  {
    icon: Lock,
    title: 'No Third Parties',
    description: 'Your financial data never touches external servers. Complete privacy by design.',
  },
  {
    icon: RefreshCw,
    title: 'Import from YNAB',
    description:
      'Easily import your existing YNAB budget. Keep your categories, transactions, and history.',
  },
];

const whySelfHost = [
  'Full feature parity with Budgero Cloud',
  'Run on your home server, NAS, or VPS',
  'Maximum control, zero vendor lock-in',
  'Air-gapped deployment option',
  'You manage updates and backups',
  'You handle security and uptime',
];

const faqs = [
  {
    q: 'What hardware do I need to self-host Budgero?',
    a: "Anything that runs Docker. A Raspberry Pi 4 (4GB+) is enough for a single user. A NAS, a small home server, or a $5/month VPS will comfortably handle a household. Budgero is a small Go binary and a SQLite-backed database — there is no Postgres, no Redis, no message queue, no Java. Resource use stays under 200MB of RAM in normal operation.",
  },
  {
    q: 'Can I run Budgero on a Synology, Unraid, or QNAP NAS?',
    a: "Yes. Synology DSM, Unraid, QNAP Container Station, and TrueNAS all run the official Budgero Docker image without modification. You point a single port at the container, mount a persistent volume for the SQLite database, and you are done. The full setup guide covers the NAS-specific paths.",
  },
  {
    q: 'Does self-hosted Budgero work on a Raspberry Pi?',
    a: "Yes — Budgero ships multi-arch Docker images (linux/amd64 and linux/arm64), so a Raspberry Pi 4 or 5 works out of the box. A Pi Zero 2 W will technically run it, but for responsiveness a Pi 4 is recommended.",
  },
  {
    q: 'Does Budgero need HTTPS?',
    a: "Yes — for any deployment beyond localhost, Budgero needs to be served over HTTPS. The zero-knowledge encryption runs in the browser via the Web Crypto API (window.crypto.subtle), which browsers only expose in secure contexts (HTTPS, or http://localhost). For LAN-wide or remote access the easiest path is a reverse proxy with automatic Let's Encrypt — Caddy is the simplest, Traefik and Nginx Proxy Manager also work well. If you'd rather skip certs entirely, Tailscale (HTTPS MagicDNS) and Cloudflare Tunnel both terminate TLS for you and require no port forwarding.",
  },
  {
    q: 'How do I back up my self-hosted Budgero data?',
    a: "All data lives in a single SQLite file inside the volume you mounted. Snapshot the volume, copy the file with `docker cp`, or use any standard SQLite backup tool. Because Budgero is end-to-end encrypted on the device, even if you store backups in third-party cloud storage, the contents stay encrypted under your master password.",
  },
  {
    q: 'How do updates work for self-hosted Budgero?',
    a: "Pull the latest Docker image and restart the container. Database migrations run automatically on startup. The app shows a dismissable notice when a newer release is available, but you decide when to upgrade — the running container will keep working on the version you deployed for as long as you want. The Self-Hostable changelog is published alongside Cloud releases.",
  },
  {
    q: 'Can I run Budgero air-gapped (fully offline)?',
    a: "Yes. There is no telemetry, no license check, no analytics. The only routine outbound call is a daily update check against budgero.app that carries the version number of your install and nothing else — set UPDATE_CHECK_DISABLED=true and it never fires, with no loss of functionality. Optional currency exchange rates (a free public dataset on the jsDelivr CDN, no API key) are the only other outbound call — and CURRENCY_API_BASE_URL can point them at your own mirror. You can run Budgero on a fully isolated network indefinitely.",
  },
  {
    q: 'How do I import my YNAB data into self-hosted Budgero?',
    a: "Export your YNAB budget as CSV and use the import flow inside Budgero. Categories, transactions, and account structure come across. The import preview lets you confirm before anything is written, so you can iterate until the mapping is right.",
  },
  {
    q: 'What about authentication and multi-user access?',
    a: "Self-hosted Budgero handles authentication locally. You create accounts directly on your instance, and each user has their own encrypted workspace. For households, you can run a shared instance and invite household members. There is no SSO out of the box, but the auth layer is designed so you can put it behind your own reverse proxy (Authelia, Authentik, Tailscale) if you want.",
  },
  {
    q: 'Is Budgero open source?',
    a: "Yes. Budgero is open source under the AGPL-3.0, an OSI-approved license — the same license used by Firefly III. The full source code is published on GitHub: you can read, audit, modify, self-host, redistribute — and contribute to — it; the AGPL's one condition is that if you offer a modified version over a network, you must share your modified source with its users. We are a small commercial project funded by the Cloud edition; self-hosters get a free Docker image with the full feature set, no license keys, no feature gating, and no telemetry beyond a disable-able daily update check (a version number, nothing else). Because the code is open source, your ability to keep running Budgero doesn't depend on our continued operation.",
  },
];

export default async function SelfHostablePage(
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
  const t = await getTranslations('self_hostable');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: 'Budgero Self-Hosted',
        applicationCategory: 'FinanceApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux', 'Docker'],
        url: 'https://budgero.app/self-hostable',
        downloadUrl: 'https://budgero.app/self-hostable',
        description:
          'Self-hosted budgeting application with zero-knowledge encryption. Run on your own infrastructure via Docker — NAS, Raspberry Pi, homelab, or VPS.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2026-12-31',
        },
        featureList: [
          'Self-hosted deployment',
          'Zero-knowledge encryption',
          'Complete data ownership',
          'Docker support (linux/amd64, linux/arm64)',
          'NAS, Raspberry Pi, homelab, VPS friendly',
          'Air-gapped deployment',
          'YNAB import',
          'Multi-currency (168)',
          'Cross-platform (Windows, macOS, Linux)',
        ],
        softwareVersion: '1.4.11',
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
            name: 'Self-Hosted Budgeting App',
            item: 'https://budgero.app/self-hostable',
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
            {/* Hero Section */}
            <section className="pt-24 pb-16 md:pt-32 md:pb-20 text-center">
              <div className="max-w-4xl mx-auto">
                <Badge
                  variant="outline"
                  className="mb-6 px-4 py-1.5 text-sm font-medium border-[#111c34]/30 text-[#111c34] bg-[#111c34]/10"
                >
                  <Server className="w-3.5 h-3.5 mr-2" /> {t('self_hostable')} </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"> {t('the_self_hosted_budgeting_app')} <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium"> {t('run_budgero_on_your_own_server')} </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-6 max-w-2xl mx-auto leading-relaxed">
                  <strong>{t('same_engine_same_features_same_sync')}</strong>
                </p>

                <p className="text-base text-foreground/60 mb-10 max-w-xl mx-auto"> {t('no_analytics_no_tracking_the_only')} </p>

                {/* Install Command */}
                <SelfHostInstaller />

                {/* Setup Guide Link */}
                <p className="mt-6 text-sm text-foreground/60"> {t('need_help')}{' '}
                  <TrackedLink
                    href="/docs/self-hosting-guide"
                    event="Self-Host - Setup Guide (Hero)"
                    className="inline-flex items-center gap-1 text-foreground hover:underline font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {t('read_the_full_setup_guide')} </TrackedLink>
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why Self-Host Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('why_self_host')} </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto"> {t('maximum_privacy_and_control_over_your')} </p>
              </div>

              <div className="bg-muted/25 rounded-2xl p-8 border border-border/70">
                <ul className="grid md:grid-cols-2 gap-4">
                  {whySelfHost.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Self-host vs Cloud comparison note */}
              <div className="mt-8 p-6 bg-muted/35 rounded-xl border border-border/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center flex-shrink-0">
                    <Key className="w-5 h-5 text-[#3f4756]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2"> {t('what_you_take_on')} </h3>
                    <p className="text-sm text-foreground/70 mb-3"> {t('same_product_different_responsibilities')} </p>
                    <ul className="text-sm text-foreground/70 space-y-1">
                      <li>• <strong>{t('authentication')}</strong> {t('you_manage_users_locally')} </li>
                      <li>• <strong>{t('infrastructure')}</strong> {t('you_handle_servers_uptime_backups')} </li>
                      <li>• <strong>{t('updates')}</strong> {t('you_apply_security_patches_and_upgrades')} </li>
                      <li>• <strong>{t('api_keys')}</strong> {t('you_provide_your_own_for_currency')} </li>
                    </ul>
                    <TrackedLink
                      href="/docs/self-hosting-guide"
                      event="Self-Host - Setup Guide (What You Take On)"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-foreground hover:underline font-medium"
                    >
                      <BookOpen className="w-4 h-4" /> {t('view_the_complete_setup_guide')} <ArrowRight className="w-3 h-3" />
                    </TrackedLink>
                  </div>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Features Grid */}
            <section className="py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4"> {t('full_featured_self_hosting')} </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto"> {t('everything_from_budgero_cloud_running_on')} </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl p-6 border border-border/70 hover:border-border transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-[#3f4756]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10"> {t('self_hosting_faq')} </h2>
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

            {/* Donations */}
            <section className="py-12 max-w-2xl mx-auto text-center">
              <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#3f4756]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3"> {t('free_forever_donations_welcome')} </h2>
              <p className="text-foreground/70 mb-6 leading-relaxed"> {t('self_host_has_no_license_no')} </p>
              <TrackedLink
                href="/donate"
                event="Self-Host - Donate"
                className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
              >
                <Heart className="w-4 h-4" /> {t('support_budgero')} <ArrowRight className="w-3.5 h-3.5" />
              </TrackedLink>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Related comparisons — internal linking to consolidate topical authority */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3"> {t('related_comparisons')} </h2>
              <p className="text-foreground/65 mb-8"> {t('if_you_re_evaluating_self_host')} </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="/self-hosted-ynab-alternative"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">{t('self_hosted_ynab_alternative')}</h3>
                  <p className="text-sm text-foreground/65"> {t('ynab_specific_comparison_feature_parity_import')} </p>
                </a>
                <a
                  href="/vs-ynab"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">{t('budgero_vs_ynab')}</h3>
                  <p className="text-sm text-foreground/65"> {t('side_by_side_feature_comparison_privacy')} </p>
                </a>
                <a
                  href="/monarch-money-alternative"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">{t('monarch_money_alternative')}</h3>
                  <p className="text-sm text-foreground/65"> {t('for_people_leaving_monarch_multi_currency')} </p>
                </a>
                <a
                  href="/best-ynab-alternatives"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">{t('best_ynab_alternatives_in_2026')}</h3>
                  <p className="text-sm text-foreground/65"> {t('six_budgeting_apps_compared_on_price')} </p>
                </a>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Browser Alternative Section */}
            <section className="py-16 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4"> {t('prefer_managed_cloud')} </h2>
              <p className="text-lg text-foreground/70 mb-8"> {t('if_you_prefer_zero_setup_start')} </p>
              <Button
                asChild
                size="lg"
                className="h-12 px-6 bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
              >
                <TrackedLink
                  href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hostable&utm_content=cloud-trial"
                  event="Self-Host - Cloud Trial"
                  external
                > {t('start_cloud_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                </TrackedLink>
              </Button>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Cloud Alternative - calm anchor */}
            <section className="py-12 max-w-2xl mx-auto text-center">
              <p className="text-foreground/70"> {t('prefer_zero_setup')}{' '}
                <TrackedLink
                  href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hostable&utm_content=cloud-inline"
                  event="Self-Host - Cloud CTA"
                  external
                  className="text-foreground hover:underline font-medium"
                > {t('budgero_cloud')} </TrackedLink>{' '} {t('handles_infrastructure_backups_and_updates_for')} </p>
              <p className="mt-4 text-sm text-foreground/60"> {t('coming_from_ynab')}{' '}
                <a
                  href="/self-hosted-ynab-alternative"
                  className="underline hover:text-foreground"
                > {t('see_the_self_hosted_ynab_alternative')} </a>.
                              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
