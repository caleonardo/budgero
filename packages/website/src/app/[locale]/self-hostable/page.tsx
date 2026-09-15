import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import {
  Server,
  Shield,
  Lock,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
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
  const t = await getTranslations({ locale, namespace: 'self_hostable' });
  return withLocalizedUrls(locale, '/self-hostable', {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      copy('u_dc9fc9ab6d5f'),
      copy('u_9a105bc1fc12'),
      copy('u_056fa22c0125'),
      copy('u_12143508efa9'),
      copy('u_ab0088d17ce2'),
      copy('u_7bd38e7af83c'),
      copy('u_30df1d445757'),
      copy('u_085ba634a0bd'),
      copy('u_4d64f8080cd1'),
      copy('u_198699825b54'),
      copy('u_e97b150cca85'),
      copy('u_aa57fde274df'),
      copy('u_d6f47ccb23ca'),
      copy('u_950604bce53d'),
      copy('u_f574c2cca450'),
      copy('u_b29b47534e54'),
      copy('u_821b5cd0b207'),
    ],
    alternates: { canonical: 'https://budgero.app/self-hostable' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/self-hostable',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('tw_description'),
    },
  });
}

const makeFeatures = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    icon: Server,
    title: t('features_your_infrastructure'),
    description: t('features_run_budgero_on_your_own_server'),
  },
  {
    icon: Shield,
    title: t('features_zero_knowledge_encryption'),
    description: t('features_your_data_is_encrypted_with_your'),
  },
  {
    icon: Database,
    title: t('features_own_your_data'),
    description: t('features_complete_data_ownership_back_up_migrate'),
  },
  {
    icon: Globe,
    title: t('features_access_anywhere'),
    description: t('features_access_your_budget_from_any_device'),
  },
  {
    icon: Lock,
    title: t('features_no_third_parties'),
    description: t('features_your_financial_data_never_touches_external'),
  },
  {
    icon: RefreshCw,
    title: t('features_import_from_ynab'),
    description: t('features_easily_import_your_existing_ynab_budget'),
  },
];

const makeWhySelfHost = (t: (key: string, values?: Record<string, string | number>) => string) => [
  t('whySelfHost_full_feature_parity_with_budgero_cloud'),
  t('whySelfHost_run_on_your_home_server_nas'),
  t('whySelfHost_maximum_control_zero_vendor_lock_in'),
  t('whySelfHost_air_gapped_deployment_option'),
  t('whySelfHost_you_manage_updates_and_backups'),
  t('whySelfHost_you_handle_security_and_uptime'),
];

const makeFaqs = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    q: t('faqs_what_hardware_do_i_need_to'),
    a: t('faqs_anything_that_runs_docker_a_raspberry'),
  },
  {
    q: t('faqs_can_i_run_budgero_on_a'),
    a: t('faqs_yes_synology_dsm_unraid_qnap_container'),
  },
  {
    q: t('faqs_does_self_hosted_budgero_work_on'),
    a: t('faqs_yes_budgero_ships_multi_arch_docker'),
  },
  {
    q: t('faqs_does_budgero_need_https'),
    a: t('faqs_yes_for_any_deployment_beyond_localhost'),
  },
  {
    q: t('faqs_how_do_i_back_up_my'),
    a: t('faqs_all_data_lives_in_a_single'),
  },
  {
    q: t('faqs_how_do_updates_work_for_self'),
    a: t('faqs_pull_the_latest_docker_image_and'),
  },
  {
    q: t('faqs_can_i_run_budgero_air_gapped'),
    a: t('faqs_yes_there_is_no_telemetry_no'),
  },
  {
    q: t('faqs_how_do_i_import_my_ynab'),
    a: t('faqs_export_your_ynab_budget_as_csv'),
  },
  {
    q: t('faqs_what_about_authentication_and_multi_user'),
    a: t('faqs_self_hosted_budgero_handles_authentication_local'),
  },
  {
    q: t('faqs_is_budgero_open_source'),
    a: t('faqs_yes_budgero_is_open_source_under'),
  },
];

