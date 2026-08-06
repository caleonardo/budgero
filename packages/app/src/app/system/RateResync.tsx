import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRuntime } from '@shared/runtime/global';
import { useUiStore } from '@shared/store/useUiStore';

/**
 * Re-resolves offline/manual-rate conversions to official rates when the app
 * (re)gains connectivity. Runs once on mount and on every browser online
 * event; gated by the user_meta ResyncRatesOnReconnect opt-in (default on).
 * Rows the user pinned (ExchangeRateOverride) are never touched.
 */
export function RateResync() {
  const queryClient = useQueryClient();
  const selectedBudget = useUiStore((state) => state.selectedBudget);
  const budgetId = selectedBudget?.ID;
  const running = useRef(false);

  useEffect(() => {
    if (!budgetId) return undefined;

    const resync = async () => {
      if (running.current) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      const services = getRuntime()?.services();
      if (!services) return;
      running.current = true;
      try {
        if (!services.userMeta.getResyncRatesOnReconnect()) return;
        const updated = await services.currency.resyncPendingConversions(budgetId);
        if (updated > 0) {
          await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          await queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
          await queryClient.invalidateQueries({ queryKey: ['allTransactionsDetailed'] });
          await queryClient.invalidateQueries({ queryKey: ['accounts'] });
          await queryClient.invalidateQueries({ queryKey: ['monthlyBudget'] });
          await queryClient.invalidateQueries({ queryKey: ['readyToAssign'] });
        }
      } catch {
        // Best-effort: a failed resync retries on the next online event.
      } finally {
        running.current = false;
      }
    };

    void resync();
    window.addEventListener('online', resync);
    return () => window.removeEventListener('online', resync);
  }, [budgetId, queryClient]);

  return null;
}
