import { Trans, useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t`Change account currency?`}
      description={t`Choose how existing amounts in ${accountName} should be handled when changing from ${oldCurrency} to ${newCurrency}.`}
      confirmText={t`Change currency`}
      loadingText="Changing currency..."
      isLoading={isLoading}
      onConfirm={onConfirm}
    >
      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as AccountCurrencyChangeMode)}
        aria-label={t`Existing amount handling`}
      >
        <label
          htmlFor="currency-change-convert"
          className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
        >
          <RadioGroupItem id="currency-change-convert" value="convert" className="mt-0.5" />
          <span className="space-y-1">
            <span className="block text-sm font-medium">
              <Trans>Convert existing amounts</Trans>
            </span>
            <span className="block text-xs text-muted-foreground">
              <Trans>
                Treat the current amounts as {oldCurrency}. For example, 10 {oldCurrency} becomes
                the equivalent amount in {newCurrency}, while its budget value stays approximately
                the same.
              </Trans>
            </span>
          </span>
        </label>

        <label
          htmlFor="currency-change-reinterpret"
          className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
        >
          <RadioGroupItem id="currency-change-reinterpret" value="reinterpret" className="mt-0.5" />
          <span className="space-y-1">
            <span className="block text-sm font-medium">
              <Trans>Keep the numbers</Trans>
            </span>
            <span className="block text-xs text-muted-foreground">
              <Trans>
                Correct a mislabeled account. For example, 10 {oldCurrency} becomes 10 {newCurrency}
                , and its value in the budget currency is recalculated.
              </Trans>
            </span>
          </span>
        </label>
      </RadioGroup>

      {mode === 'reinterpret' && hasLinkedTransfers ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Trans>
            This account contains transfers. Only this account’s amounts will be reinterpreted, so
            review the linked transfer amounts afterward.
          </Trans>
        </p>
      ) : null}
    </ConfirmDialog>
  );
}
