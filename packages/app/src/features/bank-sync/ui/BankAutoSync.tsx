import { plural } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRuntime } from '@shared/runtime/runtime-provider';
import { useUiStore } from '@shared/store/useUiStore';
import { invalidateAfterBankSync, useBankConnection, useBankLinks } from '../api/useBankSync';
import { isSyncDue, runBankSync } from '../model/run-bank-sync';

/** Pulls linked bank feeds on app open and on refocus, at most every few hours across devices. */
export function BankAutoSync() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  const budgetId = useUiStore((state) => state.selectedBudget?.ID);
  const { data: connection } = useBankConnection(budgetId);
  const { data: links } = useBankLinks(budgetId);
  const enabled = Boolean(budgetId && connection && links?.length);

  useEffect(() => {
    if (!enabled || !budgetId) return undefined;
    let cancelled = false;
    const due = () => isSyncDue(runtime.services().bankSync.getConnection(budgetId)?.LastSyncAt);
    const maybeSync = async () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine || !due()) return;
      const initial = await runtime.waitForInitialSync({ timeoutMs: 20_000 });
      if (cancelled || (initial.connected && !initial.synced) || !due()) return;
      try {
        const result = await runBankSync(runtime, budgetId);
        if (result.imported) {
          toast.success(
            plural(result.imported, {
              one: 'Imported # bank transaction',
              other: 'Imported # bank transactions',
            })
          );
        }
        if (result.reviews) {
          toast.info(
            plural(result.reviews, {
              one: '# bank transaction needs review',
              other: '# bank transactions need review',
            })
          );
        }
      } catch (error) {
        console.warn('[BankSync] Automatic sync failed', error);
      } finally {
        invalidateAfterBankSync(queryClient);
      }
    };
    const onVisible = () => void maybeSync();
    void maybeSync();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, budgetId, runtime, queryClient]);

  return null;
}
