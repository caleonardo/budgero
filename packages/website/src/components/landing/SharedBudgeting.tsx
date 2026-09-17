import { useTranslations } from 'next-intl';
import { ArrowRight, Check, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricing } from '@/lib/pricing';
import { TrialLink } from './TrialLink';

export function SharedBudgeting() {
  const copy = useTranslations('updates');
  return (
    <section
      id="shared-budgeting"
      aria-labelledby="sharing-heading"
      className="scroll-mt-28 px-4 pt-16 sm:px-6 sm:pt-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            {' '}
            {copy('u_3060dec2f3bd')}{' '}
          </p>
          <h2
            id="sharing-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {' '}
            {copy('u_816ee07d25aa')} <br />
            {copy('u_a558427dc680')}{' '}
          </h2>
          <p className="mt-5 text-pretty leading-7 text-muted-foreground">
            {' '}
            {copy('u_6ea04f1856f8')}{' '}
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6">
            {[copy('u_90405b8debd6'), copy('u_a3c2a1a520bc'), copy('u_7bffd6802084')].map(
              (benefit) => (
                <li key={benefit} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {benefit}
                </li>
              )
            )}
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-7 h-auto min-h-12 max-w-full whitespace-normal rounded-full px-5 py-3"
          >
            <TrialLink placement="sharing">
              {' '}
              {copy('u_d6faa9759d54')}{' '}
              <ArrowRight className="ml-2 size-4 shrink-0" aria-hidden="true" />
            </TrialLink>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground"> {copy('u_dc31a3ff9445')} </p>
        </div>

        <div className="min-w-0 rounded-3xl border border-primary/20 bg-primary/[0.04] px-5 py-10 text-center sm:px-10 sm:py-12">
          <p className="text-sm font-semibold">{copy('u_4133418a0708')}</p>
          <div
            aria-hidden="true"
            className="mx-auto my-7 flex max-w-sm justify-center gap-2 sm:gap-3"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={`flex aspect-square min-w-0 max-w-14 flex-1 items-center justify-center rounded-full border ${
                  index === 0
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary/20 bg-card text-primary'
                }`}
              >
                <UserRound className="size-5 sm:size-6" />
              </div>
            ))}
          </div>
          <p className="text-balance text-sm text-muted-foreground">{copy('u_6a2046dba635')}</p>
          <p className="mt-4">
            <strong className="text-5xl font-bold tracking-tight sm:text-6xl">
              {pricing.monthly}
            </strong>
            <span className="text-sm text-muted-foreground"> {copy('u_eec5d08bc9b2')}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {' '}
            {copy('u_7175517a370b')}{' '}
            <strong className="font-semibold text-foreground">
              {pricing.yearly}
              {copy('u_a2d5f1bcdaab')}
            </strong>
          </p>
          <p className="mt-7 border-t border-primary/15 pt-6 text-xs leading-6 text-muted-foreground">
            {' '}
            {copy('u_26474c81358a')} <br /> {copy('u_7b92667db15d')}{' '}
          </p>
        </div>
      </div>
    </section>
  );
}
