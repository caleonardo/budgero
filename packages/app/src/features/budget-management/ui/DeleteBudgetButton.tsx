import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { Button } from '@shared/ui/button';
import type { Budget } from '@budgero/core/browser';
import { useDeleteBudget } from '@entities/budget/api/useBudgets';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { getErrorMessage } from '@shared/lib/errors';

interface DeleteBudgetButtonProps {
  budget: Budget;
  onDeleted?: () => void;
  onError: (error: string | null) => void;
}

export const DeleteBudgetButton: React.FC<DeleteBudgetButtonProps> = ({
  budget,
  onDeleted,
  onError,
}) => {
  const { t } = useLingui();

  const deleteBudgetMutation = useDeleteBudget();

  const handleDelete = async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budget.ID);
      if (onDeleted) onDeleted();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to delete budget');
      onError(errorMessage);
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" data-testid="delete-budget-trigger">
          <Trans>Delete Budget</Trans>
        </Button>
      }
      title={t`Are you absolutely sure?`}
      description={
        <Trans>
          This action cannot be undone. This will permanently delete the budget "{budget.Name}" and
          all its associated data.
        </Trans>
      }
      confirmText={t`Delete Budget`}
      loadingText="Deleting..."
      isLoading={deleteBudgetMutation.isPending}
      onConfirm={handleDelete}
    />
  );
};
