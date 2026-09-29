import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';
import { parseISO } from 'date-fns';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useSimilarTransactions } from '@entities/transaction/api/queries';
import { formatNativeAmount } from '@entities/currency/lib/currency-utils';
import { formatDate } from '@shared/lib/date-format';
import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

interface DuplicateTransactionHintProps {
  accountId: number | null;
  date: Date | null;
  /** Unsigned native amount in the account currency's scale. */
  amount: number | null;
  isInflow: boolean;
  currencyCode: string;
  enabled: boolean;
}

/**
 * Non-blocking hint shown while entering a transaction that closely matches
 * one already in the account (e.g. a pending charge that later settled on
 * another date).
 */
export function DuplicateTransactionHint({
  accountId,
  date,
  amount,
  isInflow,
  currencyCode,
  enabled,
}: DuplicateTransactionHintProps) {
  const { t } = useLingui();
  const isoDate = date ? formatDate(date, 'yyyy-MM-dd') : null;
  const amountNative = amount ? (isInflow ? amount : -amount) : 0;
  const { data: matches = [] } = useSimilarTransactions(accountId, isoDate, amountNative, enabled);

  const entryKey = `${accountId}:${isoDate}:${amountNative}`;
  const [dismissedKey, setDismissedKey] = React.useState<string | null>(null);

  if (!enabled || matches.length === 0 || dismissedKey === entryKey) return null;

  return (
    <div
      role="status"
      className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 dark:border-amber-900 dark:bg-amber-950/30"
      data-testid="duplicate-transaction-hint"
    >
      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="font-medium text-amber-900 dark:text-amber-200">
          <Trans>Possible duplicate</Trans>
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full text-amber-700 transition hover:text-amber-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-amber-400 dark:hover:text-amber-100"
              aria-label={t`Why is this flagged?`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-xs">
            <p className="text-muted-foreground">
              <Trans>
                Banks often list a pending charge and the settled one on different dates. This flags
                transactions in the same account with a similar amount (within 1%) up to 7 days
                apart.
              </Trans>
            </p>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto h-7 gap-1 border-amber-300 bg-white/70 px-2 text-xs text-amber-900 hover:bg-amber-100 hover:text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/50 dark:hover:text-amber-100"
          onClick={() => setDismissedKey(entryKey)}
        >
          <X className="h-3.5 w-3.5" />
          <Trans>Not a duplicate</Trans>
        </Button>
      </div>
      <ul className="mt-1 space-y-0.5 pl-5.5 text-xs sm:text-sm">
        {matches.map((match) => (
          <li
            key={match.ID}
            className="flex items-baseline justify-between gap-2 text-amber-900 dark:text-amber-100"
          >
            <span className="min-w-0 truncate">
              {formatDate(parseISO(match.Date.slice(0, 10)), 'MMM d')} ·{' '}
              {match.Payee || match.Memo || '—'}
            </span>
            <span className="shrink-0 font-mono">
              {formatNativeAmount(Math.abs(match.AmountNative), currencyCode)} {currencyCode}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
