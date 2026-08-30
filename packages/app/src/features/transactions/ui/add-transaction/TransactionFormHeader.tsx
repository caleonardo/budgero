'use client';

/**
 * Transaction Form Header
 *
 * Header section for the Add Transaction form with title, description,
 * and the "Remember last" toggle.
 */

import * as React from 'react';

import { DialogHeader, DialogTitle, DialogDescription } from '@shared/ui/dialog';
import { Switch } from '@shared/ui/switch';
import { Label } from '@shared/ui/label';

interface TransactionFormHeaderProps {
  rememberLast: boolean;
  onRememberLastChange: (value: boolean) => void;
  title?: string;
  description?: string;
  showRememberLast?: boolean;
  recurringEnabled: boolean;
  onRecurringEnabledChange: (value: boolean) => void;
  recurringLocked?: boolean;
}

export const TransactionFormHeader = React.memo(function TransactionFormHeader({
  rememberLast,
  onRememberLastChange,
  title = 'Add New Transaction',
  description = 'Choose a transaction type and fill in the details below.',
  showRememberLast = true,
  recurringEnabled,
  onRecurringEnabledChange,
  recurringLocked = false,
}: TransactionFormHeaderProps) {
  return (
    <>
      <DialogHeader className="space-y-1.5">
        <DialogTitle className="text-lg sm:text-xl font-semibold">{title}</DialogTitle>
        <DialogDescription className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-between gap-3">
        {showRememberLast && (
          <div className="flex items-center gap-2">
            <Switch
              id="remember-last"
              checked={rememberLast}
              onCheckedChange={onRememberLastChange}
              className="scale-90 sm:scale-100"
            />
            <Label
              htmlFor="remember-last"
              className="text-[11px] sm:text-xs font-normal text-muted-foreground"
            >
              Remember last category, payee, account
            </Label>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Switch
            id="make-recurring"
            checked={recurringEnabled}
            onCheckedChange={onRecurringEnabledChange}
            disabled={recurringLocked}
            className="scale-90 sm:scale-100"
            data-testid="make-recurring-switch"
          />
          <Label
            htmlFor="make-recurring"
            className="text-[11px] sm:text-xs font-normal text-muted-foreground"
          >
            Make recurring
          </Label>
        </div>
      </div>
    </>
  );
});
