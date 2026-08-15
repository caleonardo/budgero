import { plural } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { RefreshCw } from 'lucide-react';
import type { User, ActionType } from '@features/admin/model/admin-users';
import { UserTableRow } from './UserTableRow';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onViewDetails: (user: User) => void;
  onAction: (type: ActionType, user: User) => void;
  onCopyId: (userId: string) => void;
}

export const UsersTable = React.memo(function UsersTable({
  users,
  loading,
  onViewDetails,
  onAction,
  onCopyId,
}: UsersTableProps) {
  const { t } = useLingui();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>All Users</Trans>
        </CardTitle>
        <CardDescription>
          {loading
            ? t`Loading...`
            : plural(users.length, {
                one: `# user found`,
                other: `# users found`,
              })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trans>No users found</Trans>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>
                  <Trans>User</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Status</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Subscription</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Joined</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Details</Trans>
                </TableHead>
                <TableHead className="text-right">
                  <Trans>Actions</Trans>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onViewDetails={onViewDetails}
                  onAction={onAction}
                  onCopyId={onCopyId}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
});
