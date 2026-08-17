import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dices, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/ui/button';
import { useUiStore } from '@shared/store/useUiStore';
import { getRuntime } from '@shared/runtime/global';
import { getTodayISO } from '@shared/lib/date-utils';
import { getErrorMessage } from '@shared/lib/errors';

/**
 * Dev-only QA helper. Simulates a market move: bumps today's cached official
 * rate for every foreign-currency pair in the budget by a random ±5–25%,
 * then runs the revaluation pass — so converted balances, the account page's
 * "Rate impact (30d)" stat, and Ready to Assign (for on-budget accounts) all
 * shift immediately instead of waiting for tomorrow's real dataset.
 *
 * Gated by `import.meta.env.DEV` at the call site; dead-code-eliminated in
 * production builds. Writes only to the local rate cache — the next real
 * daily fetch overwrites the fake rate.
 */
const INVALIDATED_KEYS = [
  ['transactions'],
  ['allTransactions'],
  ['allTransactionsDetailed'],
  ['allTransactionsAnalytics'],
  ['accounts'],
  ['monthlyBudget'],
  ['readyToAssign'],
  ['revaluationSummary'],
  ['balanceByDates'],
  ['onBudgetBalance'],
  ['onBudgetBalanceByDates'],
];

export function DevSimulateRateMoveButton() {
  const { t } = useLingui();

  const selectedBudget = useUiStore((s) => s.selectedBudget);
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const invalidateAll = () =>
    Promise.all(INVALIDATED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

  const handleRestore = async () => {
    const services = getRuntime()?.services();
    const budgetId = selectedBudget?.ID;
    if (!services || !budgetId) {
      toast.error(t`No budget selected`);
      return;
    }
    setRestoring(true);
    try {
      const revalued = await services.currency.restoreOfficialRates(budgetId);
      await invalidateAll();
      toast.success(t`Official rates restored`, {
        description: plural(revalued, {
          one: `Today's cache refetched; # account revalued.`,
          other: `Today's cache refetched; # accounts revalued.`,
        }),
      });
    } catch (err) {
      toast.error(t`Restore failed: ${getErrorMessage(err, 'unknown error')}`);
    } finally {
      setRestoring(false);
    }
  };

  const handleSimulate = async () => {
    const services = getRuntime()?.services();
    const budgetId = selectedBudget?.ID;
    const displayCurrency = selectedBudget?.DisplayCurrency;
    if (!services || !budgetId || !displayCurrency) {
      toast.error(t`No budget selected`);
      return;
    }

    setRunning(true);
    try {
      const today = getTodayISO();
      const foreignCurrencies = new Set(
        services.accounts
          .listAccounts(budgetId)
          .map((account) => account.Currency)
          .filter((currency) => currency && currency !== displayCurrency)
      );
      if (foreignCurrencies.size === 0) {
        toast.info(t`No foreign-currency accounts`, {
          description: t`Add an account in another currency (or crypto) first.`,
        });
        return;
      }

      let moved = 0;
      for (const currency of foreignCurrencies) {
        const current = await services.currency.getOrFetchRate(
          currency,
          displayCurrency,
          today,
          budgetId
        );
        if (!current) continue;
        const drift = (0.05 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1);
        const next = current * (1 + drift);
        services.currency.saveRate(currency, displayCurrency, next, today, budgetId);
        services.currency.saveRate(displayCurrency, currency, 1 / next, today, budgetId);
        moved += 1;
      }

      const revalued = await services.currency.revalueAccounts(budgetId);
      await invalidateAll();

      toast.success(t`Simulated a market move`, {
        description: plural(moved, {
          one: plural(revalued, {
            one: `# rate shifted, # account revalued.`,
            other: `# rate shifted, # accounts revalued.`
          }),
          other: plural(revalued, {
            one: `# rates shifted, # account revalued.`,
            other: `# rates shifted, # accounts revalued.`
          }),
        }),
      });
    } catch (err) {
      toast.error(t`Rate simulation failed: ${getErrorMessage(err, 'unknown error')}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-dashed border-amber-600/50 bg-amber-50/30 px-1.5 py-1 dark:bg-amber-950/10">
      <Button
        size="sm"
        variant="outline"
        onClick={handleSimulate}
        disabled={running || restoring}
        className="gap-1.5"
      >
        <Dices className="h-4 w-4" />
        {running ? t`Moving rates…` : t`Simulate rate move`}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRestore}
        disabled={running || restoring}
        className="gap-1.5"
      >
        <Undo2 className="h-4 w-4" />
        {restoring ? t`Restoring…` : t`Restore real rates`}
      </Button>
    </div>
  );
}
