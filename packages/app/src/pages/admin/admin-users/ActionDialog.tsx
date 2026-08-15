import { Trans } from '@lingui/react/macro';
import React from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { AlertCircle } from 'lucide-react';
import type { ActionDialogState } from '@features/admin/model/admin-users';
import { MIN_BETA_DAYS, MAX_BETA_DAYS } from './constants';

interface ActionDialogProps {
  dialog: ActionDialogState;
  betaDays: number;
  onBetaDaysChange: (days: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function getDialogTitle(type: ActionDialogState['type']): string {
  switch (type) {
    case 'grant_founding':
      return 'Grant Founding Member Access';
    case 'grant_beta':
      return 'Grant Free Access';
    case 'revoke_access':
      return 'Revoke Access';
    case 'reset_data':
      return 'Reset User Data';
    case 'make_admin':
      return 'Make Administrator';
    case 'block':
      return 'Block User';
    case 'unblock':
      return 'Unblock User';
    default:
      return '';
  }
}

function getConfirmButtonText(type: ActionDialogState['type']): string {
  switch (type) {
    case 'revoke_access':
      return 'Revoke Access';
    case 'reset_data':
      return 'Reset Data';
    default:
      return 'Confirm';
  }
}

export const ActionDialog = React.memo(function ActionDialog({
  dialog,
  betaDays,
  onBetaDaysChange,
  onConfirm,
  onClose,
}: ActionDialogProps) {
  const isDestructive = dialog.type === 'revoke_access' || dialog.type === 'reset_data';

  return (
    <Dialog open={dialog.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle(dialog.type)}</DialogTitle>
          <DialogDescription>
            {dialog.user && (
              <div className="mt-2">
                <p>
                  <Trans>User: {dialog.user.email}</Trans>
                </p>
                <p>
                  <Trans>Name: {dialog.user.name}</Trans>
                </p>
              </div>
            )}
            {dialog.type === 'block' && (
              <p className="text-sm text-muted-foreground mt-3">
                <Trans>
                  This user will be signed out immediately and prevented from logging back in until
                  unblocked.
                </Trans>
              </p>
            )}
            {dialog.type === 'unblock' && (
              <p className="text-sm text-muted-foreground mt-3">
                <Trans>Allow this user to log in again and resume normal access.</Trans>
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        {dialog.type === 'grant_beta' && (
          <div className="space-y-2">
            <Label htmlFor="beta-days">
              <Trans>Days of Free Access</Trans>
            </Label>
            <Input
              id="beta-days"
              type="number"
              min={MIN_BETA_DAYS}
              max={MAX_BETA_DAYS}
              value={betaDays}
              onChange={(e) => onBetaDaysChange(parseInt(e.target.value) || 30)}
            />
          </div>
        )}

        {dialog.type === 'revoke_access' && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  <Trans>Warning</Trans>
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <Trans>
                    This will immediately revoke all access for this user. They will be logged out
                    and unable to access the application.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        )}

        {dialog.type === 'reset_data' && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  <Trans>Irreversible Action</Trans>
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <Trans>
                    This will delete the user's encrypted database file, reset their master password
                    status, and clear all onboarding progress. This action cannot be undone.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        )}

        {dialog.type === 'block' && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  <Trans>Block User</Trans>
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <Trans>
                    The user will be forced offline immediately and all API requests will be denied
                    until you unblock them.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={onConfirm} variant={isDestructive ? 'destructive' : 'default'}>
            {getConfirmButtonText(dialog.type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
