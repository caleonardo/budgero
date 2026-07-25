import { useQuery } from '@tanstack/react-query';
import { useRuntime, useActiveSpaceId } from '@shared/runtime/runtime-provider';
import { resolveSpaceKey } from '@shared/lib/query-utils';
import type { PayeeCategoryMemory } from '@budgero/core/browser';

/**
 * The category the given payee was last filed under, or null when the payee is
 * new or has no usable history (see `PayeeService.getLastCategoryForPayee`).
 *
 * Backs the add-transaction form's category memory. Pass `enabled: false` to
 * skip the lookup entirely — the setting being off, a transfer, a split.
 */
export function usePayeeCategoryMemory(
  budgetId: number | null | undefined,
  payee: string,
  options: { enabled?: boolean } = {}
) {
  const runtime = useRuntime();
  const spaceId = useActiveSpaceId();
  const spaceKey = resolveSpaceKey(spaceId);
  const trimmedPayee = payee.trim();
  const normalizedBudgetId = typeof budgetId === 'number' && budgetId > 0 ? budgetId : null;

  return useQuery<PayeeCategoryMemory | null>({
    // Key on the lowercased payee: the lookup is case-insensitive, so
    // "Corner Cafe" and "corner cafe" must not each pay for their own fetch.
    queryKey: ['payeeCategoryMemory', spaceKey, normalizedBudgetId, trimmedPayee.toLowerCase()],
    enabled:
      (options.enabled ?? true) &&
      Boolean(spaceId) &&
      normalizedBudgetId !== null &&
      trimmedPayee.length > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!normalizedBudgetId || !trimmedPayee) return null;
      return runtime.services().payees.getLastCategoryForPayee(normalizedBudgetId, trimmedPayee);
    },
  });
}
