import { useLingui } from '@lingui/react/macro';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import type { PushApiState } from './usePushApiState';

interface RevokeDialogProps {
  state: PushApiState;
}

export function RevokeDialog({ state }: RevokeDialogProps) {
  const { t } = useLingui();

  const { showRevokeDialog, setShowRevokeDialog, revokeTokenMutation } = state;

  return (
    <ConfirmDialog
      open={showRevokeDialog}
      onOpenChange={setShowRevokeDialog}
      title={t`Revoke API Token?`}
      description={t`This will permanently delete your API token. Any external services using this token will no longer be able to send data to Budgero. This action cannot be undone.`}
      confirmText={t`Revoke Token`}
      variant="destructive"
      onConfirm={() => revokeTokenMutation.mutate()}
    />
  );
}
