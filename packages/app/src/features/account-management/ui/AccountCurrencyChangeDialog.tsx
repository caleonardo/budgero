import type { AccountCurrencyChangeMode } from '@entities/account/api/useAccounts';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { RadioGroup, RadioGroupItem } from '@shared/ui/radio-group';

interface AccountCurrencyChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string;
  oldCurrency: string;
  newCurrency: string;
  mode: AccountCurrencyChangeMode;
  onModeChange: (mode: AccountCurrencyChangeMode) => void;
  hasLinkedTransfers: boolean;
  isLoading: boolean;
  onConfirm: () => void;
}

export function AccountCurrencyChangeDialog({
  open,
  onOpenChange,
  accountName,
  oldCurrency,
  newCurrency,
  mode,
  onModeChange,
  hasLinkedTransfers,
  isLoading,
  onConfirm,
}: AccountCurrencyChangeDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change account currency?"
      description={`Choose how existing amounts in ${accountName} should be handled when changing from ${oldCurrency} to ${newCurrency}.`}
      confirmText="Change currency"
      loadingText="Changing currency..."
      isLoading={isLoading}
      onConfirm={onConfirm}
    >
      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as AccountCurrencyChangeMode)}
        aria-label="Existing amount handling"
      >
        <label
          htmlFor="currency-change-convert"
          className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
        >
          <RadioGroupItem id="currency-change-convert" value="convert" className="mt-0.5" />
          <span className="space-y-1">
            <span className="block text-sm font-medium">Convert existing amounts</span>
            <span className="block text-xs text-muted-foreground">
              Treat the current amounts as {oldCurrency}. For example, 10 {oldCurrency} becomes the
              equivalent amount in {newCurrency}, while its budget value stays approximately the
              same.
            </span>
          </span>
        </label>

        <label
          htmlFor="currency-change-reinterpret"
          className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
        >
          <RadioGroupItem id="currency-change-reinterpret" value="reinterpret" className="mt-0.5" />
          <span className="space-y-1">
            <span className="block text-sm font-medium">Keep the numbers</span>
            <span className="block text-xs text-muted-foreground">
              Correct a mislabeled account. For example, 10 {oldCurrency} becomes 10 {newCurrency},
              and its value in the budget currency is recalculated.
            </span>
          </span>
        </label>
      </RadioGroup>

      {mode === 'reinterpret' && hasLinkedTransfers ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This account contains transfers. Only this account’s amounts will be reinterpreted, so
          review the linked transfer amounts afterward.
        </p>
      ) : null}
    </ConfirmDialog>
  );
}
