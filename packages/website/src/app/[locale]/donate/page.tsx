import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { withLocalizedUrls } from '@/lib/localized-metadata';
import { Heart, ArrowRight, Star, MessageCircle, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackedLink } from '@/components/TrackedLink';

export const dynamic = 'force-static';
export const revalidate = false;

// Lemon Squeezy "pay what you want" checkout for self-host donations.
// This page is the ONLY place the checkout URL lives — the self-host app's
// About page and the website both link to budgero.app/donate, so the
// product can be swapped without re-releasing anything.
const LEMON_SQUEEZY_DONATE_URL =
  'https://store.budgero.app/checkout/buy/ea5134f6-0853-41b1-9f75-cd76e910a3a2';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'donate' });
  return withLocalizedUrls(locale, '/donate', {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: 'https://budgero.app/donate' },
    openGraph: {
      title: t('meta_title'),
      description: t('og_description'),
      url: 'https://budgero.app/donate',
      type: 'website',
    },
  });
}

const makeOtherWays = (t: (key: string, values?: Record<string, string | number>) => string) => [
  {
    icon: Star,
    title: t('otherWays_star_the_repo'),
    description: t('otherWays_a_github_star_helps_other_self'),
    href: 'https://github.com/tombadilo-bombadilo/budgero',
    event: t('otherWays_donate_github_star'),
    external: true,
  },
  {
    icon: MessageCircle,
    title: t('otherWays_join_the_community'),
    description: t('otherWays_report_bugs_request_features_or_help'),
    href: 'https://discord.gg/ZgWnzaPqae',
    event: t('otherWays_donate_discord'),
    external: true,
  },
  {
    icon: Cloud,
    title: t('otherWays_use_budgero_cloud'),
    description: t('otherWays_a_cloud_subscription_is_the_most'),
    href: 'https://my.budgero.app/auth?mode=signup&utm_source=website&utm_medium=cta&utm_campaign=donate&utm_content=cloud',
    event: t('otherWays_donate_cloud_cta'),
    external: true,
  },
];

export default async function DonatePage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations({
    locale: (await params).locale,
    namespace: 'donate',
  });
  const otherWays = makeOtherWays(t);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative mx-auto max-w-screen-2xl">
        <div className="relative z-10 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16 py-2 sm:py-4 lg:py-6">
          {/* Hero */}
          <section className="pt-24 pb-12 md:pt-32 md:pb-16 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="mx-auto mb-6 w-12 h-12 rounded-xl bg-[#d7dbe2] flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#3f4756]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
                {' '}
                {t('support_budgero')}{' '}
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 mb-4 leading-relaxed">
                {' '}
                {t('budgero_self_host_is_free_no')}{' '}
              </p>
              <p className="text-base text-foreground/60 mb-10 max-w-xl mx-auto">
                {' '}
                {t('if_budgero_saves_you_money_or')}{' '}
              </p>
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-[#111c34] text-[#f8fafc] hover:bg-[#1e293b]"
              >
                <TrackedLink href={LEMON_SQUEEZY_DONATE_URL} event="Donate - Checkout" external>
                  <Heart className="w-4 h-4 mr-2" /> {t('donate_pay_what_you_want')}{' '}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </TrackedLink>
              </Button>
              <p className="mt-4 text-xs text-foreground/50">
                {' '}
                {t('secure_checkout_via_lemon_squeezy_one')}{' '}
              </p>
            </div>
          </section>

          <div className="my-12 border-t border-border" aria-hidden />

          {/* Where it goes */}
          <section className="py-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              {' '}
              {t('where_donations_go')}{' '}
            </h2>
            <p className="text-foreground/70 leading-relaxed text-center">
              {' '}
              {t('budgero_is_built_by_one_person')}{' '}
            </p>
          </section>

          <div className="my-12 border-t border-border" aria-hidden />

          {/* Other ways to help */}
          <section className="py-12 pb-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              {' '}
              {t('other_ways_to_help')}{' '}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {otherWays.map((way) => (
                <TrackedLink
                  key={way.title}
                  href={way.href}
                  event={way.event}
                  external={way.external}
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-foreground/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#d7dbe2] flex items-center justify-center mb-3">
                    <way.icon className="w-5 h-5 text-[#3f4756]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{way.title}</h3>
                  <p className="text-sm text-foreground/65">{way.description}</p>
                </TrackedLink>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
