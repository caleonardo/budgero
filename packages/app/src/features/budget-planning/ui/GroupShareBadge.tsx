import { cn } from '@shared/lib/utils';

interface GroupShareBadgeProps {
  /** Share of the month's total assigned, 0–1. Renders nothing when undefined. */
  share?: number;
  className?: string;
}

/**
 * "50%" pill shown next to a category group's allocated total when the
 * "Category Group Percentages" budget setting is on.
 */
export function GroupShareBadge({ share, className }: GroupShareBadgeProps) {
  if (share === undefined || !Number.isFinite(share)) return null;
  const percent = Math.round(share * 100);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded px-1 text-[10px] font-medium tabular-nums leading-4',
        'bg-primary/10 text-primary dark:bg-white/15 dark:text-white',
        className
      )}
      title="Share of everything assigned this month"
      data-testid="group-share-badge"
    >
      {percent}%
    </span>
  );
}
