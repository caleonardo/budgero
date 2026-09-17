import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';

import { Button } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import type { CategoryGroup } from '@budgero/core/browser';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryGroups: CategoryGroup[] | undefined;
  pendingCategoryName: string;
  onPendingCategoryNameChange: (value: string) => void;
  searchTerm: string;
  selectedGroupIdForCreate: number | null;
  onSelectedGroupIdForCreateChange: (groupId: number) => void;
  createError: string | null;
  isPending: boolean;
  onConfirm: () => void;
}

/**
 * "Create new category" dialog offered from SearchableCategorySelect when the
 * search term doesn't match any existing category. State (the pending name,
 * chosen group, in-flight/error state) stays owned by the parent — this is a
 * presentational block, not a self-contained dialog.
 */
export function CreateCategoryDialog({
  open,
  onOpenChange,
  categoryGroups,
  pendingCategoryName,
  onPendingCategoryNameChange,
  searchTerm,
  selectedGroupIdForCreate,
  onSelectedGroupIdForCreateChange,
  createError,
  isPending,
  onConfirm,
}: CreateCategoryDialogProps) {
  const { t } = useLingui();

  const noGroupsAvailable = (categoryGroups?.length ?? 0) === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create new category</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Choose where to file “{pendingCategoryName || searchTerm.trim()}”.</Trans>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-category-name">
              <Trans>Category name</Trans>
            </Label>
            <Input
              id="new-category-name"
              value={pendingCategoryName}
              onChange={(event) => onPendingCategoryNameChange(event.target.value)}
              autoFocus
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-category-group">
              <Trans>Category group</Trans>
            </Label>
            <Select
              value={selectedGroupIdForCreate ? String(selectedGroupIdForCreate) : undefined}
              onValueChange={(value) => onSelectedGroupIdForCreateChange(Number(value))}
              disabled={isPending || noGroupsAvailable}
            >
              <SelectTrigger id="new-category-group" className="w-full">
                <SelectValue
                  placeholder={noGroupsAvailable ? t`No groups available` : t`Select a group`}
                />
              </SelectTrigger>
              <SelectContent>
                {(categoryGroups ?? []).map((group) => (
                  <SelectItem key={group.ID} value={String(group.ID)}>
                    {group.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          {noGroupsAvailable && (
            <p className="text-sm text-muted-foreground">
              <Trans>You’ll need at least one category group before creating categories.</Trans>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={
              isPending ||
              !pendingCategoryName.trim() ||
              !selectedGroupIdForCreate ||
              noGroupsAvailable
            }
          >
            {isPending ? t`Creating…` : t`Create`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
