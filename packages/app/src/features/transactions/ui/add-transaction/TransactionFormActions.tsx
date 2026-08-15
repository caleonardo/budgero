'use client';

import { Trans, useLingui } from '@lingui/react/macro';

/**
 * Transaction Form Actions
 *
 * Form action buttons: Cancel, Quick Add, and Submit.
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { DialogFooter } from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';

interface TransactionFormActionsProps {
  onQuickAdd: () => void;
  isCalculatingTransfer: boolean;
  isTransfer: boolean;
  isInflow: boolean;
  isOutflow: boolean;
}

export const TransactionFormActions = React.memo(function TransactionFormActions({
  onQuickAdd,
  isCalculatingTransfer,
  isTransfer,
  isInflow,
  isOutflow,
}: TransactionFormActionsProps) {
  const { t } = useLingui();

  const submitButtonClassName = React.useMemo(() => {
    const base = 'h-9 px-4 transition-colors sm:w-auto';
    if (isInflow) {
      return `${base} bg-success hover:bg-success/90 text-white`;
    }
    if (isOutflow) {
      return `${base} bg-destructive hover:bg-destructive/90 text-white`;
    }
    return base;
  }, [isInflow, isOutflow]);

  const submitButtonLabel = React.useMemo(() => {
    if (isCalculatingTransfer) {
      return (
        <Trans>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Trans>
      );
    }
    if (isTransfer) {
      return t`Add Transfer`;
    }
    return isInflow ? t`Add Income` : t`Add Expense`;
  }, [isCalculatingTransfer, isTransfer, isInflow, t]);

  // Two actions only — the dialog's X and Esc already cover cancel.
  return (
    <DialogFooter className="mt-4 flex-col gap-2 sm:mt-6 sm:flex-col">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button
          onClick={onQuickAdd}
          disabled={isCalculatingTransfer}
          variant="outline"
          type="button"
          className="h-9 px-4 sm:w-auto"
        >
          <Trans>Quick Add</Trans>
        </Button>
        <Button
          disabled={isCalculatingTransfer}
          type="submit"
          className={submitButtonClassName}
          data-testid="add-transaction-submit"
        >
          {submitButtonLabel}
        </Button>
      </div>
      <span className="hidden text-right text-[10px] text-muted-foreground sm:block">
        <Trans>Press Cmd+Enter to save</Trans>
      </span>
    </DialogFooter>
  );
});
