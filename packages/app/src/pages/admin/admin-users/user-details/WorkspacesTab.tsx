import { Trans } from '@lingui/react/macro';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import type { AdminUserDetails } from '@features/admin/model/admin-users';
import { formatShortDate } from '../admin-users.utils';
import { TabSection } from './TabSection';
import { CompactMetric, EmptyState, SectionError } from './primitives';

export function WorkspacesTab({
  details,
  loading,
  error,
  onRetry,
}: {
  details: AdminUserDetails | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <TabSection loading={loading} error={error} onRetry={onRetry}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Workspace Access</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Membership footprint and owner-wide collaborator seat usage.</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <CompactMetric
            label="Owned Workspaces"
            value={`${details?.workspaces.ownedWorkspaceCount ?? 0}`}
          />
          <CompactMetric
            label="Collaborator Workspaces"
            value={`${details?.workspaces.collaboratorWorkspaceCount ?? 0}`}
          />
          <CompactMetric
            label="Shares Used"
            value={`${details?.workspaces.ownedShareSeatsUsed ?? 0}/${details?.workspaces.ownedShareSeatsLimit ?? 5}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans>Workspace Memberships</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Every workspace this account belongs to, including invitation status.</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionError message={details?.sectionErrors?.workspaces} />
          {details?.workspaces.items.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Trans>Workspace</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Role</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Status</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Owner</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Created</Trans>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.workspaces.items.map((workspace) => (
                  <TableRow key={`${workspace.spaceId}-${workspace.role}`}>
                    <TableCell>
                      <div className="font-medium">
                        {workspace.displayName || workspace.spaceId}
                      </div>
                      <div className="text-xs text-muted-foreground">{workspace.spaceId}</div>
                    </TableCell>
                    <TableCell className="capitalize">{workspace.role}</TableCell>
                    <TableCell className="capitalize">{workspace.invitationStatus}</TableCell>
                    <TableCell>{workspace.ownerUserId}</TableCell>
                    <TableCell>{formatShortDate(workspace.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState message="This user is not attached to any workspaces." />
          )}
        </CardContent>
      </Card>
    </TabSection>
  );
}
