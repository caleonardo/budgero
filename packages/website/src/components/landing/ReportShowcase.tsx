'use client';
import { useTranslations } from 'next-intl';

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

const reports = (copy: CopyTranslator) =>
  [
    {
      id: 'money-map',
      label: copy('u_8ae31c6b6255'),
      icon: GitFork,
      title: copy('u_f1430f1cc733'),
      description: copy('u_e0c6f737e2a6'),
      image: '/demo-report-money-map.png',
      alt: copy('u_f984efd7069b'),
      caption: copy('u_850658ffb64e'),
    },
    {
      id: 'spending',
      label: copy('u_c2c7ae2ad923'),
      icon: ChartPie,
      title: copy('u_96a729117270'),
      description: copy('u_12fd696e3387'),
      image: '/demo-report-spending.png',
      alt: copy('u_53928a71bb94'),
      caption: copy('u_850658ffb64e'),
    },
    {
      id: 'wealth',
      label: copy('u_35466d70b118'),
      icon: TrendingUp,
      title: copy('u_440a368ca7f3'),
      description: copy('u_3c4de64fb2b7'),
      image: '/demo-report-wealth.png',
      alt: copy('u_ede573c2e73d'),
      caption: copy('u_850658ffb64e'),
    },
    {
      id: 'scenario',
      label: copy('u_72fa5509b2f9'),
      icon: FlaskConical,
      title: copy('u_8d21f54036f6'),
      description: copy('u_c38de080eb4d'),
      image: '/demo-report-scenario.png',
      alt: copy('u_647294baf1ef'),
      caption: copy('u_21212020439b'),
    },
  ] as const;

export function ReportShowcase() {
  const copy = useTranslations('updates');
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(true);
  const report = reports(copy)[selected];

  return (
    <section
      id="reports"
      aria-labelledby="reports-heading"
      className="scroll-mt-28 px-4 pb-16 pt-4 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {' '}
            {copy('u_ce69d9e65a0c')}{' '}
          </p>
          <h2
            id="reports-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {' '}
            {copy('u_08d01365b9c2')} <br className="hidden sm:block" />{' '}
            {copy('u_4e2ec2b6f163')}{' '}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty leading-7 text-muted-foreground">
            {' '}
            {copy('u_d8daf259bbef')}{' '}
          </p>
        </div>

        <div
          role="group"
          aria-label={copy('u_061a29ec8561')}
          className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/30 p-2 sm:grid-cols-4"
        >
          {reports(copy).map((item, index) => (
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
                  aria-label={copy('u_1c3f4b4fa542', {
                    p0: report.label,
                  })}
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
                    <Expand className="size-3.5" aria-hidden="true" /> {copy('u_f7ab0572fbce')}{' '}
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
                    aria-label={copy('u_eaa53653d96a')}
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
                  aria-label={zoomed ? copy('u_1fec95c93489') : copy('u_abc8886a95a1')}
                  onClick={() => setZoomed(!zoomed)}
                >
                  {zoomed ? (
                    <ZoomOut className="size-4" aria-hidden="true" />
                  ) : (
                    <ZoomIn className="size-4" aria-hidden="true" />
                  )}
                  {zoomed ? copy('u_32bb0d298ca1') : copy('u_0e47f09a748f')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {zoomed ? copy('u_e058e2929995') : copy('u_cf1049e5d904')}
                </p>
              </div>
              <div
                role="region"
                aria-label={copy('u_4718ae434841')}
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
              {' '}
              {copy('u_d13eabb1cbbd')}{' '}
              <ArrowRight
                className="ml-2 hidden size-4 shrink-0 min-[360px]:block"
                aria-hidden="true"
              />
            </TrialLink>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground"> {copy('u_f92c9910a7fb')} </p>
        </div>
      </div>
    </section>
  );
}
type CopyTranslator = (key: string, values?: Record<string, string | number>) => string;
