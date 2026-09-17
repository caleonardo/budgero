import { Trans } from '@lingui/react/macro';
import { Button } from '@shared/ui/button';
import { Camera, Upload } from 'lucide-react';

interface ReceiptDropzoneProps {
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onStartCamera: () => void;
  onBrowseFiles: () => void;
}

export function ReceiptDropzone({
  onDrop,
  onDragOver,
  onStartCamera,
  onBrowseFiles,
}: ReceiptDropzoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onStartCamera}
            className="flex-1 h-24 flex-col gap-2"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm">
              <Trans>Take Photo</Trans>
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onBrowseFiles}
            className="flex-1 h-24 flex-col gap-2"
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">
              <Trans>Browse Files</Trans>
            </span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          <Trans>Or drag and drop an image here</Trans>
        </p>
      </div>
    </div>
  );
}
