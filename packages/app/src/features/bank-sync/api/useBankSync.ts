import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { BankConnection, BankLink, BankReview } from '@budgero/core/browser';
import { useSpaceQuery } from '@shared/api/useSpaceQuery';
import { invalidateRoots } from '@shared/lib/query-utils';
import { getInvalidatesForOp } from '@shared/mutations/op-code-registry';
import { useRuntime } from '@shared/runtime/runtime-provider';
import { executeSpaceMutation } from '@shared/runtime/mutation-router';
import { claimSetupToken, fetchBalances } from '../lib/simplefin-client';
import { linkAccounts, type LinkRequest } from '../model/link-accounts';
import { bankIdempotencyKey, runBankSync } from '../model/run-bank-sync';

export function invalidateAfterBankSync(queryClient: QueryClient) {
  const roots = new Set(['bankSync', 'accounts', 'budgets', 'categories']);
  for (const key of getInvalidatesForOp('transactions.import') ?? []) roots.add(key[0]);
  invalidateRoots(queryClient, ...roots);
}

export function useBankConnection(budgetId: number | undefined) {
  return useSpaceQuery<BankConnection | null>({
    key: ['bankSync', 'connection', budgetId ?? 0],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.bankSync.getConnection(budgetId!),
  });
}

export function useBankLinks(budgetId: number | undefined) {
  return useSpaceQuery<BankLink[]>({
    key: ['bankSync', 'links', budgetId ?? 0],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.bankSync.listLinks(budgetId!),
  });
}

export function useBankReviews(budgetId: number | undefined, accountId?: number) {
  return useSpaceQuery<BankReview[]>({
    key: ['bankSync', 'reviews', budgetId ?? 0, accountId ?? 'all'],
    enabled: Boolean(budgetId),
    queryFn: (services) => services.bankSync.listPendingReviews(budgetId!, accountId),
  });
}

/** Every call spends SimpleFIN Bridge quota, so this is cached for the session. */
export function useRemoteBankAccounts(accessUrl: string | undefined) {
  return useQuery({
    queryKey: ['simplefinBalances', accessUrl],
    enabled: Boolean(accessUrl),
    staleTime: 30 * 60 * 1000,
    retry: false,
    queryFn: () => fetchBalances(accessUrl!),
  });
}

export function useConnectBank() {
  const runtime = useRuntime();
  return useMutation({
    mutationFn: async ({ budgetId, setupToken }: { budgetId: number; setupToken: string }) => {
      const accessUrl = await claimSetupToken(setupToken);
      return executeSpaceMutation<BankConnection>(runtime, {
        op: 'bankSync.saveConnection',
        payload: { budgetId, accessUrl },
        meta: { label: 'bank-sync', skipUndo: true },
      });
    },
  });
}

export function useDisconnectBank() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: number) =>
      executeSpaceMutation(runtime, {
        op: 'bankSync.deleteConnection',
        payload: { budgetId },
        meta: { label: 'bank-sync', skipUndo: true },
      }),
    onSuccess: () => queryClient.removeQueries({ queryKey: ['simplefinBalances'] }),
  });
}

export function useRunBankSync() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: number) => runBankSync(runtime, budgetId),
    onSettled: () => invalidateAfterBankSync(queryClient),
  });
}

export function useLinkBankAccounts() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { budgetId: number; accessUrl: string; requests: LinkRequest[] }) =>
      linkAccounts(runtime, input.accessUrl, input.budgetId, input.requests),
    onSettled: () => invalidateAfterBankSync(queryClient),
  });
}

export function useUnlinkBankAccount() {
  const runtime = useRuntime();
  return useMutation({
    mutationFn: ({ budgetId, accountId }: { budgetId: number; accountId: number }) =>
      executeSpaceMutation(runtime, {
        op: 'bankSync.deleteLink',
        payload: { budgetId, accountId },
        meta: { label: 'bank-sync', skipUndo: true },
      }),
  });
}

export type ReviewAction = 'match' | 'import' | 'dismiss';

export function useResolveBankReview() {
  const runtime = useRuntime();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ review, action }: { review: BankReview; action: ReviewAction }) => {
      const { BudgetID: budgetId, AccountID: accountId, identity } = review;
      if (action === 'match' && review.candidate) {
        await executeSpaceMutation(runtime, {
          op: 'importHistory.match',
          payload: { budgetId, accountId, transactionId: review.candidate.id, identity },
          meta: { label: 'bank-sync', skipUndo: true },
        });
        await executeSpaceMutation(runtime, {
          op: 'transactions.setCleared',
          payload: { budgetId, ids: [review.candidate.id], cleared: true },
          meta: { label: 'bank-sync' },
        });
      } else if (action !== 'dismiss') {
        await executeSpaceMutation(runtime, {
          op: 'transactions.import',
          payload: {
            inflow: identity.inflow,
            outflow: identity.outflow,
            accountId,
            categoryId: 0,
            budgetId,
            date: identity.date,
            memo: identity.memo.substring(0, 255),
            payee: identity.payee,
            transferId: '',
            importIdentities: [identity],
          },
          idempotencyKey: await bankIdempotencyKey(identity.operationId),
          meta: { label: 'bank-sync' },
        });
      }
      await executeSpaceMutation(runtime, {
        op: 'bankSync.setReviewStatus',
        payload: {
          budgetId,
          id: review.ID,
          status: action === 'dismiss' ? 'dismissed' : 'resolved',
        },
        meta: { label: 'bank-sync', skipUndo: true },
      });
    },
    onSettled: () => invalidateAfterBankSync(queryClient),
  });
}
