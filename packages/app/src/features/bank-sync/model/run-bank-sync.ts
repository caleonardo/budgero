import { t } from '@lingui/core/macro';
import {
  bankOperationId,
  fromDecimalString,
  type BankLink,
  type ImportIdentity,
  type SimpleFINAccountSet,
} from '@budgero/core/browser';
import type { AppRuntime } from '@shared/runtime/app-runtime';
import { executeSpaceMutation } from '@shared/runtime/mutation-router';
import { getErrorMessage } from '@shared/lib/errors';
import { fetchTransactions } from '../lib/simplefin-client';

const DAY_MS = 24 * 60 * 60 * 1000;
const OVERLAP_DAYS = 7;

export const AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

export interface BankSyncResult {
  imported: number;
  reviews: number;
  errors: string[];
}

function localMidnight(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function syncStart(link: Pick<BankLink, 'ImportFrom' | 'LastSyncAt'>): Date {
  const from = localMidnight(link.ImportFrom);
  if (!link.LastSyncAt) return from;
  const overlap = new Date(new Date(link.LastSyncAt).getTime() - OVERLAP_DAYS * DAY_MS);
  return overlap > from ? overlap : from;
}

export function isSyncDue(lastSyncAt: string | null | undefined, now = Date.now()): boolean {
  return !lastSyncAt || now - new Date(lastSyncAt).getTime() >= AUTO_SYNC_INTERVAL_MS;
}

/** Stable across devices and retries, so the mutation log drops concurrent duplicates. */
export async function bankIdempotencyKey(operationId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(operationId));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return `bank_${hex.slice(0, 32)}`;
}

const inFlight = new Map<number, Promise<BankSyncResult>>();

export function runBankSync(
  runtime: AppRuntime,
  budgetId: number,
  prefetched?: SimpleFINAccountSet
): Promise<BankSyncResult> {
  const running = inFlight.get(budgetId);
  if (running) return running;
  const promise = syncBudget(runtime, budgetId, prefetched).finally(() =>
    inFlight.delete(budgetId)
  );
  inFlight.set(budgetId, promise);
  return promise;
}

async function syncBudget(
  runtime: AppRuntime,
  budgetId: number,
  prefetched?: SimpleFINAccountSet
): Promise<BankSyncResult> {
  const services = runtime.services();
  const connection = services.bankSync.getConnection(budgetId);
  const links = services.bankSync.listLinks(budgetId);
  const result: BankSyncResult = { imported: 0, reviews: 0, errors: [] };
  if (!connection || !links.length) return result;

  const record = (
    error: string | null,
    balances: { accountId: number; balance: number; balanceDate: string }[]
  ) =>
    executeSpaceMutation(runtime, {
      op: 'bankSync.recordSync',
      payload: {
        budgetId,
        input: { budgetId, at: new Date().toISOString(), error, links: balances },
      },
      meta: { label: 'bank-sync', skipUndo: true },
    });

  let set: SimpleFINAccountSet;
  try {
    const start = new Date(Math.min(...links.map((link) => syncStart(link).getTime())));
    set = prefetched ?? (await fetchTransactions(connection.AccessURL, start));
  } catch (error) {
    const message = getErrorMessage(error, t`Bank sync failed`);
    await record(message, []);
    throw error;
  }

  result.errors.push(...(set.errors ?? []));
  const accounts = new Map(services.accounts.listAccounts(budgetId).map((a) => [a.ID, a]));
  const balances: { accountId: number; balance: number; balanceDate: string }[] = [];

  for (const link of links) {
    const account = accounts.get(link.AccountID);
    const remote = set.accounts.find((candidate) => candidate.id === link.ExternalAccountID);
    if (!account) continue;
    if (!remote) {
      result.errors.push(t`${link.ExternalName} wasn't returned by SimpleFIN.`);
      continue;
    }
    try {
      const transactions = remote.transactions ?? [];
      const keys = new Map<string, string>();
      for (const transaction of transactions) {
        const operationId = bankOperationId(
          budgetId,
          account.ID,
          link.ExternalAccountID,
          transaction.id
        );
        keys.set(operationId, await bankIdempotencyKey(operationId));
      }
      const plan = services.bankSync.planImport({
        budgetId,
        accountId: account.ID,
        currency: account.Currency,
        link,
        transactions,
        wasImported: (row: ImportIdentity) =>
          runtime.isMutationApplied(keys.get(row.operationId) ?? ''),
      });
      for (const { identity, transactionId } of plan.rekeys) {
        await executeSpaceMutation(runtime, {
          op: 'importHistory.match',
          payload: { budgetId, accountId: account.ID, transactionId, identity },
          idempotencyKey: keys.get(identity.operationId),
          meta: { label: 'bank-sync', skipUndo: true },
        });
      }
      for (const identity of plan.imports) {
        await executeSpaceMutation(runtime, {
          op: 'transactions.import',
          payload: {
            inflow: identity.inflow,
            outflow: identity.outflow,
            accountId: account.ID,
            categoryId: 0,
            budgetId,
            date: identity.date,
            memo: identity.memo.substring(0, 255),
            payee: identity.payee,
            transferId: '',
            importIdentities: [identity],
          },
          idempotencyKey: keys.get(identity.operationId),
          meta: { label: 'bank-sync', skipUndo: true, skipInvalidate: true },
        });
        result.imported++;
      }
      if (plan.reviews.length) {
        await executeSpaceMutation(runtime, {
          op: 'bankSync.addReviews',
          payload: { budgetId, reviews: plan.reviews },
          meta: { label: 'bank-sync', skipUndo: true },
        });
        result.reviews += plan.reviews.length;
      }
      balances.push({
        accountId: account.ID,
        balance: fromDecimalString(remote.balance.replace(/^\+/, '')),
        balanceDate: new Date(remote['balance-date'] * 1000).toISOString(),
      });
    } catch (error) {
      result.errors.push(`${link.ExternalName}: ${getErrorMessage(error, t`Sync failed`)}`);
    }
  }

  await record(result.errors.length ? result.errors.join('\n') : null, balances);
  try {
    await runtime.save();
  } catch (error) {
    console.warn('[BankSync] Failed to push synced changes', error);
  }
  return result;
}
