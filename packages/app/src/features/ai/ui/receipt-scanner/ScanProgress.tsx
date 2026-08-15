import { Trans } from '@lingui/react/macro';
import { Progress } from '@shared/ui/progress';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@shared/ui/button';

interface ScanProgressProps {
  progress: number;
  message: string;
}

export function ScanProgress({ progress, message }: ScanProgressProps) {
  return (
    <div className="space-y-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Progress value={progress} className="w-full max-w-xs" />
        <p className="text-xs text-muted-foreground">
          <Trans>{progress}% complete</Trans>
        </p>
      </div>
    </div>
  );
}

interface ScanCompleteProps {
  selectedCount: number;
  onClose: () => void;
}

export function ScanComplete({ selectedCount, onClose }: ScanCompleteProps) {
  return (
    <div className="space-y-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium">
          <Trans>Transactions Imported!</Trans>
        </p>
        <p className="text-sm text-muted-foreground text-center">
          <Trans>Successfully imported {selectedCount} transactions from the receipt.</Trans>
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Button onClick={onClose}>
          <Trans>Done</Trans>
        </Button>
      </div>
    </div>
  );
}
