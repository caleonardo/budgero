'use client';

import { useEffect } from 'react';
import Link from 'next/link';
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

const features = [
  'Encrypted sync across your devices',
  'Up to five people in your workspace',
  'Accounts in multiple currencies',
  'YNAB and CSV imports',
  'Savings goals and spending reports',
  'Hosting and automatic updates handled for you',
];

export default function LandingPage() {
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
            A clearer plan for your money
          </p>
          <h1
            id="hero-heading"
            className="text-balance text-[clamp(2rem,4.8vw,4.25rem)] font-bold leading-[1.12] tracking-tight"
          >
            Know what you can spend.
            <br className="hidden sm:block" />{' '}
            <span className="text-primary">Keep your budget private.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Plan your spending, manage accounts across currencies, and budget together—with a
            private budgeting app that works in your browser.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 h-auto min-h-12 w-full max-w-sm whitespace-normal rounded-full px-4 py-3 text-sm sm:w-auto sm:max-w-none sm:px-7 sm:text-base"
          >
            <TrialLink placement="hero">
              Start your 35-day free trial{' '}
              <ArrowRight
                className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                aria-hidden="true"
              />
            </TrialLink>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card required.{' '}
            <span className="block sm:inline">
              Then {pricing.monthly}/month or {pricing.yearly}/year, tax included.
            </span>
          </p>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" aria-hidden="true" /> End-to-end encrypted
            </span>
            <span>Open source</span>
            <span>Up to five people included</span>
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
              Make room for what matters
            </p>
            <h2
              id="benefits-heading"
              className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            >
              A budget you can use every day.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <Wallet className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">See what is left to spend</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                Give your money a job, record your spending, and see what is still available for
                groceries, bills, and the things you are saving for.
              </p>
              <div
                className="mt-auto rounded-xl bg-muted/50 p-5"
                aria-label="Example: groceries, $450 assigned, $128.40 spent, $321.60 available"
              >
                <div className="flex justify-between text-sm">
                  <span>Groceries</span>
                  <span className="font-medium text-primary">$321.60 left</span>
                </div>
                <div className="my-3 h-2 overflow-hidden rounded-full bg-primary/15">
                  <div className="h-full w-[29%] rounded-full bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  $128.40 spent of $450 assigned · Example
                </p>
              </div>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <Coins className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Keep currencies together</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                Keep each account in its own currency and plan in your budget currency. See
                converted balances and handle transfers without a separate spreadsheet.
              </p>
              <div className="mt-auto rounded-xl bg-muted/50 p-5 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span>Everyday account</span>
                  <span className="font-medium">EUR</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span>Travel account</span>
                  <span className="font-medium">USD</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Different account currencies. One budget.
                </p>
              </div>
              <Link
                href="/multi-currency-budgeting"
                className="mt-5 text-sm font-medium text-primary underline underline-offset-4"
              >
                Explore multi-currency budgeting
              </Link>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <FileInput className="mb-5 size-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Bring your YNAB budget</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">
                Bring your accounts, categories, and history through a direct YNAB connection or an
                export. Review the import, reconcile balances, and pick up your plan.
              </p>
              <ol className="mt-auto space-y-3 rounded-xl bg-muted/50 p-5 text-sm">
                {[
                  'Connect YNAB or upload an export',
                  'Review your imported budget',
                  'Check balances and start budgeting',
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="text-primary">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link
                href="/vs-ynab"
                className="mt-5 text-sm font-medium text-primary underline underline-offset-4"
              >
                Compare Budgero and YNAB
              </Link>
            </article>
          </div>
          <p
            id="security"
            className="mx-auto mt-8 max-w-2xl scroll-mt-28 text-center text-sm leading-6 text-muted-foreground"
          >
            Your financial data is encrypted on your device before it syncs. Only you and the people
            you share with can read it.{' '}
            <Link
              href="/encrypted-budgeting"
              className="underline underline-offset-4 hover:text-foreground"
            >
              How Budgero protects your budget
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
                Budgero Cloud
              </p>
              <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight">
                Your first 35 days are free.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Try the full app with your own budget. No card, no server setup, and no plan to
                choose today.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 h-auto min-h-12 w-full max-w-full whitespace-normal rounded-full px-3 py-3"
              >
                <TrialLink placement="pricing">
                  Start your 35-day free trial{' '}
                  <ArrowRight
                    className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                    aria-hidden="true"
                  />
                </TrialLink>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No automatic charge when your trial ends.
              </p>
            </div>
            <div className="min-w-0 bg-muted/30 p-6 sm:p-10">
              <p className="text-sm text-muted-foreground">
                After your trial, choose what suits you:
              </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <strong className="text-3xl tracking-tight">{pricing.monthly}</strong>
                <span className="text-sm text-muted-foreground">/month</span>
                <span className="mx-1 text-muted-foreground">or</span>
                <strong className="text-3xl tracking-tight">{pricing.yearly}</strong>
                <span className="text-sm text-muted-foreground">/year</span>
              </p>
              <p className="mb-6 mt-2 text-xs text-muted-foreground">
                For your workspace, with up to five people. Tax included.
              </p>
              <ul className="space-y-3">
                {features.map((feature) => (
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
          Before you start.
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {homepageFaqs.map((faq) => (
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
          Make a plan for your next payday.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Start fresh or bring your YNAB budget. Give Budgero a full month—and a little extra—to see
          how it fits.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 h-auto min-h-12 w-full max-w-sm whitespace-normal rounded-full px-4 py-3 text-sm sm:w-auto sm:max-w-none sm:px-7"
        >
          <TrialLink placement="final">
            Start your 35-day free trial{' '}
            <ArrowRight
              className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
              aria-hidden="true"
            />
          </TrialLink>
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          No credit card required. Then {pricing.monthly}/month or {pricing.yearly}/year.
        </p>
      </section>

      <section
        id="self-host"
        aria-labelledby="self-host-heading"
        className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"
      >
        <h2 id="self-host-heading" className="text-2xl font-bold">
          Open source. Free to self-host.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Budgero is an open-source product with a managed Cloud option. Prefer your own server?
          Self-host the same core app for free and manage hosting, updates, and backups yourself.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/self-hostable"
            onClick={() => track('CTA Clicked - Self Host', { placement: 'bottom', page: 'home' })}
            className="underline underline-offset-4"
          >
            Explore self-hosting
          </Link>
          <Link
            href="/docs/self-hosting-guide"
            onClick={() =>
              track('Self-Host - Setup Guide (Homepage)', { placement: 'bottom', page: 'home' })
            }
            className="underline underline-offset-4"
          >
            Self-hosting guide
          </Link>
          <a
            href="https://github.com/tombadilo-bombadilo/budgero"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Source on GitHub
          </a>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Already self-hosting?{' '}
          <Link
            href="/donate"
            onClick={() => track('Self-Host - Donate (Homepage)')}
            className="underline underline-offset-4"
          >
            Support Budgero with an optional donation
          </Link>
          .
        </p>
        <p className="mt-10 text-xs leading-6 text-muted-foreground">
          Still comparing?{' '}
          <Link href="/best-ynab-alternatives" className="underline underline-offset-4">
            Explore YNAB alternatives
          </Link>{' '}
          or see{' '}
          <Link href="/monarch-money-europe-alternative" className="underline underline-offset-4">
            Budgero for people considering Monarch Money in Europe
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
