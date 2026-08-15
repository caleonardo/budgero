import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import type {
  RecurringTransactionEditorProps,
  RecurringTransactionEditorSubmit,
} from '@features/recurring/ui/RecurringTransactionEditor';
import { useCreateRecurringTransaction } from '@entities/recurring/api/useRecurringTransactions';
import { getTodayISO } from '@shared/lib/date-utils';
import { asMilli } from '@shared/lib/currency/milli';
import { getErrorMessage } from '@shared/lib/errors';

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
  const { t } = useLingui();

  const createRecurring = useCreateRecurringTransaction();
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] =
    useState<RecurringTransactionEditorProps['initialValues']>();

  const openFromTransaction = (transaction: GetTransactionsByAccountRow) => {
    const direction = transaction.OutflowConverted > 0 ? 'outflow' : 'inflow';
    const rawAmount =
      direction === 'outflow' ? transaction.OutflowConverted : transaction.InflowConverted;
    const startDate = transaction.Date || getTodayISO();

    setInitialValues({
      name: transaction.Memo || t`Recurring transaction`,
      memo: transaction.Memo || '',
      // OutflowConverted/InflowConverted are stored milliunits; Math.abs drops the brand only.
      amount: asMilli(Math.abs(rawAmount)),
      direction,
      accountId: accountId ?? transaction.AccountID ?? null,
      categoryId: transaction.CategoryID ?? null,
      schedule: {
        startDate,
        intervalUnit: 'month',
        intervalCount: 1,
      },
      notifyDaysBefore: 0,
      active: true,
    });
    setOpen(true);
  };

  const handleSubmit = async (values: RecurringTransactionEditorSubmit) => {
    if (!budgetId) return;
    if (!values.accountId) {
      toast.error(t`Select an account`);
      return;
    }
    if (values.toAccountId != null) {
      if (values.toAccountId === values.accountId) {
        toast.error(t`Pick two different accounts for a transfer`);
        return;
      }
    } else if (!values.categoryId) {
      toast.error(t`Select a category`);
      return;
    }
    if (!values.amount || Number.isNaN(values.amount)) {
      toast.error(t`Enter a valid amount`);
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
      toast.success(t`Recurring transaction created`, {
        description: t`We will remind you when it is almost due.`,
      });
      setOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, 'Something went wrong.');
      toast.error(t`Unable to save recurring transaction`, {
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
