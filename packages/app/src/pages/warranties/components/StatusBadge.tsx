import { Trans } from '@lingui/react/macro';
/* eslint-disable react-refresh/only-export-components */
import { parseISO } from 'date-fns';
import { Badge } from '@shared/ui/badge';

export type WarrantyStatus = 'active' | 'expiring' | 'expired';

export function getStatus(expiresAt: string): WarrantyStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = parseISO(expiresAt);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring';
  return 'active';
}

export function StatusBadge({ status }: { status: WarrantyStatus }) {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-emerald-600">
          <Trans>Active</Trans>
        </Badge>
      );
    case 'expiring':
      return (
        <Badge variant="default" className="bg-amber-500">
          <Trans>Expiring Soon</Trans>
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="destructive">
          <Trans>Expired</Trans>
        </Badge>
      );
  }
}
