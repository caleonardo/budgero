import { useState } from 'react';
import { toast } from 'sonner';
import type { GetTransactionsByAccountRow, Transaction } from '@budgero/core/browser';
import type {
  RecurringTransactionEditorProps,
  RecurringTransactionEditorSubmit,
} from '@features/recurring/ui/RecurringTransactionEditor';
import { useCreateRecurringTransaction } from '@entities/recurring/api/useRecurringTransactions';
import { useRuntime } from '@shared/runtime/runtime-provider';
import { getTodayISO } from '@shared/lib/date-utils';
import { asMilli } from '@shared/lib/currency/milli';
import { getErrorMessage } from '@shared/lib/errors';

type RecurringEditorInitialValues = RecurringTransactionEditorProps['initialValues'];

function nativeOutflow(transaction: GetTransactionsByAccountRow | Transaction): number {
  return transaction.OutflowNative ?? transaction.OutflowConverted;
}

function nativeInflow(transaction: GetTransactionsByAccountRow | Transaction): number {
  return transaction.InflowNative ?? transaction.InflowConverted;
}

function scheduleFrom(date: string) {
  return {
    startDate: date || getTodayISO(),
    intervalUnit: 'month' as const,
    intervalCount: 1,
  };
}

export function recurringInitialValuesFromTransaction(
  transaction: GetTransactionsByAccountRow,
  fallbackAccountId?: number,
  transferLegs?: Transaction[]
): RecurringEditorInitialValues | null {
  if (transaction.TransferID) {
    // A standard transfer must have exactly one source and one destination.
    // Split-transfer groups can contain more legs and recurring splits are not
    // represented by the current template model, so do not flatten them.
    if (transferLegs?.length !== 2) return null;

    const source = transferLegs.find((leg) => nativeOutflow(leg) > 0);
    const destination = transferLegs.find((leg) => leg.ID !== source?.ID && nativeInflow(leg) > 0);
    if (!source || !destination || source.AccountID === destination.AccountID) return null;

    return {
      name: source.Payee || source.Memo || 'Recurring transfer',
      memo: source.Memo || '',
      amount: asMilli(Math.abs(nativeOutflow(source))),
      direction: 'outflow',
      accountId: source.AccountID,
      toAccountId: destination.AccountID,
      categoryId: source.CategoryID ?? null,
      schedule: scheduleFrom(source.Date),
      notifyDaysBefore: 0,
      active: true,
    };
  }

  const outflow = nativeOutflow(transaction);
  const inflow = nativeInflow(transaction);
  const direction = outflow > 0 ? 'outflow' : 'inflow';

  return {
    name: transaction.Payee || transaction.Memo || 'Recurring transaction',
    memo: transaction.Memo || '',
    amount: asMilli(Math.abs(direction === 'outflow' ? outflow : inflow)),
    direction,
    accountId: fallbackAccountId ?? transaction.AccountID ?? null,
    categoryId: transaction.CategoryID ?? null,
    schedule: scheduleFrom(transaction.Date),
    notifyDaysBefore: 0,
    active: true,
  };
}

/**
 * Shared "create recurring transaction from an existing transaction" editor
 * state for AccountPage and AllTransactionsPage: prefills the editor from a
 * selected register row and persists the template on submit.
 *
 * `accountId` pins the prefilled account (AccountPage); when omitted the
 * row's own AccountID is used (AllTransactionsPage).
 */
export function useRecurringEditorFromTransaction({
  budgetId,
  accountId,
}: {
  budgetId: number;
  accountId?: number;
}) {
  const runtime = useRuntime();
  const createRecurring = useCreateRecurringTransaction();
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] =
    useState<RecurringTransactionEditorProps['initialValues']>();

  const openFromTransaction = async (transaction: GetTransactionsByAccountRow) => {
    try {
      const transferLegs = transaction.TransferID
        ? await runtime.services().transactions.getTransactionsByTransferID(transaction.TransferID)
        : undefined;
      const values = recurringInitialValuesFromTransaction(transaction, accountId, transferLegs);

      if (!values) {
        toast.error('Unable to create recurring transfer', {
          description:
            'The selected transfer does not have one source and one destination. Recurring split transfers are not supported yet.',
        });
        return;
      }

      setInitialValues(values);
      setOpen(true);
    } catch (error) {
      toast.error('Unable to load transfer', {
        description: getErrorMessage(error, 'The paired transfer transaction could not be loaded.'),
      });
    }
  };

  const handleSubmit = async (values: RecurringTransactionEditorSubmit) => {
    if (!budgetId) return;
    if (!values.accountId) {
      toast.error('Select an account');
      return;
    }
    if (values.toAccountId != null) {
      if (values.toAccountId === values.accountId) {
        toast.error('Pick two different accounts for a transfer');
        return;
      }
    } else if (!values.categoryId) {
      toast.error('Select a category');
      return;
    }
    if (!values.amount || Number.isNaN(values.amount)) {
      toast.error('Enter a valid amount');
      return;
    }

    try {
      await createRecurring.mutateAsync({
        budgetId,
        accountId: values.accountId,
        toAccountId: values.toAccountId,
        categoryId: values.categoryId,
        name: values.name,
        memo: values.memo,
        amount: values.amount,
        direction: values.direction,
        schedule: values.schedule,
        notifyDaysBefore: values.notifyDaysBefore,
        active: values.active,
      });
      toast.success('Recurring transaction created', {
        description: 'We will remind you when it is almost due.',
      });
      setOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, 'Something went wrong.');
      toast.error('Unable to save recurring transaction', {
        description: message,
      });
    }
  };

  return {
    open,
    setOpen,
    initialValues,
    openFromTransaction,
    handleSubmit,
    isSubmitting: createRecurring.isPending,
  };
}
