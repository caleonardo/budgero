import { AlertTriangle } from 'lucide-react';
import type { BudgetRow } from '@features/budget-planning/lib/budget-transforms';
import { useFormatMaskedMilli } from '@features/budget-planning/lib/useFormatMaskedMilli';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { cn } from '@shared/lib/utils';

interface CCUnderfundedBadgeProps {
  item: BudgetRow;
  globalLocalizer: Intl.NumberFormat;
  className?: string;
}

/** 'YYYY-MM' -> 'Aug 2026'. */
function formatMonth(month: string): string {
  const [y, m] = month.split('-');
  const idx = Number(m) - 1;
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return idx >= 0 && idx < 12 ? `${names[idx]} ${y}` : month;
}

/**
 * Flags a Credit Card Payment category that has less set aside than the card's
 * balance owed — i.e. credit-card debt you haven't funded yet — and, on click,
 * breaks the debt down by the category + month where each overspend was created.
 *
 * Credit overspending never turns the spending category red long-term (in
 * monthly mode it resets each month; the debt moves to the card), so without
 * this the debt is invisible in the budget.
 */
export function CCUnderfundedBadge({ item, globalLocalizer, className }: CCUnderfundedBadgeProps) {
  const formatAmount = useFormatMaskedMilli(globalLocalizer);
  const isCCPayment = item.fundingBreakdown !== undefined;
  const owed = item.cardBalance !== undefined ? Math.max(0, 0 - item.cardBalance) : 0;
  const underfunded = isCCPayment ? owed - Math.max(0, item.available) : 0;
  if (underfunded <= 0) return null;

  const events = item.debtBreakdown ?? [];
  const created = events.reduce((sum, e) => sum + e.amount, 0);
  const covered = Math.max(0, created - underfunded);

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        className
      )}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      Underfunded {formatAmount(underfunded)}
    </span>
  );

  // No per-source detail (e.g. cumulative mode): show a static badge.
  if (events.length === 0) {
    return (
      <span
        title="This card owes more than you've set aside to pay it. Assign money here to cover it."
        className="inline-flex"
      >
        {badge}
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex"
          onClick={(e) => e.stopPropagation()}
          aria-label="Show where this credit-card debt came from"
        >
          {badge}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs" align="end" side="top">
        <p className="font-medium text-sm">Where this debt came from</p>
        <p className="mt-1 text-muted-foreground">
          Credit overspending that wasn&apos;t covered when it happened. Assign money to this
          payment category to pay it off.
        </p>
        <div className="mt-3 border-t border-border pt-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1">
            <span className="text-muted-foreground">Category</span>
            <span className="text-muted-foreground">Month</span>
            <span className="text-right text-muted-foreground">Amount</span>
            {events.map((e) => (
              <div key={`${e.categoryId}|${e.month}`} className="contents">
                <span className="truncate">{e.categoryName || `#${e.categoryId}`}</span>
                <span className="whitespace-nowrap text-muted-foreground">
                  {formatMonth(e.month)}
                </span>
                <span className="text-right tabular-nums">{formatAmount(e.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1 border-t border-border pt-2">
            {covered > 0 && (
              <>
                <div className="flex items-baseline justify-between text-muted-foreground">
                  <span>Debt created</span>
                  <span className="tabular-nums">{formatAmount(created)}</span>
                </div>
                <div className="flex items-baseline justify-between text-muted-foreground">
                  <span>− Already set aside</span>
                  <span className="tabular-nums">{formatAmount(covered)}</span>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between font-semibold">
              <span>Still underfunded</span>
              <span className="tabular-nums">{formatAmount(underfunded)}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
