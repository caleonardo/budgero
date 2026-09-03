import { useMemo } from 'react';
import { isValid, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import { extractDateKey, formatDateISO } from '@shared/lib/date-utils';

/**
 * Normalizes various date inputs to a Date object or null.
 */
export const normalizeToDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return isValid(fromNumber) ? fromNumber : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isoParsed = parseISO(trimmed);
    if (isValid(isoParsed)) return isoParsed;
    const fallback = new Date(trimmed);
    return isValid(fallback) ? fallback : null;
  }
  return null;
};

export interface AccountMetricsInput {
  selectedAccount: {
    BalanceNative?: number | null;
    BalanceConverted?: number | null;
    FutureImpactNative?: number | null;
    FutureImpactConverted?: number | null;
  } | null;
  allTransactionsData: GetTransactionsByAccountRow[];
  dateRange: DateRange | undefined;
  transactionCurrencyDisplay: 'budget' | 'account';
}

export interface AccountMetricsResult {
  /** Balance in account currency as of today (excluding future transactions) */
  balanceAccountToday: number;
  /** Balance in budget currency as of today (excluding future transactions) */
  balanceConvertedToday: number;
  /** Balance to display based on currency preference */
  displayBalanceToday: number;
  /** Transactions filtered by the date range */
  transactionsData: GetTransactionsByAccountRow[];
}

/**
 * Custom hook for computing account metrics including:
 * - Future transaction impact
 * - Today's balance (excluding future transactions)
 * - Normalized date range
 * - Filtered transactions by date range
 */
export function useAccountMetrics({
  selectedAccount,
  allTransactionsData,
  dateRange,
  transactionCurrencyDisplay,
}: AccountMetricsInput): AccountMetricsResult {
  // Account rows already carry these database aggregates. Reading them here
  // avoids reducing the complete register merely to derive today's balance.
  const futureTransactionImpact = useMemo(
    () => ({
      original: selectedAccount?.FutureImpactNative ?? 0,
      converted: selectedAccount?.FutureImpactConverted ?? 0,
    }),
    [selectedAccount?.FutureImpactNative, selectedAccount?.FutureImpactConverted]
  );

  const balanceAccountToday = useMemo(() => {
    if (!selectedAccount) {
      return 0;
    }
    const base = selectedAccount.BalanceNative ?? 0;
    return base - futureTransactionImpact.original;
  }, [selectedAccount, futureTransactionImpact.original]);

  const balanceConvertedToday = useMemo(() => {
    if (!selectedAccount) {
      return 0;
    }
    if (
      selectedAccount.BalanceConverted !== undefined &&
      selectedAccount.BalanceConverted !== null
    ) {
      const baseConverted = selectedAccount.BalanceConverted ?? 0;
      return baseConverted - futureTransactionImpact.converted;
    }
    return balanceAccountToday;
  }, [selectedAccount, balanceAccountToday, futureTransactionImpact.converted]);

  const displayBalanceToday =
    transactionCurrencyDisplay === 'budget' ? balanceConvertedToday : balanceAccountToday;

  const normalizedDateRange = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) {
      return undefined;
    }

    // YYYY-MM-DD keys; string comparison avoids UTC-anchored Date parsing,
    // which excludes range-edge days for users west of UTC.
    const from = dateRange?.from ? formatDateISO(dateRange.from) : undefined;
    const toSource = dateRange?.to ?? dateRange?.from ?? undefined;
    const to = toSource ? formatDateISO(toSource) : undefined;

    return from ? { from, to } : undefined;
  }, [dateRange]);

  // Filter transactions by date range (inclusive, handles single-day selections)
  const transactionsData = useMemo(() => {
    if (!normalizedDateRange?.from) return allTransactionsData;

    return allTransactionsData.filter((tx) => {
      const dayKey = extractDateKey(tx.Date);
      if (dayKey === 'unknown') {
        return false;
      }
      if (dayKey < normalizedDateRange.from) {
        return false;
      }
      if (normalizedDateRange.to && dayKey > normalizedDateRange.to) {
        return false;
      }
      return true;
    });
  }, [allTransactionsData, normalizedDateRange]);

  return {
    balanceAccountToday,
    balanceConvertedToday,
    displayBalanceToday,
    transactionsData,
  };
}
