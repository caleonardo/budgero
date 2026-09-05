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

interface DeleteCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categories: { categoryId: number; name: string; isGroup?: boolean; available?: MilliUnits }[];
  currentCategoryId: number;
  currentCategoryTotalTransactions?: number;
  currentCategoryAssigned?: MilliUnits;
  incomeOnly?: boolean;
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
  incomeOnly = false,
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isLoading) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            {incomeOnly ? (
              'Choose another income category to receive this category’s transactions and any assignments. Your income totals will stay the same.'
            ) : (
              <>
                Before you can delete the category, you need to reassign all
                {(currentCategoryTotalTransactions ?? 0) > 0 && (currentCategoryAssigned ?? 0) !== 0
                  ? ' transactions and assignments'
                  : (currentCategoryTotalTransactions ?? 0) > 0
                    ? ' transactions'
                    : ' assignments'}{' '}
                to a new category.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            Select a category to reassign transactions, assigned amounts, and any remaining
            available amounts.
          </p>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setSelectedCategoryId(parseInt(value, 10))}
          >
            <SelectTrigger aria-label="Destination category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter(
                  (category) => category.categoryId !== currentCategoryId && !category.isGroup
                )
                .sort(
                  (a, b) => (b.available ?? 0) - (a.available ?? 0) || a.name.localeCompare(b.name)
                )
                .map((category) => (
                  <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                    {category.name}
                    {!incomeOnly &&
                      category.available !== undefined &&
                      ` (${formatAmount(category.available)})`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="text-sm mt-4">
            <p>Here's what will be reassigned to the new category:</p>
            <ul className="list-disc pl-6 space-y-1">
              {(incomeOnly || (currentCategoryTotalTransactions ?? 0) > 0) && (
                <li>
                  All transactions
                  {currentCategoryTotalTransactions !== undefined &&
                    ` (${currentCategoryTotalTransactions})`}
                  , including split lines
                </li>
              )}
              {currentCategoryAssigned !== undefined && currentCategoryAssigned !== 0 && (
                <li>Assigned amount ({formatAmount(currentCategoryAssigned)})</li>
              )}
              <li>Any remaining available amount</li>
              <li>Scheduled transactions using this category</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
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
