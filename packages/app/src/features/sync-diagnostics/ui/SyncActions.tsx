import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { ClipboardCopy, DownloadCloud, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MUTATION_FORMAT_VERSION } from '@budgero/runtime';
import { getErrorMessage } from '@shared/lib/errors';
import { Button } from '@shared/ui/button';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import {
  useLastSyncError,
  useLocalSyncState,
  useRedownloadFromServer,
  useServerSyncState,
  useServerVersion,
} from '../api/useSyncDiagnostics';
import { buildDiagnosticsReport } from '../lib/sync-position';

export function SyncActions() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { data: local } = useLocalSyncState();
  const { data: server } = useServerSyncState();
  const { data: version } = useServerVersion();
  const lastError = useLastSyncError();
  const redownload = useRedownloadFromServer();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingCount = local?.diagnostics?.pendingCount ?? 0;

  const copyReport = async () => {
    const report = buildDiagnosticsReport({
      appVersion: __APP_VERSION__,
      buildSha: __APP_BUILD_SHA__,
      serverVersion: version?.build_version,
      latestVersion: version?.latest_version,
      schemaVersion: local?.schemaVersion,
      supportedSchemaVersion: local?.supportedSchemaVersion ?? 0,
      dataFormatVersion: MUTATION_FORMAT_VERSION,
      spaceId: local?.diagnostics?.spaceId,
      runtimeState: local?.runtimeState ?? 'unknown',
      connected: local?.diagnostics?.connected,
      cursor: local?.diagnostics?.cursor,
      head: server?.mutation_version,
      snapshotVersion: server?.snapshot_mutation_version || undefined,
      snapshotUpdatedAt: server?.snapshot_updated_at,
      pendingCount: local?.diagnostics?.pendingCount,
      lastError,
    });
    try {
      await navigator.clipboard.writeText(report);
      toast.success(t`Diagnostics copied`);
    } catch {
      toast.error(t`Couldn't copy to the clipboard`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => void queryClient.invalidateQueries({ queryKey: ['syncDiagnostics'] })}
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        <Trans>Refresh</Trans>
      </Button>
      <Button size="sm" variant="outline" onClick={() => void copyReport()}>
        <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />
        <Trans>Copy diagnostics</Trans>
      </Button>
      <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)}>
        <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
        <Trans>Re-download from server</Trans>
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t`Re-download from server?`}
        description={
          pendingCount > 0
            ? t`This replaces the data on this device with the server copy, then applies the changes made after it. ${pendingCount} changes from this device haven't been confirmed yet; they are kept and applied again on top.`
            : t`This replaces the data on this device with the server copy, then applies the changes made after it. Use it if this device shows something different from your other devices.`
        }
        confirmText={t`Re-download`}
        isLoading={redownload.isPending}
        onConfirm={async () => {
          try {
            const result = await redownload.mutateAsync();
            if (!result.restored) toast.info(t`There is no server copy to download yet.`);
            else if (!result.catchUpRequested)
              toast.success(t`Downloaded. Newer changes will apply when you're back online.`);
            else toast.success(t`Downloaded the server copy`);
            setConfirmOpen(false);
          } catch (error) {
            toast.error(getErrorMessage(error, t`Couldn't download from the server`));
          }
        }}
      />
    </div>
  );
}
