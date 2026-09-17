import { Trans } from '@lingui/react/macro';
import { Button } from '@shared/ui/button';
import { Camera } from 'lucide-react';

interface UploadActionsProps {
  canScan: boolean;
  onCancel: () => void;
  onScan: () => void;
}

export function UploadActions({ canScan, onCancel, onScan }: UploadActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        <Trans>Cancel</Trans>
      </Button>
      <Button onClick={onScan} disabled={!canScan}>
        <Trans>
          <Camera className="h-4 w-4 mr-2" />
          Scan Receipt
        </Trans>
      </Button>
    </div>
  );
}

interface ReviewActionsProps {
  selectedCount: number;
  onBack: () => void;
  onImport: () => void;
}

export function ReviewActions({ selectedCount, onBack, onImport }: ReviewActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onBack}>
        <Trans>Back</Trans>
      </Button>
      <Button onClick={onImport} disabled={selectedCount === 0}>
        <Trans>Import {selectedCount} Transactions</Trans>
      </Button>
    </div>
  );
}

interface CameraActionsProps {
  onCancel: () => void;
  onCapture: () => void;
}

export function CameraActions({ onCancel, onCapture }: CameraActionsProps) {
  return (
    <div className="flex justify-center gap-3">
      <Button variant="outline" onClick={onCancel}>
        <Trans>Cancel</Trans>
      </Button>
      <Button onClick={onCapture} size="lg">
        <Trans>
          <Camera className="h-5 w-5 mr-2" />
          Capture
        </Trans>
      </Button>
    </div>
  );
}
