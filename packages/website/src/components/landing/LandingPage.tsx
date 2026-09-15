'use client';
import { useTranslations } from 'next-intl';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  LockKeyhole,
  Coins,
  FileInput,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricing } from '@/lib/pricing';
import { homepageFaqs } from '@/lib/homepage-content';
import { track } from '@/lib/analytics';
import { FeaturedTestimonial } from './Testimonials';
import { HOMEPAGE_VARIANT, TrialLink } from './TrialLink';
import { BudgetPreview } from './BudgetPreview';
import { SharedBudgeting } from './SharedBudgeting';
import { ReportShowcase } from './ReportShowcase';

const features = (copy: CopyTranslator) => [
  copy('u_25ec18da53ea'),
  copy('u_4576c9445ae6'),
  copy('u_6691dee65511'),
  copy('u_55909602692b'),
  copy('u_52e816dab6a6'),
  copy('u_892baab19fba'),
];

export default function LandingPage() {
  const copy = useTranslations('updates');
  useEffect(() => {
    track('Homepage Viewed', { variant: HOMEPAGE_VARIANT });
  }, []);

  return (
    <main className="overflow-x-clip">
      <section aria-labelledby="hero-heading" className="relative px-4 pb-4 pt-10 sm:px-6 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[700px] max-w-6xl rounded-full bg-primary/5 blur-3xl"
        />
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {' '}
            {copy('u_5fccd591a577')}{' '}
          </p>
          <h1
            id="hero-heading"
            className="text-balance text-[clamp(2rem,4.8vw,4.25rem)] font-bold leading-[1.12] tracking-tight"
          >
            {' '}
            {copy('u_f06fb5c3e210')} <br className="hidden sm:block" />{' '}
            <span className="text-primary">{copy('u_70f89fb1c00f')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {' '}
            {copy('u_d7d50565a944')}{' '}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 h-auto min-h-12 w-full max-w-sm whitespace-normal rounded-full px-4 py-3 text-sm sm:w-auto sm:max-w-none sm:px-7 sm:text-base"
          >
            <TrialLink placement="hero">
              {' '}
              {copy('u_c413547eb1fa')}{' '}
              <ArrowRight
                className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                aria-hidden="true"
              />
            </TrialLink>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            {' '}
            {copy('u_020d69600973')}{' '}
            <span className="block sm:inline">
              {' '}
              {copy('u_0597f441dcca')} {pricing.monthly}
              {copy('u_f02908f678e5')} {pricing.yearly}
              {copy('u_1b5a38379cfe')}{' '}
            </span>
          </p>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" aria-hidden="true" /> {copy('u_f01afb7a9c04')}{' '}
            </span>
            <span>{copy('u_67a0d2e0dab4')}</span>
            <span>{copy('u_4133418a0708')}</span>
          </p>
        </div>
        <BudgetPreview />
      </section>

      <FeaturedTestimonial />

      <ReportShowcase />

      <section
        id="how-it-works"
        aria-labelledby="benefits-heading"
        className="scroll-mt-28 border-y border-border/60 bg-muted/20 px-4 py-16 sm:px-6 sm:py-20"
      >
        <div id="features" className="mx-auto max-w-6xl scroll-mt-28">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              {' '}
              {copy('u_2be2070095bb')}{' '}
            </p>
            <h2
              id="benefits-heading"
              className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {' '}
              {copy('u_a7aee0a2a54f')}{' '}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <Wallet className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">{copy('u_7ca513b71c72')}</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                {' '}
                {copy('u_07e60fdd33c7')}{' '}
              </p>
              <div
                className="mt-auto rounded-xl bg-muted/50 p-5"
                aria-label={copy('u_23ad9399e119')}
              >
                <div className="flex justify-between text-sm">
                  <span>{copy('u_2742b7b24a49')}</span>
                  <span className="font-medium text-primary">{copy('u_87ba3f7ab1e8')}</span>
                </div>
                <div className="my-3 h-2 overflow-hidden rounded-full bg-primary/15">
                  <div className="h-full w-[29%] rounded-full bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground"> {copy('u_323bb90dd1c8')} </p>
              </div>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <Coins className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">{copy('u_f8d7b671420e')}</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                {' '}
                {copy('u_803e7107fbc1')}{' '}
              </p>
              <div className="mt-auto rounded-xl bg-muted/50 p-5 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span>{copy('u_81dbfecfb484')}</span>
                  <span className="font-medium">EUR</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span>{copy('u_20a9efe099d0')}</span>
                  <span className="font-medium">USD</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground"> {copy('u_a9ce5db1b5ab')} </p>
              </div>
              <Link
                href="/multi-currency-budgeting"
                className="mt-5 text-sm font-medium text-primary underline underline-offset-4"
              >
                {' '}
                {copy('u_ebe45f8df8c0')}{' '}
              </Link>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <FileInput className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">{copy('u_c3f88d9cc0f7')}</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                {' '}
                {copy('u_61e98975e45e')}{' '}
              </p>
              <ol className="mt-auto space-y-3 rounded-xl bg-muted/50 p-5 text-sm">
                {[copy('u_97532853dcc3'), copy('u_7536e2ff767b'), copy('u_052d785539e3')].map(
                  (step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="text-primary">{index + 1}.</span>
                      {step}
                    </li>
                  )
                )}
              </ol>
              <Link
                href="/vs-ynab"
                className="mt-5 text-sm font-medium text-primary underline underline-offset-4"
              >
                {' '}
                {copy('u_fe533e59a56f')}{' '}
              </Link>
            </article>
          </div>
          <p
            id="security"
            className="mx-auto mt-8 max-w-2xl scroll-mt-28 text-center text-sm leading-6 text-muted-foreground"
          >
            {' '}
            {copy('u_4aa2dc278a6e')}{' '}
            <Link
              href="/encrypted-budgeting"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {' '}
              {copy('u_37b610c67574')}{' '}
            </Link>
          </p>
        </div>
      </section>

      <SharedBudgeting />

      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-xl shadow-primary/5">
          <div className="grid md:grid-cols-2">
            <div className="min-w-0 p-6 sm:p-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                {' '}
                {copy('u_3ffc9f1dabd5')}{' '}
              </p>
              <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight">
                {' '}
                {copy('u_f7d90458cc36')}{' '}
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {' '}
                {copy('u_63fc5238e13b')}{' '}
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 h-auto min-h-12 w-full max-w-full whitespace-normal rounded-full px-3 py-3"
              >
                <TrialLink placement="pricing">
                  {' '}
                  {copy('u_c413547eb1fa')}{' '}
                  <ArrowRight
                    className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                    aria-hidden="true"
                  />
                </TrialLink>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {' '}
                {copy('u_e8130c02993b')}{' '}
              </p>
            </div>
            <div className="min-w-0 bg-muted/30 p-6 sm:p-10">
              <p className="text-sm text-muted-foreground"> {copy('u_17400e3266f0')} </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <strong className="text-3xl tracking-tight">{pricing.monthly}</strong>
                <span className="text-sm text-muted-foreground">{copy('u_eec5d08bc9b2')}</span>
                <span className="mx-1 text-muted-foreground">{copy('u_7175517a370b')}</span>
                <strong className="text-3xl tracking-tight">{pricing.yearly}</strong>
                <span className="text-sm text-muted-foreground">{copy('u_a2d5f1bcdaab')}</span>
              </p>
              <p className="mb-6 mt-2 text-xs text-muted-foreground"> {copy('u_b5f92b72c014')} </p>
              <ul className="space-y-3">
                {features(copy).map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <h2 id="faq-heading" className="mb-8 text-center text-3xl font-bold tracking-tight">
          {' '}
          {copy('u_1d5e6e11930b')}{' '}
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {homepageFaqs(copy).map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-4 pr-5 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="bg-primary/5 px-4 py-16 text-center sm:px-6 sm:py-20"
        aria-labelledby="final-heading"
      >
        <h2
          id="final-heading"
          className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {' '}
          {copy('u_1dd70a518d09')}{' '}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground"> {copy('u_fc72aa5acd0c')} </p>
        <Button
          asChild
          size="lg"
          className="mt-7 h-auto min-h-12 w-full max-w-sm whitespace-normal rounded-full px-4 py-3 text-sm sm:w-auto sm:max-w-none sm:px-7"
        >
          <TrialLink placement="final">
            {' '}
            {copy('u_c413547eb1fa')}{' '}
            <ArrowRight
              className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
              aria-hidden="true"
            />
          </TrialLink>
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          {' '}
          {copy('u_1bc2607003ce')} {pricing.monthly}
          {copy('u_f02908f678e5')} {pricing.yearly}
          {copy('u_f13da484761a')}{' '}
        </p>
      </section>

      <section
        id="self-host"
        aria-labelledby="self-host-heading"
        className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"
      >
        <h2 id="self-host-heading" className="text-2xl font-bold">
          {' '}
          {copy('u_441ee09daf38')}{' '}
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground"> {copy('u_5d0e5f7d370c')} </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/self-hostable"
            onClick={() => track('CTA Clicked - Self Host', { placement: 'bottom', page: 'home' })}
            className="underline underline-offset-4"
          >
            {' '}
            {copy('u_2d66856f887a')}{' '}
          </Link>
          <Link
            href="/docs/self-hosting-guide"
            onClick={() =>
              track('Self-Host - Setup Guide (Homepage)', { placement: 'bottom', page: 'home' })
            }
            className="underline underline-offset-4"
          >
            {' '}
            {copy('u_65858866917e')}{' '}
          </Link>
          <a
            href="https://github.com/tombadilo-bombadilo/budgero"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {' '}
            {copy('u_11506c59ef23')}{' '}
          </a>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          {' '}
          {copy('u_6ee5aeed4e5e')}{' '}
          <Link
            href="/donate"
            onClick={() => track('Self-Host - Donate (Homepage)')}
            className="underline underline-offset-4"
          >
            {' '}
            {copy('u_5249abeadafe')}{' '}
          </Link>
          .
        </p>
        <p className="mt-10 text-xs leading-6 text-muted-foreground">
          {' '}
          {copy('u_01153b01e297')}{' '}
          <Link href="/best-ynab-alternatives" className="underline underline-offset-4">
            {' '}
            {copy('u_747348072d50')}{' '}
          </Link>{' '}
          {copy('u_9e9fc5a91a3d')}{' '}
          <Link href="/monarch-money-europe-alternative" className="underline underline-offset-4">
            {' '}
            {copy('u_e4e8120d4daa')}{' '}
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
