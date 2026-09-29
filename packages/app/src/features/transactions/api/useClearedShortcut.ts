import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import { useSetTransactionsCleared } from '@entities/transaction/api/useTransactions';

/** Key that toggles cleared status on the selected register rows. */
export const CLEARED_SHORTCUT_KEY = 'C';

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return false;
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT' ||
    element.isContentEditable ||
    Boolean(element.closest('.cm-editor, [role="dialog"], [role="menu"], [role="listbox"]'))
  );
}

/**
 * Press C with rows selected: marks them cleared, or uncleared when every
 * selected (non-reconciled) row is already cleared. Reconciled rows are skipped.
 */
export function useClearedShortcut(selectedRowIds: number[], rows: GetTransactionsByAccountRow[]) {
  const { t } = useLingui();
  const setCleared = useSetTransactionsCleared();
  const errorMessage = t`Could not update cleared status`;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'c') return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      if (isTypingTarget(event.target)) return;

      const selected = new Set(selectedRowIds);
      const editable = rows.filter(
        (row) => selected.has(row.ID) && !row.IsProjected && !row.Reconciled
      );
      if (!editable.length || setCleared.isPending) return;

      event.preventDefault();
      const cleared = !editable.every((row) => Boolean(row.Cleared));
      setCleared.mutate(
        { ids: editable.map((row) => row.ID), cleared },
        {
          onSuccess: ({ changed }) => {
            const count = changed.length;
            toast.success(
              cleared
                ? plural(count, {
                    one: '# transaction marked cleared',
                    other: '# transactions marked cleared',
                  })
                : plural(count, {
                    one: '# transaction marked uncleared',
                    other: '# transactions marked uncleared',
                  })
            );
          },
          onError: () => toast.error(errorMessage),
        }
      );
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedRowIds, rows, setCleared, errorMessage]);
}
