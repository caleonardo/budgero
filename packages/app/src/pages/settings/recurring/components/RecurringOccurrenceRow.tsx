import { Trans, useLingui } from '@lingui/react/macro';
import { Card, CardContent } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
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
import { Loader2, Sparkles } from 'lucide-react';
import type { RecurringOccurrenceWithTemplate } from '@budgero/core/browser';
import { formatDueLabel } from '@shared/lib/date-utils';
import { formatRecurringAmount } from './format-recurring-amount';

interface RecurringOccurrenceCardProps {
  occurrence: RecurringOccurrenceWithTemplate;
  accountName: string;
  accountCurrency?: string;
  toAccountName?: string;
  categoryName: string;
  accountLocalizer: { format: (n: number) => string };
  budgetCurrency?: string;
  budgetLocalizer?: { format: (n: number) => string };
  isProcessing: boolean;
  isMarkReadyPending: boolean;
  isSkipPending: boolean;
  isFetching: boolean;
  onMarkReady: () => void;
  onSkip: () => void;
}

export function RecurringOccurrenceCard({
  occurrence,
  accountName,
  accountCurrency,
  toAccountName,
  categoryName,
  accountLocalizer,
  budgetCurrency,
  budgetLocalizer,
  isProcessing,
  isMarkReadyPending,
  isSkipPending,
  isFetching,
  onMarkReady,
  onSkip,
}: RecurringOccurrenceCardProps) {
  const { t } = useLingui();

  const { template } = occurrence;
  const amountDisplay = formatRecurringAmount(template, accountLocalizer);
  const budgetAmountDisplay =
    template.budgetAmount != null &&
    budgetLocalizer &&
    accountCurrency &&
    budgetCurrency &&
    accountCurrency !== budgetCurrency
      ? `≈ ${formatRecurringAmount(template, budgetLocalizer, template.budgetAmount)}`
      : null;
  const dueLabel = formatDueLabel(occurrence.dueDate);

  return (
    <Card className="relative">
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={template.direction === 'inflow' ? 'default' : 'secondary'}>
              {template.toAccountId != null
                ? t`Transfer`
                : template.direction === 'inflow'
                  ? t`Income`
                  : t`Bill`}
            </Badge>
            <span className="text-sm text-muted-foreground">{template.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              <Trans>Due:</Trans>
            </span>{' '}
            {occurrence.dueDate} ({dueLabel})
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              <Trans>Amount:</Trans>
            </span>{' '}
            {amountDisplay}
            {budgetAmountDisplay ? (
              <span className="ml-2 text-xs">({budgetAmountDisplay})</span>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              <Trans>Amount:</Trans>
            </span>{' '}
            {amountDisplay}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {template.toAccountId != null ? t`From account:` : t`Account:`}
            </span>{' '}
            {accountName}
          </div>
          {template.toAccountId != null ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                <Trans>To account:</Trans>
              </span>{' '}
              {toAccountName ?? t`Unknown account`}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                <Trans>Category:</Trans>
              </span>{' '}
              {categoryName}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isProcessing || isMarkReadyPending || isFetching}>
                <Trans>
                  {isProcessing && isMarkReadyPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Mark ready
                </Trans>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans>Mark “{template.name}” as ready?</Trans>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans>
                    We will create the transaction dated {occurrence.dueDate} and run continuous
                    rules automatically.
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
            className="text-muted-foreground hover:text-foreground"
            disabled={isProcessing || isSkipPending || isFetching}
            onClick={onSkip}
          >
            <Trans>Skip this time</Trans>
          </Button>
        </div>
        {(isProcessing || isFetching) && (
          <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm" />
        )}
      </CardContent>
    </Card>
  );
}
