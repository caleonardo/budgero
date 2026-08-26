import * as React from 'react';
import { LabelCombobox } from '@features/labels/ui/LabelCombobox';
import type { LabelListItem } from '@budgero/core/browser';

interface LabelSelectCellProps {
  budgetId: number;
  value?: number | null;
  onCommit: (newLabelId: number | null) => void;
  triggerClassName?: string;
  allowClear?: boolean;
  labels?: LabelListItem[];
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LabelSelectCell({
  budgetId,
  value,
  onCommit,
  triggerClassName,
  allowClear = true,
  labels,
  defaultOpen,
  onOpenChange,
}: LabelSelectCellProps) {
  const handleChange = React.useCallback(
    (next: number | null) => {
      if ((value ?? null) === next) {
        return;
      }
      onCommit(next);
    },
    [onCommit, value]
  );

  return (
    <LabelCombobox
      budgetId={budgetId}
      value={value ?? null}
      onChange={handleChange}
      triggerClassName={triggerClassName}
      allowClear={allowClear}
      labels={labels}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    />
  );
}
