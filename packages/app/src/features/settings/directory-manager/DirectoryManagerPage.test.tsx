import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { DirectoryManagerPage } from './DirectoryManagerPage';
import type { DirectoryManagerConfig } from './types';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

interface Item {
  Name: string;
  UsageCount: number;
}

interface Draft {
  name: string;
}

const ITEMS: Item[] = [
  { Name: 'Coffee Shop', UsageCount: 3 },
  { Name: 'Grocery Store', UsageCount: 0 },
  { Name: 'Hardware Store', UsageCount: 0 },
];

const config: DirectoryManagerConfig<Item, string, Draft> = {
  header: null,
  pageTitle: 'Manage Things',
  selectBudgetDescription: 'Pick a budget.',
  addCardTitle: 'Add Thing',
  addCardDescription: '',
  addButtonLabel: 'Add thing',
  namePlaceholder: 'name',
  listDescription: '',
  countLabel: (count) => `Things (${count})`,
  loadingLabel: 'Loading...',
  emptyStateText: 'Nothing here.',
  columns: [],
  getKey: (item) => item.Name,
  getName: (item) => item.Name,
  getUsageCount: (item) => item.UsageCount,
  emptyDraft: { name: '' },
  draftFromItem: (item) => ({ name: item.Name }),
  prepareDraft: (draft) => ({ draft }),
  deleteDialogTitle: () => 'Remove this thing?',
  deleteDialogDescription: (item) => `Removes ${item.Name}.`,
  bulkDelete: {
    selectRowLabel: (item) => `Select ${item.Name}`,
    deleteSelectedLabel: (count) => `Delete ${count} things`,
    selectUnusedLabel: (count) => `Select unused (${count})`,
    deleteDialogTitle: (items) => `Remove ${items.length} things?`,
    deleteDialogDescription: (items) => `Removes ${items.map((i) => i.Name).join(', ')}.`,
  },
  toasts: {
    addSuccess: () => ({ title: '', description: '' }),
    addErrorTitle: '',
    editSuccess: () => ({ title: '', description: '' }),
    editErrorTitle: '',
    deleteSuccess: () => ({ title: '', description: '' }),
    deleteErrorTitle: '',
    deleteManySuccess: () => ({ title: '', description: '' }),
    deleteManyErrorTitle: '',
  },
};

function renderPage(overrides: { onDeleteMany?: (items: Item[]) => Promise<void> } = {}) {
  const onDeleteMany = vi.fn().mockResolvedValue(undefined);
  render(
    <DirectoryManagerPage<Item, string, Draft>
      config={config}
      budgetId={1}
      items={ITEMS}
      isLoading={false}
      isFetching={false}
      onAdd={vi.fn()}
      isAdding={false}
      onEdit={vi.fn()}
      isSaving={false}
      onDelete={vi.fn()}
      isDeleting={false}
      onDeleteMany={onDeleteMany}
      isDeletingMany={false}
      {...overrides}
    />
  );
  return { onDeleteMany };
}

/** Confirm the bulk dialog, whose button carries the same label as the toolbar. */
async function confirmBulkDelete(label: string) {
  const buttons = await screen.findAllByRole('button', { name: label });
  fireEvent.click(buttons[buttons.length - 1]);
}

describe('DirectoryManagerPage bulk delete', () => {
  it('deletes exactly the checked rows', async () => {
    const { onDeleteMany } = renderPage();

    fireEvent.click(screen.getByLabelText('Select Coffee Shop'));
    fireEvent.click(screen.getByLabelText('Select Hardware Store'));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete 2 things' }));
    await confirmBulkDelete('Delete 2 things');

    await waitFor(() => expect(onDeleteMany).toHaveBeenCalledTimes(1));
    expect(onDeleteMany.mock.calls[0][0]).toEqual([
      { Name: 'Coffee Shop', UsageCount: 3 },
      { Name: 'Hardware Store', UsageCount: 0 },
    ]);
  });

  it('unchecking a row removes it from the batch', async () => {
    const { onDeleteMany } = renderPage();

    fireEvent.click(screen.getByLabelText('Select Coffee Shop'));
    fireEvent.click(screen.getByLabelText('Select Grocery Store'));
    fireEvent.click(screen.getByLabelText('Select Coffee Shop'));

    fireEvent.click(screen.getByRole('button', { name: 'Delete 1 things' }));
    await confirmBulkDelete('Delete 1 things');

    await waitFor(() => expect(onDeleteMany).toHaveBeenCalledTimes(1));
    expect(onDeleteMany.mock.calls[0][0]).toEqual([{ Name: 'Grocery Store', UsageCount: 0 }]);
  });

  it('selects every row from the header checkbox and clears again', () => {
    renderPage();

    fireEvent.click(screen.getByLabelText('Select all'));
    expect(screen.getByText('3 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Deselect all'));
    expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
    expect(screen.getByText('Select rows to remove several at once.')).toBeInTheDocument();
  });

  it('selects only the unused rows via the shortcut', async () => {
    const { onDeleteMany } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Select unused (2)' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete 2 things' }));
    await confirmBulkDelete('Delete 2 things');

    await waitFor(() => expect(onDeleteMany).toHaveBeenCalledTimes(1));
    expect(onDeleteMany.mock.calls[0][0]).toEqual([
      { Name: 'Grocery Store', UsageCount: 0 },
      { Name: 'Hardware Store', UsageCount: 0 },
    ]);
  });

  it('clears the selection after a successful delete', async () => {
    renderPage();

    fireEvent.click(screen.getByLabelText('Select Coffee Shop'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete 1 things' }));
    await confirmBulkDelete('Delete 1 things');

    await waitFor(() => expect(screen.queryByText('1 selected')).not.toBeInTheDocument());
  });

  it('keeps the selection when the delete fails, so the user can retry', async () => {
    const onDeleteMany = vi.fn().mockRejectedValue(new Error('nope'));
    renderPage({ onDeleteMany });

    fireEvent.click(screen.getByLabelText('Select Coffee Shop'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete 1 things' }));
    await confirmBulkDelete('Delete 1 things');

    await waitFor(() => expect(onDeleteMany).toHaveBeenCalled());
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('hides selection UI entirely when the config opts out', () => {
    const { bulkDelete: _omitted, ...withoutBulk } = config;
    render(
      <DirectoryManagerPage<Item, string, Draft>
        config={withoutBulk}
        budgetId={1}
        items={ITEMS}
        isLoading={false}
        isFetching={false}
        onAdd={vi.fn()}
        isAdding={false}
        onEdit={vi.fn()}
        isSaving={false}
        onDelete={vi.fn()}
        isDeleting={false}
      />
    );

    expect(screen.queryByLabelText('Select all')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Select Coffee Shop')).not.toBeInTheDocument();
  });
});
