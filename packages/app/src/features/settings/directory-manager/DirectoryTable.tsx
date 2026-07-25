import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Checkbox } from '@shared/ui/checkbox';
import { Input } from '@shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Spinner } from '@shared/ui/spinner';
import { InlineLoadingRow } from '@shared/ui/InlineLoadingRow';
import { Pencil, Save, Trash2, X } from 'lucide-react';
import type { DirectoryManagerConfig } from './types';

interface DirectoryTableProps<
  TItem,
  TKey extends string | number,
  TDraft extends { name: string },
> {
  config: DirectoryManagerConfig<TItem, TKey, TDraft>;
  items: TItem[];
  isLoading: boolean;
  isFetching: boolean;
  editingKey: TKey | null;
  editDraft: TDraft;
  setEditDraft: (patch: Partial<TDraft>) => void;
  isSaving: boolean;
  onStartEdit: (item: TItem) => void;
  onCancelEdit: () => void;
  onSave: (item: TItem) => void;
  onRequestDelete: (item: TItem) => void;
  /** Selection props are inert unless `config.bulkDelete` is set. */
  selectedKeys: Set<TKey>;
  /** Count of selected keys that still exist in `items`. */
  selectedCount: number;
  onToggleSelected: (key: TKey, selected: boolean) => void;
  onSetSelection: (keys: TKey[]) => void;
  onClearSelection: () => void;
  onRequestDeleteSelected: () => void;
  isDeletingMany: boolean;
}

export function DirectoryTable<
  TItem,
  TKey extends string | number,
  TDraft extends { name: string },
>({
  config,
  items,
  isLoading,
  isFetching,
  editingKey,
  editDraft,
  setEditDraft,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRequestDelete,
  selectedKeys,
  selectedCount,
  onToggleSelected,
  onSetSelection,
  onClearSelection,
  onRequestDeleteSelected,
  isDeletingMany,
}: DirectoryTableProps<TItem, TKey, TDraft>) {
  const bulk = config.bulkDelete;
  const unusedItems = bulk ? items.filter((item) => config.getUsageCount(item) === 0) : [];
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>{config.countLabel(items.length)}</CardTitle>
          <CardDescription>{config.listDescription}</CardDescription>
        </div>
        {isFetching && <Spinner className="text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {bulk && items.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {selectedCount > 0 ? (
              <>
                <span className="text-sm font-medium">{selectedCount} selected</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onRequestDeleteSelected}
                  disabled={isDeletingMany}
                >
                  {isDeletingMany ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                  <span className="ml-1">{bulk.deleteSelectedLabel(selectedCount)}</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={onClearSelection}>
                  Clear selection
                </Button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Select rows to remove several at once.
              </span>
            )}
            {bulk.selectUnusedLabel && unusedItems.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="sm:ml-auto"
                onClick={() => onSetSelection(unusedItems.map((item) => config.getKey(item)))}
              >
                {bulk.selectUnusedLabel(unusedItems.length)}
              </Button>
            )}
          </div>
        )}

        {isLoading ? (
          <InlineLoadingRow label={config.loadingLabel} />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{config.emptyStateText}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {bulk && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      aria-label={allSelected ? 'Deselect all' : 'Select all'}
                      onCheckedChange={(checked) =>
                        checked === true
                          ? onSetSelection(items.map((item) => config.getKey(item)))
                          : onClearSelection()
                      }
                    />
                  </TableHead>
                )}
                {config.columns.map((column) => (
                  <TableHead key={column.key} className={column.headerClassName}>
                    {column.header}
                  </TableHead>
                ))}
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Usage</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const key = config.getKey(item);
                const isEditing = editingKey === key;
                const usageCount = config.getUsageCount(item);
                const usageLabel =
                  usageCount === 1
                    ? '1 transaction'
                    : `${usageCount.toLocaleString()} transactions`;

                return (
                  <TableRow key={key} data-state={selectedKeys.has(key) ? 'selected' : undefined}>
                    {bulk && (
                      <TableCell>
                        <Checkbox
                          checked={selectedKeys.has(key)}
                          aria-label={bulk.selectRowLabel(item)}
                          onCheckedChange={(checked) => onToggleSelected(key, checked === true)}
                        />
                      </TableCell>
                    )}
                    {config.columns.map((column) => (
                      <TableCell key={column.key} className={column.cellClassName}>
                        {isEditing
                          ? column.renderEdit(editDraft, setEditDraft)
                          : column.renderView(item)}
                      </TableCell>
                    ))}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editDraft.name}
                          onChange={(e) =>
                            setEditDraft({ name: e.target.value } as Partial<TDraft>)
                          }
                          autoFocus
                          className="max-w-sm"
                        />
                      ) : (
                        <span className="font-medium inline-flex items-center gap-2">
                          {config.renderNameIcon?.(item)}
                          {config.getName(item)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{usageCount === 0 ? 'Not used yet' : usageLabel}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={onCancelEdit}>
                            <X className="h-4 w-4" />
                            <span className="ml-1">Cancel</span>
                          </Button>
                          <Button size="sm" onClick={() => onSave(item)} disabled={isSaving}>
                            {isSaving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
                            <span className="ml-1">Save</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => onStartEdit(item)}>
                            <Pencil className="h-4 w-4" />
                            <span className="ml-1">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onRequestDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1">Delete</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
