import { Trans, useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import type { CustomDashboard } from '@budgero/core/browser';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { getErrorMessage } from '@shared/lib/errors';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardSwitcherProps {
  dashboards: CustomDashboard[];
  activeDashboardId: string | null;
  onSelectDashboard: (dashboardId: string) => void;
  onCreateDashboard: (name: string) => Promise<void>;
  onRenameDashboard: (dashboardId: string, name: string) => Promise<void>;
  onDeleteDashboard: (dashboardId: string) => Promise<void>;
}

export function DashboardSwitcher({
  dashboards,
  activeDashboardId,
  onSelectDashboard,
  onCreateDashboard,
  onRenameDashboard,
  onDeleteDashboard,
}: DashboardSwitcherProps) {
  const { t } = useLingui();

  const activeDashboard =
    dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? null;
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createName, setCreateName] = useState('My Dashboard');
  const [renameName, setRenameName] = useState('');
  const [pendingAction, setPendingAction] = useState<'create' | 'rename' | 'delete' | null>(null);

  useEffect(() => {
    if (!renameOpen) return;
    setRenameName(activeDashboard?.name ?? '');
  }, [renameOpen, activeDashboard]);

  useEffect(() => {
    if (!createOpen) return;
    setCreateName('My Dashboard');
  }, [createOpen]);

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) {
      toast.error(t`Dashboard name cannot be empty`);
      return;
    }
    setPendingAction('create');
    try {
      await onCreateDashboard(name);
      setCreateOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create dashboard'));
    } finally {
      setPendingAction(null);
    }
  };

  const handleRename = async () => {
    if (!activeDashboard) return;
    const nextName = renameName.trim();
    if (!nextName) {
      toast.error(t`Dashboard name cannot be empty`);
      return;
    }
    if (nextName === activeDashboard.name) {
      setRenameOpen(false);
      return;
    }
    setPendingAction('rename');
    try {
      await onRenameDashboard(activeDashboard.id, nextName);
      setRenameOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to rename dashboard'));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!activeDashboard) return;
    setPendingAction('delete');
    try {
      await onDeleteDashboard(activeDashboard.id);
      setDeleteOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete dashboard'));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={activeDashboardId ?? ''}
        onValueChange={onSelectDashboard}
        disabled={dashboards.length === 0}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder={t`Select dashboard`} />
        </SelectTrigger>
        <SelectContent>
          {dashboards.map((dashboard) => (
            <SelectItem key={dashboard.id} value={dashboard.id}>
              {dashboard.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={createOpen} onOpenChange={setCreateOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={pendingAction !== null}>
            <Trans>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Trans>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              <Trans>Create dashboard</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>Name your new custom dashboard.</Trans>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-dashboard-name">
              <Trans>Name</Trans>
            </Label>
            <Input
              id="new-dashboard-name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder={t`My Dashboard`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              disabled={pendingAction === 'create'}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              size="sm"
              onClick={() => void handleCreate()}
              disabled={pendingAction === 'create'}
            >
              {pendingAction === 'create' ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={renameOpen} onOpenChange={setRenameOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={!activeDashboard || pendingAction !== null}>
            <Trans>
              <Pencil className="h-4 w-4 mr-1" />
              Rename
            </Trans>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              <Trans>Rename dashboard</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              Update the name for <span className="font-medium">{activeDashboard?.name}</span>.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rename-dashboard-name">
              <Trans>Name</Trans>
            </Label>
            <Input
              id="rename-dashboard-name"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              placeholder={t`Dashboard name`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameOpen(false)}
              disabled={pendingAction === 'rename'}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              size="sm"
              onClick={() => void handleRename()}
              disabled={pendingAction === 'rename'}
            >
              {pendingAction === 'rename' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={!activeDashboard || pendingAction !== null}>
            <Trans>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Trans>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              <Trans>Delete dashboard</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              Delete <span className="font-medium">{activeDashboard?.name}</span>? This removes all
              widgets on it.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={pendingAction === 'delete'}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void handleDelete()}
              disabled={pendingAction === 'delete'}
            >
              {pendingAction === 'delete' ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
