import { Badge } from '@shared/ui/badge';
import { hexToRgba } from '@shared/lib/color/hex';
import { cn } from '@shared/lib/utils';

const DEFAULT_LABEL_COLOR = '#9CA3AF';

interface TransactionLabelBadgeProps {
  label: string;
  color?: string | null;
  className?: string;
  hideTextOnSmallScreens?: boolean;
}

/** Consistent transaction-label color treatment for table and card displays. */
export function TransactionLabelBadge({
  label,
  color,
  className,
  hideTextOnSmallScreens = false,
}: TransactionLabelBadgeProps) {
  const labelColor = color || DEFAULT_LABEL_COLOR;

  return (
    <Badge
      variant="outline"
      className={cn('h-5 min-w-0 max-w-full rounded-full px-1.5 py-0 sm:px-2', className)}
      style={{
        backgroundColor: hexToRgba(labelColor, 0.12),
        borderColor: hexToRgba(labelColor, 0.4),
      }}
      title={label}
      aria-label={`Label: ${label}`}
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full border border-white/60"
        style={{ backgroundColor: labelColor }}
        aria-hidden
      />
      {hideTextOnSmallScreens ? (
        <>
          <span className="sr-only sm:hidden">{label}</span>
          <span className="hidden truncate sm:inline">{label}</span>
        </>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Badge>
  );
}
