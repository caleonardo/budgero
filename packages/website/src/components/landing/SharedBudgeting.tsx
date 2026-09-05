import { ArrowRight, Check, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricing } from '@/lib/pricing';
import { TrialLink } from './TrialLink';

export function SharedBudgeting() {
  return (
    <section
      id="shared-budgeting"
      aria-labelledby="sharing-heading"
      className="scroll-mt-28 px-4 pt-16 sm:px-6 sm:pt-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Better together
          </p>
          <h2
            id="sharing-heading"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
          >
            A shared budget.
            <br />A single subscription.
          </h2>
          <p className="mt-5 text-pretty leading-7 text-muted-foreground">
            Plan the bills, check what is left for groceries, and save for your next holiday
            together. Invite your partner or family to the same budget—everyone sees the same plan.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6">
            {[
              'Your partner joins without buying another subscription.',
              'Each person gets their own sign-in and master password.',
              'Spending and budget changes sync across your devices.',
            ].map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-7 h-auto min-h-12 max-w-full whitespace-normal rounded-full px-5 py-3"
          >
            <TrialLink placement="sharing">
              Try budgeting together
              <ArrowRight className="ml-2 size-4 shrink-0" aria-hidden="true" />
            </TrialLink>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            35 days free. No credit card required.
          </p>
        </div>

        <div className="min-w-0 rounded-3xl border border-primary/20 bg-primary/[0.04] px-5 py-10 text-center sm:px-10 sm:py-12">
          <p className="text-sm font-semibold">Up to five people included</p>
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
          <p className="text-balance text-sm text-muted-foreground">One price for your workspace</p>
          <p className="mt-4">
            <strong className="text-5xl font-bold tracking-tight sm:text-6xl">
              {pricing.monthly}
            </strong>
            <span className="text-sm text-muted-foreground"> /month</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            or <strong className="font-semibold text-foreground">{pricing.yearly}/year</strong>
          </p>
          <p className="mt-7 border-t border-primary/15 pt-6 text-xs leading-6 text-muted-foreground">
            Tax included. Shared budgeting included.
            <br />
            Your budget stays end-to-end encrypted.
          </p>
        </div>
      </div>
    </section>
  );
}
