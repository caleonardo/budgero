import { Trans } from '@lingui/react/macro';
import React from 'react';
import { formatDate as format } from '@shared/lib/date-format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Receipt, ExternalLink } from 'lucide-react';
import { Spinner } from '@shared/ui/spinner';
import type { SubscriptionViewModel } from '@pages/settings/subscription/useSubscriptionViewModel';

interface InvoicesTableProps {
  vm: SubscriptionViewModel;
}

export const InvoicesTable = React.memo(function InvoicesTable({ vm }: InvoicesTableProps) {
  const { invoices, invoicesLoading, billingPortalAvailable } = vm;

  if (!billingPortalAvailable) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trans>
            <Receipt className="w-5 h-5" />
            Invoice History
          </Trans>
        </CardTitle>
        <CardDescription>
          <Trans>View and download your past invoices</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans>Date</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Status</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Amount</Trans>
                </TableHead>
                <TableHead className="text-right">
                  <Trans>Actions</Trans>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status_formatted}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.total_formatted}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.invoice_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            <Trans>No invoices yet. Invoices will appear here after your first payment.</Trans>
          </p>
        )}
      </CardContent>
    </Card>
  );
});
