import { useState, type FormEvent } from 'react';
import { ChartNoAxesCombined, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddCategory,
  useCategories,
  useCategoryGroups,
  useUpdateCategoryName,
} from '@entities/category/api/useCategories';
import { useReassignAndDeleteCategory } from '@features/category-management/api/useReassignAndDeleteCategory';
import { DeleteCategoryDialog } from '@features/category-management/ui/DeleteCategoryDialog';
import { useActiveSpaceId } from '@shared/runtime/runtime-provider';
import { useUiStore } from '@shared/store/useUiStore';
import { toastError } from '@shared/lib/errors';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

export function IncomeCategoriesCard() {
  const budget = useUiStore((state) => state.selectedBudget);
  const spaceId = useActiveSpaceId();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartNoAxesCombined className="h-5 w-5" aria-hidden="true" />
          Income categories
        </CardTitle>
        <CardDescription>
          Optional: give income sources their own categories, such as Salary, Freelance, or Rental
          income, to see them separately in analytics. All categories in the Income group count
          toward Ready to Assign in the same way. You can keep using the default Income category for
          everything.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {budget && spaceId ? (
          <IncomeCategoryForm
            key={`${spaceId}:${budget.ID}`}
            budgetId={budget.ID}
            budgetName={budget.Name}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a budget to manage its income categories.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeCategoryForm({ budgetId, budgetName }: { budgetId: number; budgetName: string }) {
  const categoriesQuery = useCategories(budgetId);
  const groupsQuery = useCategoryGroups(budgetId);
  const create = useAddCategory();
  const rename = useUpdateCategoryName();
  const remove = useReassignAndDeleteCategory();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const group = groupsQuery.data?.find(
    (item) => item.Name === 'Income' && item.BudgetID === budgetId
  );
  const categories = (categoriesQuery.data ?? []).filter(
    (category) => category.CategoryGroupID === group?.ID && category.BudgetID === budgetId
  );
  const busy = create.isPending || rename.isPending || remove.isPending;
  const deleting = categories.find(
    (category) => category.ID === deletingId && category.Name !== 'Income'
  );

  const validate = (value: string, excludeId?: number) => {
    if (!value.trim()) return 'Enter a category name.';
    if (
      categories.some(
        (category) =>
          category.ID !== excludeId &&
          category.Name.trim().toLowerCase() === value.trim().toLowerCase()
      )
    ) {
      return 'An income category with this name already exists.';
    }
    return null;
  };

  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!group || busy) return;
    const error = validate(name);
    setFormError(error);
    if (error) return;
    try {
      await create.mutateAsync({ budgetId, groupId: group.ID, name: name.trim(), note: '' });
      setName('');
      toast.success('Income category added');
    } catch (error) {
      toastError('Could not add income category', error, 'Please try again.');
    }
  };

  const renameCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    const category = categories.find((item) => item.ID === editing.id);
    if (!category || category.Name === 'Income') return;
    const error = validate(editing.name, editing.id);
    setEditError(error);
    if (error) return;
    try {
      await rename.mutateAsync({ budgetId, id: editing.id, name: editing.name.trim() });
      setEditing(null);
      toast.success('Income category renamed');
    } catch (error) {
      toastError('Could not rename income category', error, 'Please try again.');
    }
  };

  if (categoriesQuery.isError || groupsQuery.isError) {
    return (
      <div role="alert" className="space-y-3 text-sm">
        <p>Could not load income categories.</p>
        <Button
          variant="outline"
          onClick={() => {
            void categoriesQuery.refetch();
            void groupsQuery.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }
  if (categoriesQuery.isPending || groupsQuery.isPending) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading income categories…
      </p>
    );
  }
  if (!group) {
    return (
      <p role="alert" className="text-sm text-muted-foreground">
        This budget’s Income group is missing. Restore it before adding income categories.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground break-words">
        Categories for <strong className="text-foreground">{budgetName}</strong>
      </p>
      <ul className="divide-y rounded-lg border">
        {categories.map((category) => (
          <li key={category.ID} className="p-3 sm:p-4">
            {editing?.id === category.ID ? (
              <form onSubmit={renameCategory} className="space-y-3">
                <Label htmlFor="edit-income-category">Category name</Label>
                <Input
                  id="edit-income-category"
                  value={editing.name}
                  autoFocus
                  disabled={busy}
                  aria-invalid={Boolean(editError)}
                  aria-describedby={editError ? 'income-edit-error' : undefined}
                  onChange={(event) => {
                    setEditing({ ...editing, name: event.target.value });
                    setEditError(null);
                  }}
                />
                {editError && (
                  <p id="income-edit-error" role="alert" className="text-sm text-destructive">
                    {editError}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy || !editing.name.trim()}>
                    {rename.isPending ? 'Saving…' : 'Save name'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium">{category.Name}</p>
                  {category.Name === 'Income' && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <LockKeyhole className="h-3 w-3 shrink-0" aria-hidden="true" />
                      System category · always available
                    </p>
                  )}
                </div>
                {category.Name !== 'Income' && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11"
                      aria-label={`Rename ${category.Name}`}
                      disabled={busy}
                      onClick={() => {
                        setEditing({ id: category.ID, name: category.Name });
                        setEditError(null);
                      }}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-destructive"
                      aria-label={`Delete ${category.Name}`}
                      disabled={busy}
                      onClick={() => setDeletingId(category.ID)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={addCategory} className="space-y-2">
        <Label htmlFor="new-income-category">New income category</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="new-income-category"
            value={name}
            placeholder="e.g. Freelance"
            disabled={busy}
            aria-invalid={Boolean(formError)}
            aria-describedby={formError ? 'income-name-error' : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setFormError(null);
            }}
          />
          <Button type="submit" className="shrink-0" disabled={busy || !name.trim()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {create.isPending ? 'Adding…' : 'Add category'}
          </Button>
        </div>
        {formError && (
          <p id="income-name-error" role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
      </form>
      {deleting && (
        <DeleteCategoryDialog
          key={deleting.ID}
          open
          onClose={() => setDeletingId(null)}
          categories={categories.map((category) => ({
            categoryId: category.ID,
            name: category.Name,
          }))}
          currentCategoryId={deleting.ID}
          incomeOnly
          isLoading={remove.isPending}
          onDelete={async (newCategoryId) => {
            try {
              await remove.mutateAsync({ budgetId, oldCategoryId: deleting.ID, newCategoryId });
              toast.success('Income category deleted', {
                description: 'Its history was moved to the selected income category.',
              });
            } catch (error) {
              toastError('Could not delete income category', error, 'Please try again.');
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}
