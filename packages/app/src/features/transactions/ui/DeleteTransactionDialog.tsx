import { useLingui } from '@lingui/react/macro';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

/**
 * Confirmation dialog for permanently deleting a single transaction.
 * Shared by the mobile transaction list, the dashboard transaction cards,
 * and the mobile spending drawer.
 */
export function DeleteTransactionDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isPending: boolean;
}) {
  const { t } = useLingui();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t`Delete this transaction?`}
      confirmText={t`Delete`}
      loadingText="Deleting..."
      variant="destructive"
      onConfirm={onConfirm}
      isLoading={isPending}
    />
  );
}
