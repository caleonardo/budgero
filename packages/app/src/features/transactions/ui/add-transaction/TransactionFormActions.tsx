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
  onCancel: () => void;
  onQuickAdd: () => void;
  isCalculatingTransfer: boolean;
  isTransfer: boolean;
  isInflow: boolean;
  isOutflow: boolean;
  recurringMode?: 'create' | 'edit' | null;
  isSubmitting?: boolean;
}

export const TransactionFormActions = React.memo(function TransactionFormActions({
  onCancel,
  onQuickAdd,
  isCalculatingTransfer,
  isTransfer,
  isInflow,
  isOutflow,
  recurringMode = null,
  isSubmitting = false,
}: TransactionFormActionsProps) {
  const { t } = useLingui();

  const submitButtonClassName = React.useMemo(() => {
    const base = 'h-8 sm:h-9 px-3 sm:px-4 flex-1 sm:flex-initial transition-colors';
    if (isInflow) {
      return `${base} bg-success hover:bg-success/90 text-white`;
    }
    if (isOutflow) {
      return `${base} bg-destructive hover:bg-destructive/90 text-white`;
    }
    return base;
  }, [isInflow, isOutflow]);

  const submitButtonLabel = React.useMemo(() => {
    if (isCalculatingTransfer || isSubmitting) {
      return (
        <Trans>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Trans>
      );
    }
    if (recurringMode === 'edit') {
      return t`Save recurring transaction`;
    }
    if (recurringMode === 'create') {
      return t`Create recurring transaction`;
    }
    if (isTransfer) {
      return t`Add Transfer`;
    }
    return isInflow ? t`Add Income` : t`Add Expense`;
  }, [isCalculatingTransfer, isSubmitting, recurringMode, isTransfer, isInflow, t]);

  return (
    <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
      <div className="flex gap-2 order-2 sm:order-1 items-center">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="h-8 sm:h-9 px-3 sm:px-4 flex-1 sm:flex-initial"
        >
          <Trans>Cancel</Trans>
        </Button>
        <span className="hidden sm:inline-block text-[10px] text-muted-foreground ml-2">
          <Trans>Press Cmd+Enter to save</Trans>
        </span>
      </div>
      <div className="flex gap-2 order-1 sm:order-2">
        {!recurringMode && (
          <Button
            onClick={onQuickAdd}
            disabled={isCalculatingTransfer || isSubmitting}
            variant="outline"
            type="button"
            className="h-8 sm:h-9 px-3 sm:px-4 flex-1 sm:flex-initial"
          >
            <Trans>Quick Add</Trans>
          </Button>
        )}
        <Button
          disabled={isCalculatingTransfer || isSubmitting}
          type="submit"
          className={submitButtonClassName}
          data-testid="add-transaction-submit"
        >
          {submitButtonLabel}
        </Button>
      </div>
    </DialogFooter>
  );
});
