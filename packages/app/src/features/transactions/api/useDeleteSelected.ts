import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useDeleteTransactions } from '@entities/transaction/api/useTransactions';
import { useUndoStore } from '@shared/mutations/UndoStore';
import { toastError } from '@shared/lib/errors';

/** Deletes transactions with a toast that offers Undo. Shared by the batch toolbar and Delete key. */
export function useDeleteSelected() {
  const { t } = useLingui();
  const deleteTransactions = useDeleteTransactions();
  const undo = useUndoStore((state) => state.undo);
  const canUndo = useUndoStore((state) => state.canUndo);

  const deleteRows = useCallback(
    async (ids: number[], onDeleted?: () => void) => {
      if (!ids.length || deleteTransactions.isPending) return;
      try {
        await deleteTransactions.mutateAsync({ transactionIds: ids });
        const count = ids.length;
        toast.success(
          plural(count, { one: '# transaction deleted', other: '# transactions deleted' }),
          {
            action: {
              label: t`Undo`,
              onClick: () => void (canUndo() && undo()),
            },
          }
        );
        onDeleted?.();
      } catch (error) {
        console.error('Error deleting transactions:', error);
        toastError(t`Failed to delete transactions`, error, t`Please try again.`);
      }
    },
    [deleteTransactions, undo, canUndo, t]
  );

  return { deleteRows, isDeleting: deleteTransactions.isPending };
}
