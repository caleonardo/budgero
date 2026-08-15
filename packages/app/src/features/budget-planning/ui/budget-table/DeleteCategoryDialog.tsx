import { Trans } from '@lingui/react/macro';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { toDecimal, type MilliUnits } from '@shared/lib/currency/milli';
import { BudgetRow } from '@features/budget-planning/lib/budget-transforms';

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categories: BudgetRow[];
  currentCategoryId: number;
  currentCategoryTotalTransactions: number;
  currentCategoryAssigned: MilliUnits;
  onDelete: (selectedCategoryId: number) => Promise<void> | void;
  isLoading?: boolean;
  /** Formats a stored integer-milliunit amount for display. */
  formatAmount?: (value: MilliUnits) => string;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  onClose,
  categories,
  currentCategoryTotalTransactions,
  currentCategoryAssigned,
  currentCategoryId,
  onDelete,
  isLoading = false,
  formatAmount = (value) => toDecimal(value).toLocaleString(),
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (selectedCategoryId === null || isLoading) {
      return;
    }

    try {
      await onDelete(selectedCategoryId);
      onClose();
    } catch (error) {
      console.error('Failed to reassign and delete category', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Delete Category</Trans>
          </DialogTitle>
          <DialogDescription>
            Before you can delete the category, you need to reassign all
            {currentCategoryTotalTransactions > 0 && currentCategoryAssigned > 0
              ? ' transactions and assignments'
              : currentCategoryTotalTransactions > 0
                ? ' transactions'
                : ' assignments'}{' '}
            to a new category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            <Trans>
              Select a category to reassign transactions, assigned amounts, and any remaining
              available amounts.
            </Trans>
          </p>
          <Select onValueChange={(value) => setSelectedCategoryId(parseInt(value, 10))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter(
                  (category) => category.categoryId !== currentCategoryId && !category.isGroup
                )
                .sort((a, b) => b.available - a.available || a.name.localeCompare(b.name))
                .map((category) => (
                  <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                    {category.name} ({formatAmount(category.available)})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="text-sm mt-4">
            <p>
              <Trans>Here's what will be reassigned to the new category:</Trans>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              {currentCategoryTotalTransactions > 0 && (
                <li>
                  <Trans>All transactions ({currentCategoryTotalTransactions})</Trans>
                </li>
              )}
              {currentCategoryAssigned > 0 && (
                <li>Assigned amount ({formatAmount(currentCategoryAssigned)})</li>
              )}
              <li>
                <Trans>Any remaining available amount</Trans>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={selectedCategoryId === null || isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
