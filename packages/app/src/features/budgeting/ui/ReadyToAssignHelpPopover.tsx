import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { cn } from '@shared/lib/utils';
import { useUiStore } from '@shared/store/useUiStore';
import { formatMaskedMilli } from '@shared/lib/privacy/mask-numbers';
import { useReadyToAssignBreakdown } from '@entities/budget/api/useMonthlyBudget';

interface ReadyToAssignHelpPopoverProps {
  /** Trigger-button sizing/tone classes (varies per layout). */
  triggerClassName?: string;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center';
  /** Budget whose Ready to Assign math is explained. */
  budgetId?: number;
  /** Selected month ('YYYY-MM'); drives the breakdown in monthly mode. */
  month?: string;
}

/** One label/amount line in the math breakdown. */
function MathRow({
  label,
  value,
  localizer,
  mask,
  sign,
  strong,
}: {
  label: string;
  value: number;
  localizer: Intl.NumberFormat;
  mask: boolean;
  sign?: '+' | '−';
  strong?: boolean;
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', strong && 'font-semibold')}>
      <span className={cn(!strong && 'text-muted-foreground')}>
        {sign ? `${sign} ` : ''}
        {label}
      </span>
      <span className="tabular-nums">{formatMaskedMilli(localizer, value, mask)}</span>
    </div>
  );
}

/** The "What does Ready to Assign mean?" help popover with full math breakdown. */
export function ReadyToAssignHelpPopover({
  triggerClassName,
  side = 'bottom',
  align = 'start',
  budgetId,
  month,
}: ReadyToAssignHelpPopoverProps) {
  const { data: breakdown } = useReadyToAssignBreakdown(budgetId ?? 0, month);
  const globalLocalizer = useUiStore((s) => s.globalLocalizer);
  const mask = useUiStore((s) => s.privacyMaskNumbers);

  const isMonthly = breakdown?.mode === 'monthly';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            triggerClassName
          )}
          aria-label="What does Ready to Assign mean?"
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs" side={side} align={align}>
        <p className="font-medium text-sm">Ready to Assign</p>
        <p className="mt-1 text-muted-foreground">
          Money you can still assign to categories. Positive means funds to allocate; negative means
          you&apos;ve over-budgeted.
        </p>

        {breakdown && (
          <div className="mt-3 border-t border-border pt-2">
            <p className="mb-1 flex items-center justify-between">
              <span className="font-medium">
                {isMonthly ? 'Monthly calculation' : 'Cumulative calculation'}
              </span>
              <span className="text-muted-foreground">
                {isMonthly ? 'through this month' : 'all time'}
              </span>
            </p>
            <div className="space-y-1">
              <MathRow
                label="Income"
                value={breakdown.income}
                localizer={globalLocalizer}
                mask={mask}
              />
              <MathRow
                label="Assigned to categories"
                value={breakdown.assignments}
                localizer={globalLocalizer}
                mask={mask}
                sign="−"
              />
              {breakdown.offBudgetTransfers !== 0 && (
                <MathRow
                  label="Transfers off budget"
                  value={breakdown.offBudgetTransfers}
                  localizer={globalLocalizer}
                  mask={mask}
                  sign="−"
                />
              )}
              {breakdown.revaluations !== 0 && (
                <MathRow
                  label="Currency rate changes"
                  value={breakdown.revaluations}
                  localizer={globalLocalizer}
                  mask={mask}
                  sign="+"
                />
              )}
              {isMonthly && breakdown.priorCashOverspend !== 0 && (
                <MathRow
                  label="Last month's overspending"
                  value={breakdown.priorCashOverspend}
                  localizer={globalLocalizer}
                  mask={mask}
                  sign="−"
                />
              )}
              <div className="mt-1 border-t border-border pt-1">
                <MathRow
                  label="Ready to Assign"
                  value={breakdown.readyToAssign}
                  localizer={globalLocalizer}
                  mask={mask}
                  strong
                />
              </div>
            </div>

            <p className="mt-2 text-muted-foreground">
              {isMonthly
                ? 'Income counts as it arrives and last month’s overspending is pulled from this month (YNAB-style).'
                : 'Income and assignments accumulate across all time, so this figure is the same in every month.'}
            </p>
            <p className="mt-2 text-muted-foreground">
              Switch between Monthly and Cumulative in{' '}
              <Link
                to="/settings/budget"
                className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Settings → Budget Settings
              </Link>
              .
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
