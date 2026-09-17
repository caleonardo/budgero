import { Trans } from '@lingui/react/macro';
import { RefreshCw, X } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';

type Props = {
  open: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  currentVersion?: string;
};

export function PWAUpdatePrompt({ open, onUpdate, onDismiss, currentVersion }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle>
              <Trans>Update available</Trans>
            </CardTitle>
          </div>
          <CardDescription>
            <Trans>
              A new Budgero build is ready to install. Refresh now to load the latest features and
              fixes.
            </Trans>
          </CardDescription>
        </CardHeader>
        {currentVersion && (
          <div className="px-6 text-sm text-muted-foreground">
            <Trans>
              <span className="font-semibold text-foreground">{currentVersion}</span>→ latest build
            </Trans>
          </div>
        )}
        <CardFooter className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onDismiss}>
            <Trans>
              <X className="mr-2 h-4 w-4" />
              Later
            </Trans>
          </Button>
          <Button className="flex-1" onClick={onUpdate}>
            <Trans>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update now
            </Trans>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
