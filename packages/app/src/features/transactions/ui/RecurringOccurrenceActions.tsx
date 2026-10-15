import { useLingui } from '@lingui/react/macro';
import { CalendarCheck, Check, Loader2, RefreshCw, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMarkRecurringOccurrenceReady,
  useSkipRecurringOccurrence,
} from '@entities/recurring/api/useRecurringTransactions';
import { getTodayISO } from '@shared/lib/date-utils';
import { getErrorMessage } from '@shared/lib/errors';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

interface RecurringOccurrenceActionsProps {
  occurrenceId: number;
  /** YYYY-MM-DD due date; "Post now" is offered when it isn't today. */
  dueDate?: string;
  /** Button size, e.g. 'h-7 w-7' (desktop table) or 'h-6 w-6' (mobile card). */
  size?: string;
  iconSize?: string;
}

/**
 * Inline "Mark ready" / "Post now" / "Skip this time" actions for a projected
 * recurring occurrence in the register (replaces the separate upcoming panel).
 */
export function RecurringOccurrenceActions({
  occurrenceId,
  dueDate,
  size = 'h-7 w-7',
  iconSize = 'h-4 w-4',
}: RecurringOccurrenceActionsProps) {
  const { t } = useLingui();
  const markReady = useMarkRecurringOccurrenceReady();
  const skip = useSkipRecurringOccurrence();
  const busy = markReady.isPending || skip.isPending;
  const today = getTodayISO();
  const canPostNow = dueDate != null && dueDate.slice(0, 10) !== today;

  const onError = (error: unknown) =>
    toast.error(t`Action failed`, {
      description: getErrorMessage(error, t`Something went wrong.`),
    });

  const post = (transactionDate?: string) =>
    markReady.mutate(
      { occurrenceId, transactionDate },
      {
        onSuccess: (result) => {
          const { template } = result.occurrence;
          toast.success(t`Transaction posted`, {
            description: t`${template.name} was added to your register.`,
          });
        },
        onError,
      }
    );

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(size, 'rounded-full text-success hover:bg-success/10 hover:text-success')}
        disabled={busy}
        aria-label={t`Mark ready`}
        title={t`Mark ready`}
        onClick={(event) => {
          event.stopPropagation();
          post();
        }}
      >
        {markReady.isPending && markReady.variables?.transactionDate == null ? (
          <Loader2 className={cn(iconSize, 'animate-spin')} />
        ) : (
          <Check className={iconSize} />
        )}
      </Button>
      {canPostNow && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(size, 'rounded-full text-primary hover:bg-primary/10 hover:text-primary')}
          disabled={busy}
          aria-label={t`Post now`}
          title={t`Post now, dated today`}
          onClick={(event) => {
            event.stopPropagation();
            post(today);
          }}
        >
          {markReady.isPending && markReady.variables?.transactionDate != null ? (
            <Loader2 className={cn(iconSize, 'animate-spin')} />
          ) : (
            <CalendarCheck className={iconSize} />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(size, 'rounded-full text-muted-foreground hover:text-foreground')}
        disabled={busy}
        aria-label={t`Skip this time`}
        title={t`Skip this time`}
        onClick={(event) => {
          event.stopPropagation();
          skip.mutate(
            { id: occurrenceId },
            {
              onSuccess: () =>
                toast.success(t`Occurrence skipped`, {
                  description: t`We will remind you again next time.`,
                }),
              onError,
            }
          );
        }}
      >
        {skip.isPending ? (
          <Loader2 className={cn(iconSize, 'animate-spin')} />
        ) : (
          <SkipForward className={iconSize} />
        )}
      </Button>
    </div>
  );
}

/** Small recurring icon marking a row as projected from, or posted by, a recurring transaction. */
export function RecurringIndicator({ className }: { className?: string }) {
  const { t } = useLingui();
  return (
    <RefreshCw
      className={cn('h-3.5 w-3.5 shrink-0 text-primary', className)}
      aria-label={t`Recurring transaction`}
      role="img"
    />
  );
}
