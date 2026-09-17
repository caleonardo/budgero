import { Trans, useLingui } from '@lingui/react/macro';
import { isValidFundingPriority } from '@budgero/core/browser';
import { useGoalFundingSettings } from '@entities/budget/api/useGoalFundingSettings';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Switch } from '@shared/ui/switch';
import { toast } from 'sonner';
import { FundingPriorityInput } from './FundingPriorityInput';

interface CategoryEditDialogProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  budgetId: number;
  fundingPriority: number;
  excludeFromBudgetPace: boolean;
  onSave: (name: string, excludeFromBudgetPace: boolean, priority: number) => void;
  isSaving?: boolean;
}

export const CategoryEditDialog: React.FC<CategoryEditDialogProps> = ({
  open,
  onClose,
  categoryName,
  budgetId,
  fundingPriority,
  excludeFromBudgetPace,
  onSave,
  isSaving = false,
}) => {
  const { t } = useLingui();

  const settings = useGoalFundingSettings(budgetId);
  const [priority, setPriority] = useState(String(fundingPriority));
  const [name, setName] = useState(categoryName);
  const [exclude, setExclude] = useState(excludeFromBudgetPace);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setName(categoryName);
        setPriority(String(fundingPriority));
        setExclude(excludeFromBudgetPace);
      });
    }
  }, [open, categoryName, excludeFromBudgetPace, fundingPriority]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t`Category name cannot be empty`);
      return;
    }

    if (isSaving || !settings.isReady) return;
    if (!isValidFundingPriority(Number(priority), settings.CategoryPriorityMode)) {
      toast.error(t`Enter a valid funding priority`);
      return;
    }
    onSave(name.trim(), exclude, Number(priority));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit Category</Trans>
          </DialogTitle>
          <DialogDescription>
            Update the category name, funding priority, and budget pace settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">
              <Trans>Category Name</Trans>
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t`Enter category name`}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <FundingPriorityInput
            value={priority}
            onChange={setPriority}
            mode={settings.CategoryPriorityMode}
            disabled={isSaving || !settings.isReady}
          />
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="exclude-budget-pace" className="text-sm font-medium">
                <Trans>Exclude from Budget Pace</Trans>
              </Label>
              <p className="text-xs text-muted-foreground">
                <Trans>
                  When enabled, this category won't show budget pace lines in spending charts
                </Trans>
              </p>
            </div>
            <Switch id="exclude-budget-pace" checked={exclude} onCheckedChange={setExclude} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !settings.isReady}>
            {isSaving ? t`Saving...` : t`Save Changes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
