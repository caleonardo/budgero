import { useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { asMilli } from '@budgero/core/browser';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { useUiStore } from '@shared/store/useUiStore';
import { getRuntime } from '@shared/runtime/global';
import { getTodayISO } from '@shared/lib/date-utils';
import { getErrorMessage } from '@shared/lib/errors';
import { applyOpInvalidations } from '@shared/lib/query-utils';
import { useAccounts } from '@entities/account/api/useAccounts';
import { useCategories } from '@entities/category/api/useCategories';
import {
  buildFakeTransactions,
  MAX_FAKE_TRANSACTIONS,
} from '@features/account-management/lib/dev-seed-transactions';

/**
 * Dev-only QA helper. Creates a configurable volume of fake transactions in
 * one local batch, then uploads a single out-of-band snapshot. The call site
 * is gated by `import.meta.env.DEV`, so production builds remove this module.
 */
export function DevSeedTransactionsButton() {
  const selectedBudget = useUiStore((state) => state.selectedBudget);
  const queryClient = useQueryClient();
  const budgetId = selectedBudget?.ID ?? 0;
  const { data: accounts = [] } = useAccounts(budgetId);
  const { data: categories = [] } = useCategories(budgetId);
  const [count, setCount] = useState(500);
  const [progress, setProgress] = useState<number | null>(null);

  const running = progress !== null;

  const refreshTransactionQueries = () => applyOpInvalidations(queryClient, 'transactions.add');

  const handleSeed = async () => {
    const runtime = getRuntime();
    const budgetCurrency = selectedBudget?.DisplayCurrency;
    if (!runtime || !budgetId || !budgetCurrency) {
      toast.error('No budget selected');
      return;
    }

    const requestedCount = Math.trunc(count);
    if (requestedCount < 1 || requestedCount > MAX_FAKE_TRANSACTIONS) {
      toast.error(`Enter a transaction count from 1 to ${MAX_FAKE_TRANSACTIONS.toLocaleString()}`);
      return;
    }

    const activeAccounts = accounts.filter((account) => !account.Archived);
    if (activeAccounts.length === 0) {
      toast.error('No active accounts available');
      return;
    }
    if (categories.length === 0) {
      toast.error('No categories available');
      return;
    }

    const transactions = buildFakeTransactions({
      count: requestedCount,
      accounts: activeAccounts,
      categories,
    });
    const services = runtime.services();
    let created = 0;
    setProgress(0);

    try {
      // Resolve each currency once and pin that rate across the generated
      // history. This keeps large multi-currency batches from doing a rate
      // lookup for every individual transaction.
      const rateByCurrency = new Map<string, number | null>();
      for (const account of activeAccounts) {
        if (account.Currency === budgetCurrency || rateByCurrency.has(account.Currency)) continue;
        const rate = await services.currency.resolveRate(
          account.Currency,
          budgetCurrency,
          getTodayISO(),
          budgetId
        );
        rateByCurrency.set(account.Currency, rate ?? 1);
      }

      for (const transaction of transactions) {
        const account = activeAccounts.find((candidate) => candidate.ID === transaction.accountId);
        const exchangeRateOverride = account
          ? (rateByCurrency.get(account.Currency) ?? null)
          : null;
        await services.transactions.addTransaction(
          asMilli(transaction.inflow),
          asMilli(transaction.outflow),
          transaction.accountId,
          transaction.categoryId,
          budgetId,
          transaction.date,
          transaction.memo,
          '',
          transaction.payee,
          null,
          exchangeRateOverride
        );
        created += 1;
        if (created % 25 === 0 || created === requestedCount) setProgress(created);
      }

      await runtime.finalizeOutOfBandMutation({ uploadSnapshot: true });
      refreshTransactionQueries();
      toast.success(`Seeded ${created.toLocaleString()} transactions`, {
        description: `Distributed across ${activeAccounts.length} active account${activeAccounts.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      if (created > 0) {
        await runtime.finalizeOutOfBandMutation({ uploadSnapshot: true }).catch(() => undefined);
        refreshTransactionQueries();
      }
      toast.error(`Stopped after ${created.toLocaleString()}`, {
        description: getErrorMessage(error, 'Unknown error'),
      });
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-dashed border-amber-600/50 bg-amber-50/30 px-1.5 py-1 dark:bg-amber-950/10">
      <Input
        type="number"
        min={1}
        max={MAX_FAKE_TRANSACTIONS}
        value={count}
        onChange={(event) => setCount(Number(event.target.value))}
        disabled={running}
        className="h-8 w-20"
        aria-label="Number of transactions to seed"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={handleSeed}
        disabled={running}
        className="gap-1.5"
      >
        <ReceiptText className="h-4 w-4" />
        {running
          ? `Seeding ${progress?.toLocaleString()}/${count.toLocaleString()}…`
          : 'Seed transactions'}
      </Button>
    </div>
  );
}
