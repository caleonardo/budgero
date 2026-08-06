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
        let changed = 0;
        if (services.userMeta.getResyncRatesOnReconnect()) {
          changed += await services.currency.resyncPendingConversions(budgetId);
        }
        // Daily true-up: converted balances follow native × latest rate,
        // journaled per account in account_revaluations.
        changed += await services.currency.revalueAccounts(budgetId);
        if (changed > 0) {
          await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          await queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
          await queryClient.invalidateQueries({ queryKey: ['allTransactionsDetailed'] });
          await queryClient.invalidateQueries({ queryKey: ['accounts'] });
          await queryClient.invalidateQueries({ queryKey: ['monthlyBudget'] });
          await queryClient.invalidateQueries({ queryKey: ['readyToAssign'] });
          await queryClient.invalidateQueries({ queryKey: ['revaluationSummary'] });
          await queryClient.invalidateQueries({ queryKey: ['balanceByDates'] });
          await queryClient.invalidateQueries({ queryKey: ['onBudgetBalance'] });
          await queryClient.invalidateQueries({ queryKey: ['onBudgetBalanceByDates'] });
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
