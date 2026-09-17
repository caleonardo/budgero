import { Trans } from '@lingui/react/macro';
import { Separator } from '@shared/ui/separator';
import { Button } from '@shared/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { PushApiState } from './usePushApiState';

interface TokenActionsProps {
  state: PushApiState;
}

export function TokenActions({ state }: TokenActionsProps) {
  const { handleGenerateToken, generateTokenMutation, revokeTokenMutation, setShowRevokeDialog } =
    state;

  return (
    <>
      <Separator />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleGenerateToken}
          disabled={generateTokenMutation.isPending}
        >
          <Trans>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Token
          </Trans>
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRevokeDialog(true)}
          disabled={revokeTokenMutation.isPending}
        >
          <Trans>
            <Trash2 className="h-4 w-4 mr-2" />
            Revoke Token
          </Trans>
        </Button>
      </div>
    </>
  );
}