export default async function SelfHostablePage({
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
    namespace: 'self_hostable',
  });
  const faqs = makeFaqs(t);
  const whySelfHost = makeWhySelfHost(t);
  const features = makeFeatures(t);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        image: 'https://budgero.app/logo_512.png',
        name: copy('u_7cf9467f6815'),
        applicationCategory: 'FinanceApplication',
        operatingSystem: [
          copy('u_d598026a9cbc'),
          copy('u_aed6b7aa2a05'),
          copy('u_4828e60247c1'),
          copy('u_e6169e958b37'),
        ],
        url: 'https://budgero.app/self-hostable',
        downloadUrl: 'https://budgero.app/self-hostable',
        description: copy('u_2e58e71913f1'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2026-12-31',
        },
        featureList: [
          copy('u_abb13d06fba7'),
          copy('u_699441c94b63'),
          copy('u_4b236d9c7981'),
          copy('u_bf5f60c57efe'),
          copy('u_c4642b68ad3b'),
          copy('u_294a238d5258'),
          copy('u_170eda937fe7'),
          copy('u_343130a2ccf0'),
          copy('u_6eebee621516'),
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
          {
            '@type': 'ListItem',
            position: 1,
            name: copy('u_3a78695388b3'),
            item: 'https://budgero.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy('u_81cb4c8c6058'),
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
                  <Server className="w-3.5 h-3.5 mr-2" /> {t('self_hostable')}{' '}
                </Badge>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                  {' '}
                  {t('the_self_hosted_budgeting_app')}{' '}
                  <span className="block text-2xl md:text-3xl mt-2 text-foreground/70 font-medium">
                    {' '}
                    {t('run_budgero_on_your_own_server')}{' '}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/70 mb-6 max-w-2xl mx-auto leading-relaxed">
                  <strong>{t('same_engine_same_features_same_sync')}</strong>
                </p>

                <p className="text-base text-foreground/60 mb-10 max-w-xl mx-auto">
                  {' '}
                  {t('no_analytics_no_tracking_the_only')}{' '}
                </p>

                {/* Install Command */}
                <SelfHostInstaller />

                {/* Setup Guide Link */}
                <p className="mt-6 text-sm text-foreground/60">
                  {' '}
                  {t('need_help')}{' '}
                  <TrackedLink
                    href="/docs/self-hosting-guide"
                    event="Self-Host - Setup Guide (Hero)"
                    className="inline-flex items-center gap-1 text-foreground hover:underline font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {t('read_the_full_setup_guide')}{' '}
                  </TrackedLink>
                </p>
                <p className="mt-4 text-sm text-foreground/60">
                  {' '}
                  {copy('u_6effe0316336')}{' '}
                  <TrackedLink
                    href="/donate"
                    event="Self-Host - Donate (Hero)"
                    className="text-foreground underline underline-offset-4 hover:text-foreground/70"
                  >
                    {' '}
                    {copy('u_ba83cd6321c5')}{' '}
                  </TrackedLink>
                  .
                </p>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Why Self-Host Section */}
            <section className="py-16 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('why_self_host')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  {' '}
                  {t('maximum_privacy_and_control_over_your')}{' '}
                </p>
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
                    <h3 className="font-semibold text-foreground mb-2">
                      {' '}
                      {t('what_you_take_on')}{' '}
                    </h3>
                    <p className="text-sm text-foreground/70 mb-3">
                      {' '}
                      {t('same_product_different_responsibilities')}{' '}
                    </p>
                    <ul className="text-sm text-foreground/70 space-y-1">
                      <li>
                        • <strong>{t('authentication')}</strong>{' '}
                        {t('you_manage_users_locally')}{' '}
                      </li>
                      <li>
                        • <strong>{t('infrastructure')}</strong>{' '}
                        {t('you_handle_servers_uptime_backups')}{' '}
                      </li>
                      <li>
                        • <strong>{t('updates')}</strong>{' '}
                        {t('you_apply_security_patches_and_upgrades')}{' '}
                      </li>
                      <li>
                        • <strong>{t('api_keys')}</strong>{' '}
                        {t('you_provide_your_own_for_currency')}{' '}
                      </li>
                    </ul>
                    <TrackedLink
                      href="/docs/self-hosting-guide"
                      event="Self-Host - Setup Guide (What You Take On)"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-foreground hover:underline font-medium"
                    >
                      <BookOpen className="w-4 h-4" /> {t('view_the_complete_setup_guide')}{' '}
                      <ArrowRight className="w-3 h-3" />
                    </TrackedLink>
                  </div>
                </div>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Features Grid */}
            <section className="py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {' '}
                  {t('full_featured_self_hosting')}{' '}
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  {' '}
                  {t('everything_from_budgero_cloud_running_on')}{' '}
                </p>
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
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
                {' '}
                {t('self_hosting_faq')}{' '}
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

            {/* Donations */}
            <section className="py-12 max-w-2xl mx-auto text-center">
              <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#3f4756]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {' '}
                {t('free_forever_donations_welcome')}{' '}
              </h2>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                {' '}
                {t('self_host_has_no_license_no')}{' '}
              </p>
              <TrackedLink
                href="/donate"
                event="Self-Host - Donate"
                className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
              >
                <Heart className="w-4 h-4" /> {t('support_budgero')}{' '}
                <ArrowRight className="w-3.5 h-3.5" />
              </TrackedLink>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Related comparisons — internal linking to consolidate topical authority */}
            <section className="py-16 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {' '}
                {copy('u_afa43193d15a')}{' '}
              </h2>
              <p className="text-foreground/65 mb-8"> {copy('u_572b936e663b')} </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/self-hosted-ynab-alternative"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {t('self_hosted_ynab_alternative')}
                  </h3>
                  <p className="text-sm text-foreground/65">
                    {' '}
                    {t('ynab_specific_comparison_feature_parity_import')}{' '}
                  </p>
                </Link>
                <Link
                  href="/vs-ynab"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">{t('budgero_vs_ynab')}</h3>
                  <p className="text-sm text-foreground/65">
                    {' '}
                    {t('side_by_side_feature_comparison_privacy')}{' '}
                  </p>
                </Link>
                <Link
                  href="/monarch-money-alternative"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {t('monarch_money_alternative')}
                  </h3>
                  <p className="text-sm text-foreground/65">
                    {' '}
                    {t('for_people_leaving_monarch_multi_currency')}{' '}
                  </p>
                </Link>
                <Link
                  href="/best-ynab-alternatives"
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {t('best_ynab_alternatives_in_2026')}
                  </h3>
                  <p className="text-sm text-foreground/65">
                    {' '}
                    {t('six_budgeting_apps_compared_on_price')}{' '}
                  </p>
                </Link>
              </div>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Browser Alternative Section */}
            <section className="py-16 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {' '}
                {t('prefer_managed_cloud')}{' '}
              </h2>
              <p className="text-lg text-foreground/70 mb-8">
                {' '}
                {t('if_you_prefer_zero_setup_start')}{' '}
              </p>
              <Button
                asChild
                size="lg"
                className="h-12 px-6 bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
              >
                <TrackedLink
                  href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hostable&utm_content=cloud-trial"
                  event="Self-Host - Cloud Trial"
                  external
                >
                  {' '}
                  {t('start_cloud_trial')} <ArrowRight className="w-4 h-4 ml-2" />
                </TrackedLink>
              </Button>
            </section>

            <div className="my-12 border-t border-border" aria-hidden />

            {/* Cloud Alternative - calm anchor */}
            <section className="py-12 max-w-2xl mx-auto text-center">
              <p className="text-foreground/70">
                {' '}
                {t('prefer_zero_setup')}{' '}
                <TrackedLink
                  href="https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=self-hostable&utm_content=cloud-inline"
                  event="Self-Host - Cloud CTA"
                  external
                  className="text-foreground hover:underline font-medium"
                >
                  {' '}
                  {t('budgero_cloud')}{' '}
                </TrackedLink>{' '}
                {t('handles_infrastructure_backups_and_updates_for')}{' '}
              </p>
              <p className="mt-4 text-sm text-foreground/60">
                {' '}
                {t('coming_from_ynab')}{' '}
                <Link href="/self-hosted-ynab-alternative" className="underline hover:text-foreground">
                  {' '}
                  {t('see_the_self_hosted_ynab_alternative')}{' '}
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
