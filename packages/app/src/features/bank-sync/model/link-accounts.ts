import {
  AccountTypeEnum,
  fromDecimalString,
  isCryptoCurrency,
  isPostedSimpleFINTransaction,
  simpleFINDate,
  type Account,
  type SimpleFINAccount,
} from '@budgero/core/browser';
import { getAccountTypeDefinition } from '@entities/account/model/accountTypes';
import { formatDateISO } from '@shared/lib/date-utils';
import type { AppRuntime } from '@shared/runtime/app-runtime';
import { executeSpaceMutation } from '@shared/runtime/mutation-router';
import { fetchTransactions } from '../lib/simplefin-client';
import { runBankSync, syncStart, type BankSyncResult } from './run-bank-sync';

export const DEFAULT_HISTORY_DAYS = 30;

export type LinkTarget =
  { kind: 'existing'; accountId: number } | { kind: 'new'; name: string; type: AccountTypeEnum };

export interface LinkRequest {
  remote: SimpleFINAccount;
  target: LinkTarget;
  importFrom: string;
}

export function isSupportedBankCurrency(code: string): boolean {
  return /^[A-Z]{3}$/.test(code) && !isCryptoCurrency(code);
}

export function guessAccountType(remote: SimpleFINAccount): AccountTypeEnum {
  const name = `${remote.name} ${remote.org.name ?? ''}`.toLowerCase();
  if (/mortgage/.test(name)) return AccountTypeEnum.MORTGAGE;
  if (/loan|auto|student/.test(name)) return AccountTypeEnum.LOAN;
  if (/credit|card|visa|mastercard|amex|discover/.test(name)) return AccountTypeEnum.CREDIT;
  if (/401k|ira|roth|retire/.test(name)) return AccountTypeEnum.RETIREMENT;
  if (/invest|brokerage|stock/.test(name)) return AccountTypeEnum.INVESTMENT;
  if (/saving/.test(name)) return AccountTypeEnum.SAVINGS;
  if (remote.balance.trim().startsWith('-')) return AccountTypeEnum.CREDIT;
  return AccountTypeEnum.CHECKING;
}

export function daysAgo(days: number, now = new Date()): string {
  return formatDateISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days));
}

/** Start right after the newest entry so history typed in by hand isn't imported twice. */
export function defaultImportFrom(latestTransactionDate: string | null | undefined): string {
  const fallback = daysAgo(DEFAULT_HISTORY_DAYS);
  if (!latestTransactionDate) return fallback;
  const [y, m, d] = latestTransactionDate.slice(0, 10).split('-').map(Number);
  const next = formatDateISO(new Date(y, m - 1, d + 1));
  return next > daysAgo(0) ? daysAgo(0) : next;
}

/** Balance on the eve of `importFrom`, so the imported history lands on today's bank balance. */
export function openingBalance(remote: SimpleFINAccount, importFrom: string): number {
  const imported = (remote.transactions ?? [])
    .filter(
      (tx) =>
        isPostedSimpleFINTransaction(tx) &&
        simpleFINDate(tx) >= importFrom &&
        tx.posted <= remote['balance-date']
    )
    .reduce((sum, tx) => sum + fromDecimalString(tx.amount.replace(/^\+/, '')), 0);
  return fromDecimalString(remote.balance.replace(/^\+/, '')) - imported;
}

function dayBefore(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return formatDateISO(new Date(y, m - 1, d - 1));
}

export async function linkAccounts(
  runtime: AppRuntime,
  accessUrl: string,
  budgetId: number,
  requests: LinkRequest[]
): Promise<BankSyncResult> {
  const starts = [
    ...requests.map((r) => syncStart({ ImportFrom: r.importFrom, LastSyncAt: null })),
    ...runtime.services().bankSync.listLinks(budgetId).map(syncStart),
  ];
  const set = await fetchTransactions(
    accessUrl,
    new Date(Math.min(...starts.map((start) => start.getTime())))
  );
  const fetched = new Map(set.accounts.map((account) => [account.id, account]));

  for (const request of requests) {
    const remote = fetched.get(request.remote.id) ?? request.remote;
    let accountId: number;
    if (request.target.kind === 'existing') {
      accountId = request.target.accountId;
    } else {
      const definition = getAccountTypeDefinition(request.target.type);
      const account = await executeSpaceMutation<Account>(runtime, {
        op: 'accounts.create',
        payload: {
          name: request.target.name,
          budgetId,
          type: request.target.type,
          currency: remote.currency,
          balance: openingBalance(remote, request.importFrom),
          metadata: {},
          onBudget: definition?.budgetType !== 'always-off',
          initialBalanceDate: dayBefore(request.importFrom),
        },
        meta: { label: 'bank-sync' },
      });
      accountId = account.ID;
    }
    await executeSpaceMutation(runtime, {
      op: 'bankSync.saveLink',
      payload: {
        budgetId,
        input: {
          budgetId,
          accountId,
          externalAccountId: remote.id,
          externalName: remote.name,
          orgName: remote.org.name ?? remote.org.domain ?? '',
          importFrom: request.importFrom,
        },
      },
      meta: { label: 'bank-sync', skipUndo: true },
    });
  }

  return runBankSync(runtime, budgetId, set);
}
