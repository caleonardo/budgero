'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ChartPie,
  Expand,
  FlaskConical,
  GitFork,
  TrendingUp,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { track } from '@/lib/analytics';
import { HOMEPAGE_VARIANT, TrialLink } from './TrialLink';

const reports = [
  {
    id: 'money-map',
    label: 'Money Map',
    icon: GitFork,
    title: 'Follow your money, from payday to savings.',
    description:
      'See how your household income divides between everyday spending and the money you keep for later.',
    image: '/demo-report-money-map.png',
    alt: 'Budgero Money Map showing two salaries flowing into household spending categories and savings, using demo data.',
    caption: 'Desktop report shown with demo data.',
  },
  {
    id: 'spending',
    label: 'Spending',
    icon: ChartPie,
    title: 'Find the patterns behind your spending.',
    description:
      'Explore spending by category, group, or payee. See what takes the biggest share and how it changes over time.',
    image: '/demo-report-spending.png',
    alt: 'Budgero spending report with a category breakdown for rent, groceries, holidays, dining out, and other household expenses, using demo data.',
    caption: 'Desktop report shown with demo data.',
  },
  {
    id: 'wealth',
    label: 'Wealth',
    icon: TrendingUp,
    title: 'See how far you have come.',
    description:
      'Follow your assets, debt, and net worth over time—including the months when life costs a little more.',
    image: '/demo-report-wealth.png',
    alt: 'Budgero Wealth report showing a year of net worth changes, including a dip for a planned holiday, using demo data.',
    caption: 'Desktop report shown with demo data.',
  },
  {
    id: 'scenario',
    label: 'Scenarios',
    icon: FlaskConical,
    title: 'Make room for “what if?”',
    description:
      'Adjust income, spending, or a one-off cost to explore how your balance could change before you change your plans.',
    image: '/demo-report-scenario.png',
    alt: 'Budgero Scenario Planner with adjustable income and spending, showing an illustrative 24-month balance projection from demo data.',
    caption: 'Illustrative projection based on demo data and scenario assumptions.',
  },
] as const;

export function ReportShowcase() {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(true);
  const report = reports[selected];

  return (
    <section
      id="reports"
      aria-labelledby="reports-heading"
      className="scroll-mt-28 px-4 pb-16 pt-4 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Your money, in perspective
          </p>
          <h2
            id="reports-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
          >
            See where your money goes.
            <br className="hidden sm:block" /> See your progress.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty leading-7 text-muted-foreground">
            A plan for today. A bigger picture over time. Turn your budget history into reports that
            help you understand your spending and think ahead.
          </p>
        </div>

        <div
          role="group"
          aria-label="Choose a report to preview"
          className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/30 p-2 sm:grid-cols-4"
        >
          {reports.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected === index}
              aria-controls="report-preview"
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-sm ${
                selected === index
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              onClick={() => {
                setSelected(index);
                track('Report Preview Selected', { report: item.id, variant: HOMEPAGE_VARIANT });
              }}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>

        <div id="report-preview" className="mt-7">
          <div aria-live="polite" aria-atomic="true" className="mx-auto mb-6 max-w-2xl text-center">
            <h3 className="text-lg font-semibold sm:text-xl">{report.title}</h3>
            <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
              {report.description}
            </p>
          </div>

          <Dialog
            onOpenChange={(open) => {
              if (open) setZoomed(true);
            }}
          >
            <figure>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`Enlarge ${report.label} screenshot`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl shadow-black/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:rounded-2xl"
                  onClick={() =>
                    track('Report Preview Enlarged', {
                      report: report.id,
                      variant: HOMEPAGE_VARIANT,
                    })
                  }
                >
                  <Image
                    key={report.id}
                    src={report.image}
                    alt={report.alt}
                    width={2880}
                    height={1920}
                    sizes="(min-width: 1200px) 1152px, calc(100vw - 32px)"
                    className="h-auto w-full"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-3 py-2 text-xs font-medium shadow-sm transition-colors group-hover:bg-accent sm:bottom-5 sm:right-5">
                    <Expand className="size-3.5" aria-hidden="true" /> View larger
                  </span>
                </button>
              </DialogTrigger>
              <figcaption className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {report.caption}
              </figcaption>
            </figure>

            <DialogContent
              showCloseButton={false}
              className="flex h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[1400px]"
            >
              <div className="flex shrink-0 items-start justify-between gap-3 p-4">
                <div className="min-w-0 pt-1">
                  <DialogTitle className="text-base leading-6">{report.label}</DialogTitle>
                  <DialogDescription className="mt-1 text-xs leading-5">
                    {report.caption}
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label="Close report preview"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </Button>
                </DialogClose>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 border-y border-border/60 px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  aria-pressed={zoomed}
                  aria-label={zoomed ? 'Fit report to screen' : 'Zoom in on report'}
                  onClick={() => setZoomed(!zoomed)}
                >
                  {zoomed ? (
                    <ZoomOut className="size-4" aria-hidden="true" />
                  ) : (
                    <ZoomIn className="size-4" aria-hidden="true" />
                  )}
                  {zoomed ? 'Fit to screen' : 'Zoom in'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {zoomed ? 'Scroll to explore the details.' : 'Zoom in for a closer look.'}
                </p>
              </div>
              <div
                role="region"
                aria-label="Report image; scroll to explore when enlarged"
                tabIndex={0}
                className="min-h-0 flex-1 overflow-auto overscroll-contain bg-muted/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <div
                  style={{
                    width: zoomed ? 'max(100%, 1120px)' : '100%',
                    height: zoomed ? undefined : '100%',
                  }}
                >
                  <Image
                    src={report.image}
                    alt={report.alt}
                    width={2880}
                    height={1920}
                    sizes={
                      zoomed
                        ? '(min-width: 1400px) 1400px, 1120px'
                        : '(min-width: 1400px) 1400px, 100vw'
                    }
                    className={zoomed ? 'h-auto w-full max-w-none' : 'h-full w-full object-contain'}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="h-auto min-h-12 max-w-full whitespace-normal rounded-full px-5 py-3"
          >
            <TrialLink placement="reports">
              Try it with your own budget
              <ArrowRight
                className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                aria-hidden="true"
              />
            </TrialLink>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            All reports included. 35 days free. No credit card.
          </p>
        </div>
      </div>
    </section>
  );
}
