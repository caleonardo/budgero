import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { cn } from '@shared/lib/utils';
import { useUiStore } from '@shared/store/useUiStore';
import { formatMaskedMilli } from '@shared/lib/privacy/mask-numbers';
import { useBudgetRevaluationTotal } from '@entities/currency/api/useRevaluationSummary';

interface ReadyToAssignHelpPopoverProps {
  /** Trigger-button sizing/tone classes (varies per layout). */
  triggerClassName?: string;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center';
  /** When set, the popover shows how much of RTA comes from market-rate
   * changes on on-budget foreign-currency accounts. */
  budgetId?: number;
}

/** The "What does Ready to Assign mean?" help popover. */
export function ReadyToAssignHelpPopover({
  triggerClassName,
  side = 'bottom',
  align = 'start',
  budgetId,
}: ReadyToAssignHelpPopoverProps) {
  const { data: revaluationTotal = 0 } = useBudgetRevaluationTotal(budgetId);
  const globalLocalizer = useUiStore((s) => s.globalLocalizer);
  const privacyMaskNumbers = useUiStore((s) => s.privacyMaskNumbers);

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
      <PopoverContent className="w-64 text-xs" side={side} align={align}>
        <p>
          Money available to assign to budget categories: total income minus all budget assignments
          and transfers to off-budget accounts, plus market-rate changes on on-budget accounts held
          in other currencies. Positive means funds to allocate; negative means you have
          over-budgeted.
        </p>
        {revaluationTotal !== 0 && (
          <p className="mt-2 border-t border-border pt-2">
            Currently includes{' '}
            <span
              className={cn(
                'font-medium tabular-nums',
                revaluationTotal >= 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {formatMaskedMilli(globalLocalizer, revaluationTotal, privacyMaskNumbers)}
            </span>{' '}
            from market-rate changes on on-budget accounts.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
