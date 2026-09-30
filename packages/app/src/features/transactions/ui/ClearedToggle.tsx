import { useLingui } from '@lingui/react/macro';
import { CircleCheck, CircleDashed } from 'lucide-react';
import { toast } from 'sonner';
import { useSetTransactionsCleared } from '@entities/transaction/api/useTransactions';
import { cn } from '@shared/lib/utils';

interface ClearedToggleProps {
  transactionId: number;
  cleared: boolean;
  /** Trigger size, e.g. 'h-7 w-7' (desktop table) or 'h-6 w-6' (mobile card). */
  size?: string;
  /** Icon size, e.g. 'h-4 w-4' or 'h-3.5 w-3.5'. */
  iconSize?: string;
}

/**
 * Round icon button that toggles a transaction between uncleared and cleared.
 * Reconciled transactions are locked and use StatusIndicatorPopover instead.
 */
export function ClearedToggle({
  transactionId,
  cleared,
  size = 'h-7 w-7',
  iconSize = 'h-4 w-4',
}: ClearedToggleProps) {
  const { t } = useLingui();
  const setCleared = useSetTransactionsCleared();

  return (
    <button
      type="button"
      aria-pressed={cleared}
      aria-label={cleared ? t`Cleared — mark as uncleared` : t`Uncleared — mark as cleared`}
      title={cleared ? t`Cleared` : t`Uncleared`}
      disabled={setCleared.isPending}
      onClick={(event) => {
        event.stopPropagation();
        setCleared.mutate(
          { ids: [transactionId], cleared: !cleared },
          { onError: () => toast.error(t`Could not update cleared status`) }
        );
      }}
      className={cn(
        size,
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
        cleared
          ? 'text-success hover:bg-success/10'
          : 'text-muted-foreground/60 hover:bg-muted hover:text-success'
      )}
    >
      {cleared ? <CircleCheck className={iconSize} /> : <CircleDashed className={iconSize} />}
    </button>
  );
}
