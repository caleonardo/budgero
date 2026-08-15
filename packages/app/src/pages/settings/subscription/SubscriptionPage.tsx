import { Trans } from '@lingui/react/macro';
import { formatDate as format } from '@shared/lib/date-format';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Calendar, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert';
import { useSubscriptionViewModel } from '@pages/settings/subscription/useSubscriptionViewModel';
import { SubscriptionStatusCard } from '@pages/settings/subscription/SubscriptionStatusCard';
import { PlanSelection } from '@pages/settings/subscription/PlanSelection';
import { InvoicesTable } from '@pages/settings/subscription/InvoicesTable';
import { CancelDialog } from '@pages/settings/subscription/CancelDialog';
import { PlanChangeDialog } from '@pages/settings/subscription/PlanChangeDialog';
import { SettingsPageHeader } from '@pages/settings/SettingsPageHeader';

export default function SubscriptionPage() {
  const vm = useSubscriptionViewModel();

  const { user, userLoading, requiresOnline } = vm;

  if (requiresOnline) {
    return (
      <div className="container max-w-5xl mx-auto p-6 pb-24 md:pb-6">
        <Alert variant="default" className="border border-dashed">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>
            <Trans>Internet connection required</Trans>
          </AlertTitle>
          <AlertDescription>
            <Trans>
              Subscription settings need an active connection to our billing services. Please
              reconnect to the internet to view or manage your plan.
            </Trans>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 pb-24 md:pb-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto p-6 pb-24 md:pb-6 space-y-8">
      <SettingsPageHeader
        title="Subscription"
        description="Manage your Budgero subscription and billing preferences"
      />

      {/* Current Status Card */}
      <SubscriptionStatusCard vm={vm} />

      {/* Billing Management */}
      <PlanSelection vm={vm} />

      {/* Invoice History */}
      <InvoicesTable vm={vm} />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trans>
              <Calendar className="w-5 h-5" />
              Account Information
            </Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  <Trans>Account created:</Trans>
                </span>
                <span className="font-medium">
                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  <Trans>Email:</Trans>
                </span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>

            {user.subscription_id && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    <Trans>Subscription ID:</Trans>
                  </span>
                  <span className="font-mono text-xs">{user.subscription_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    <Trans>Customer ID:</Trans>
                  </span>
                  <span className="font-mono text-xs">{user.customer_id}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CancelDialog vm={vm} />
      <PlanChangeDialog vm={vm} />
    </div>
  );
}

export { SubscriptionPage };
