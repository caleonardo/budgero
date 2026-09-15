import { Trans, useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import {
  useAddPayee,
  useDeletePayee,
  useDeletePayees,
  usePayeeDirectory,
  useRenamePayee,
} from '@entities/payee/api/payee-directory';
import { useUiStore } from '@shared/store/useUiStore';
import { DirectoryManagerPage } from '@features/settings/directory-manager';
import type { DirectoryManagerConfig } from '@features/settings/directory-manager';
import { SettingsPageHeader } from '@pages/settings/SettingsPageHeader';
import type { PayeeListItem } from '@budgero/core/browser';

interface PayeeDraft {
  name: string;
}

export default function PayeesPage() {
  const { t } = useLingui();

  const payeeDirectoryConfig: DirectoryManagerConfig<PayeeListItem, string, PayeeDraft> = {
    header: (
      <SettingsPageHeader
        title={t`Manage Payees`}
        description={t`Add new payees, rename existing ones, or clear them from your transactions.`}
      />
    ),
    pageTitle: 'Manage Payees',
    selectBudgetDescription: 'Select a budget to manage payees.',
    addCardTitle: 'Add Payee',
    addCardDescription: 'Keep your list tidy by creating common payees up front.',
    addButtonLabel: 'Add payee',
    namePlaceholder: 'e.g. Local Grocery',
    listDescription: 'Rename to merge duplicates or remove unused payees.',
    countLabel: (count) => t`Payees (${count})`,
    loadingLabel: 'Loading payees...',
    emptyStateText: 'No payees yet. Add one to get started.',
    columns: [],
    getKey: (item) => item.Name,
    getName: (item) => item.Name,
    getUsageCount: (item) => item.UsageCount,
    emptyDraft: { name: '' },
    draftFromItem: (item) => ({ name: item.Name }),
    prepareDraft: (draft) => {
      const name = draft.name.trim();
      if (!name) {
        return {
          error: { title: t`Enter a payee name`, description: t`Payee name cannot be empty.` },
        };
      }
      return { draft: { name } };
    },
    deleteDialogTitle: () => t`Remove this payee?`,
    deleteDialogDescription: (item) => (
      <>
        This will clear &ldquo;{item.Name}&rdquo; from all transactions in this budget. You can add
        it back later if needed.
      </>
    ),
    bulkDelete: {
      selectRowLabel: (item) => t`Select ${item.Name}`,
      deleteSelectedLabel: (count) =>
        plural(count, {
          one: `Delete # payee`,
          other: `Delete # payees`,
        }),
      selectUnusedLabel: (count) => t`Select unused (${count})`,
      deleteDialogTitle: (items) =>
        plural(items.length, {
          one: `Remove # payee?`,
          other: `Remove # payees?`,
        }),
      deleteDialogDescription: (items) => {
        const inUse = items.filter((item) => item.UsageCount > 0);
        const affected = inUse.reduce((sum, item) => sum + item.UsageCount, 0);
        return (
          <Trans>
            This clears the selected payees from your transactions in this budget.
            {inUse.length > 0 && (
              <Trans>
                {' '}
                {inUse.length === 1 ? 'One of them is' : `${inUse.length} of them are`} still in
                use, affecting {affected.toLocaleString()}{' '}
                {affected === 1 ? 'transaction' : 'transactions'}.
              </Trans>
            )}{' '}
            You can add them back later if needed.
          </Trans>
        );
      },
    },
    toasts: {
      addSuccess: (draft) => ({
        title: t`Payee added`,
        description: t`"${draft.name}" is now available when adding transactions.`,
      }),
      addErrorTitle: 'Could not add payee',
      editSuccess: (item, draft) => ({
        title: t`Payee updated`,
        description: t`"${item.Name}" renamed to "${draft.name}".`,
      }),
      editErrorTitle: 'Could not update payee',
      deleteSuccess: (item) => ({
        title: t`Payee removed`,
        description: t`"${item.Name}" has been removed and cleared from existing transactions.`,
      }),
      deleteErrorTitle: 'Could not remove payee',
      deleteManySuccess: (items) => ({
        title: plural(items.length, {
          one: `# payee removed`,
          other: `# payees removed`,
        }),
        description: t`They have been cleared from existing transactions.`,
      }),
      deleteManyErrorTitle: 'Could not remove payees',
    },
  };

  const { selectedBudget } = useUiStore();
  const budgetId = selectedBudget?.ID ?? null;

  const { data: payees = [], isLoading, isFetching } = usePayeeDirectory(budgetId);
  const addPayee = useAddPayee();
  const renamePayee = useRenamePayee();
  const deletePayee = useDeletePayee();
  const deletePayees = useDeletePayees();

  return (
    <DirectoryManagerPage
      config={payeeDirectoryConfig}
      budgetId={budgetId}
      items={payees}
      isLoading={isLoading}
      isFetching={isFetching}
      onAdd={(draft) => addPayee.mutateAsync({ budgetId: budgetId!, name: draft.name })}
      isAdding={addPayee.isPending}
      onEdit={(key, draft) =>
        renamePayee.mutateAsync({ budgetId: budgetId!, oldName: key, newName: draft.name })
      }
      isSaving={renamePayee.isPending}
      onDelete={(item) => deletePayee.mutateAsync({ budgetId: budgetId!, name: item.Name })}
      isDeleting={deletePayee.isPending}
      onDeleteMany={(items) =>
        deletePayees.mutateAsync({ budgetId: budgetId!, names: items.map((item) => item.Name) })
      }
      isDeletingMany={deletePayees.isPending}
    />
  );
}
