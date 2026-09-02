import { validateExchangeRateConversions } from '@entities/currency/lib/exchange-rate-format';

interface RateEditableTransaction {
  TransferID?: string | null;
  InflowConverted?: number | null;
  OutflowConverted?: number | null;
  InflowNative?: number | null;
  OutflowNative?: number | null;
}

export function validateTransactionExchangeRate(
  rate: number,
  transaction: RateEditableTransaction,
  accountCurrency: string,
  budgetCurrency: string
): string | null {
  if (transaction.TransferID) {
    return validateExchangeRateConversions(rate, [
      {
        amount: transaction.InflowConverted ?? 0,
        fromCurrency: budgetCurrency,
        toCurrency: accountCurrency,
        reciprocal: true,
      },
      {
        amount: transaction.OutflowConverted ?? 0,
        fromCurrency: budgetCurrency,
        toCurrency: accountCurrency,
        reciprocal: true,
      },
    ]);
  }

  return validateExchangeRateConversions(rate, [
    {
      amount: transaction.InflowNative ?? transaction.InflowConverted ?? 0,
      fromCurrency: accountCurrency,
      toCurrency: budgetCurrency,
    },
    {
      amount: transaction.OutflowNative ?? transaction.OutflowConverted ?? 0,
      fromCurrency: accountCurrency,
      toCurrency: budgetCurrency,
    },
  ]);
}
