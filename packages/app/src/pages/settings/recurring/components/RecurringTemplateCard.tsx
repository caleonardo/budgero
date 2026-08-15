import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { parseISO } from 'date-fns';
import { formatRelativeToNow as formatDistanceToNow } from '@shared/lib/date-format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Separator } from '@shared/ui/separator';
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
import { CalendarDays, Clock, Loader2, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import type { RecurringTransaction, RecurringOccurrenceWithTemplate } from '@budgero/core/browser';
import { formatRecurringAmount } from './format-recurring-amount';

function frequencyLabelFor(schedule: RecurringTransaction['schedule']): string {
  const key = `${schedule.intervalUnit}:${schedule.intervalCount ?? 1}`;
  switch (key) {
    case 'day:1':
      return 'Daily';
    case 'week:1':
      return 'Weekly';
    case 'week:2':
      return t`Every 2 weeks`;
    case 'month:1':
      return 'Monthly';
    case 'month:2':
      return t`Every 2 months`;
    case 'month:3':
      return 'Quarterly';
    case 'month:6':
      return t`Every 6 months`;
    case 'year:1':
      return 'Yearly';
    default:
      return t`Custom cadence`;
  }
}

interface RecurringTemplateCardProps {
  template: RecurringTransaction;
  accountName: string;
  toAccountName?: string;
  categoryName: string | undefined;
  nextOccurrence: RecurringOccurrenceWithTemplate | undefined;
  localizer: { format: (n: number) => string };
  isProcessing: boolean;
  isTogglePending: boolean;
  onToggleActive: (nextActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecurringTemplateCard({
  template,
  accountName,
  toAccountName,
  categoryName,
  nextOccurrence,
  localizer,
  isProcessing,
  isTogglePending,
  onToggleActive,
  onEdit,
  onDelete,
}: RecurringTemplateCardProps) {
  const { t } = useLingui();

  const dueLabel = nextOccurrence
    ? formatDistanceToNow(parseISO(nextOccurrence.dueDate), { addSuffix: true })
    : t`No upcoming dates`;
  const amountDisplay = formatRecurringAmount(template, localizer);
  const frequencyLabel = frequencyLabelFor(template.schedule);

  return (
    <Card
      className={cn('relative transition-shadow hover:shadow-md', !template.active && 'opacity-75')}
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {template.name}
              <Badge variant={template.direction === 'inflow' ? 'default' : 'secondary'}>
                {template.toAccountId != null
                  ? t`Transfer`
                  : template.direction === 'inflow'
                    ? t`Income`
                    : t`Bill`}
              </Badge>
            </CardTitle>
            <CardDescription>{template.memo || t`No memo provided`}</CardDescription>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 self-end sm:mt-0 sm:justify-end sm:self-auto">
            <Badge variant="outline">{amountDisplay}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(!template.active)}
              disabled={isProcessing || isTogglePending}
            >
              {template.active ? t`Pause` : t`Resume`}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {frequencyLabel}
          </span>
          <span className="flex items-center gap-1">
            <Trans>
              <CalendarDays className="h-3.5 w-3.5" />
              Started {template.schedule.startDate}
            </Trans>
          </span>
          <span className="flex items-center gap-1">
            <Trans>
              <Clock className="h-3.5 w-3.5" />
              Next due {dueLabel}
            </Trans>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">
              {template.toAccountId != null ? t`From account:` : t`Account:`}
            </span>{' '}
            {accountName}
          </div>
          {template.toAccountId != null ? (
            <div>
              <span className="font-medium text-foreground">
                <Trans>To account:</Trans>
              </span>{' '}
              {toAccountName ?? t`Unknown account`}
            </div>
          ) : (
            <div>
              <span className="font-medium text-foreground">
                <Trans>Category:</Trans>
              </span>{' '}
              {categoryName}
            </div>
          )}
          <div>
            <Trans>
              <span className="font-medium text-foreground">
                <Trans>Remind me:</Trans>
              </span>{' '}
              {template.notifyDaysBefore || 0}day(s) before
            </Trans>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={isProcessing}>
            <Trans>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Trans>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={isProcessing}
              >
                <Trans>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Trans>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans>Delete “{template.name}”?</Trans>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans>
                    This will remove upcoming reminders. Existing transactions are unaffected.
                  </Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans>Cancel</Trans>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trans>Delete</Trans>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      {isProcessing && (
        <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </Card>
  );
}
