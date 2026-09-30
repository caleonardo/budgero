import { Trans } from '@lingui/react/macro';
import { Button } from '@shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/ui/alert-dialog';
import type { RecurringOccurrenceWithTemplate } from '@budgero/core/browser';
import { formatDueLabel } from '@shared/lib/date-utils';

interface RecurringOccurrenceRowProps {
  occurrence: RecurringOccurrenceWithTemplate;
  isProcessing: boolean;
  isMarkReadyPending: boolean;
  isSkipPending: boolean;
  isFetching: boolean;
  onMarkReady: () => void;
  onSkip: () => void;
}

export function RecurringOccurrenceRow({
  occurrence,
  isProcessing,
  isMarkReadyPending,
  isSkipPending,
  isFetching,
  onMarkReady,
  onSkip,
}: RecurringOccurrenceRowProps) {
  const { template } = occurrence;
  const busy = isProcessing || isFetching;

  return (
    <li className="flex items-center justify-between gap-3 py-1.5 pl-10 pr-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="text-sm tabular-nums">{occurrence.dueDate}</span>
        <span className="truncate text-xs text-muted-foreground">
          {formatDueLabel(occurrence.dueDate)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs"
              loading={isProcessing && isMarkReadyPending}
              disabled={busy || isMarkReadyPending}
            >
              <Trans>Mark ready</Trans>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans>Mark “{template.name}” as ready?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>
                  We will create the transaction dated {occurrence.dueDate} and run continuous rules
                  automatically.
                </Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={onMarkReady}>
                <Trans>Post transaction</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          disabled={busy || isSkipPending}
          onClick={onSkip}
        >
          <Trans>Skip</Trans>
        </Button>
      </div>
    </li>
  );
}
