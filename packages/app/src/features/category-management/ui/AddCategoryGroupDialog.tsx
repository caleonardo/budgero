import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { AddNameDialog } from './AddNameDialog';

interface AddCategoryGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving?: boolean;
}

export const AddCategoryGroupDialog: React.FC<AddCategoryGroupDialogProps> = (props) => {
  const { t } = useLingui();

  return (
    <AddNameDialog
      {...props}
      title={t`Add Category Group`}
      description={t`Create a new category group to organize your budget categories`}
      inputId="group-name"
      labelText="Group Name"
      placeholder={t`e.g., Monthly Bills`}
      savingLabel="Creating..."
      confirmLabel="Create Group"
    />
  );
};
