import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { AddNameDialog } from './AddNameDialog';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving?: boolean;
}

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = (props) => {
  const { t } = useLingui();

  return (
    <AddNameDialog
      {...props}
      title={t`Add Category`}
      description={t`Create a new category in this group`}
      inputId="category-name"
      labelText="Category Name"
      placeholder={t`e.g., Groceries`}
      savingLabel="Creating..."
      confirmLabel="Create Category"
    />
  );
};
