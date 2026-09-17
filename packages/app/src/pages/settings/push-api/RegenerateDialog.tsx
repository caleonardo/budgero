import { Trans, useLingui } from '@lingui/react/macro';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { AlertTriangle } from 'lucide-react';
import type { PushApiState } from './usePushApiState';

interface RegenerateDialogProps {
  state: PushApiState;
}

export function RegenerateDialog({ state }: RegenerateDialogProps) {
  const { t } = useLingui();

  const {
    showRegenerateDialog,
    setShowRegenerateDialog,
    showKeyWarningDialog,
    setShowKeyWarningDialog,
    confirmRegenerate,
    confirmRevealKey,
  } = state;

  return (
    <>
      {/* Regenerate Confirmation Dialog */}
      <ConfirmDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        title={t`Regenerate API Token?`}
        description={t`This will create a new token and invalidate your current one. Any external services using the old token will need to be updated with the new token.`}
        confirmText={t`Regenerate Token`}
        onConfirm={confirmRegenerate}
      />

      {/* Encryption Key Warning Dialog */}
      <ConfirmDialog
        open={showKeyWarningDialog}
        onOpenChange={setShowKeyWarningDialog}
        icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
        title={t`Security Warning`}
        description={
          <span className="block space-y-3">
            <p>
              <Trans>
                You are about to reveal your{' '}
                <strong>
                  <Trans>encryption key</Trans>
                </strong>
                . This key can decrypt all your budget data.
              </Trans>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <Trans>Never share this key publicly</Trans>
              </li>
              <li>
                <Trans>Store it in a secure password manager</Trans>
              </li>
              <li>
                <Trans>Anyone with this key can read your budget data</Trans>
              </li>
              <li>
                <Trans>The key will auto-hide after 60 seconds</Trans>
              </li>
            </ul>
            <p className="font-medium">
              <Trans>Are you sure you want to reveal the key?</Trans>
            </p>
          </span>
        }
        confirmText={t`Reveal Key`}
        onConfirm={confirmRevealKey}
      />
    </>
  );
}
