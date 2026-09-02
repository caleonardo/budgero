import { isSafeStorageAmount } from '@budgero/core/browser';

interface TransactionMoneyFields {
  InflowConverted?: number | null;
  OutflowConverted?: number | null;
  InflowNative?: number | null;
  OutflowNative?: number | null;
  RunningBalanceConverted?: number | null;
  RunningBalanceNative?: number | null;
}

export function hasUnsafeTransactionMoney(transaction: TransactionMoneyFields): boolean {
  return [
    transaction.InflowConverted,
    transaction.OutflowConverted,
    transaction.InflowNative,
    transaction.OutflowNative,
    transaction.RunningBalanceConverted,
    transaction.RunningBalanceNative,
  ].some((value) => value != null && !isSafeStorageAmount(value));
}
