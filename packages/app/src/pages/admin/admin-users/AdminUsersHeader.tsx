import { Trans } from '@lingui/react/macro';
import React from 'react';
import { Button } from '@shared/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdminUsersHeaderProps {
  onSyncClerk: () => void;
  onSyncLemonSqueezy: () => void;
  onRefresh: () => void;
}

export const AdminUsersHeader = React.memo(function AdminUsersHeader({
  onSyncClerk,
  onSyncLemonSqueezy,
  onRefresh,
}: AdminUsersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          <Trans>Users</Trans>
        </h1>
        <p className="text-muted-foreground mt-1">
          <Trans>Manage user accounts and access levels</Trans>
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSyncClerk} size="sm" variant="outline">
          <Trans>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Clerk Users
          </Trans>
        </Button>
        <Button onClick={onSyncLemonSqueezy} size="sm" variant="outline">
          <Trans>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Subscriptions
          </Trans>
        </Button>
        <Button onClick={onRefresh} size="sm" variant="outline">
          <Trans>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Trans>
        </Button>
      </div>
    </div>
  );
});
