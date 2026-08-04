import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import {
  Users,
  CreditCard,
  TrendingUp,
  Gift,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  RefreshCw,
  MailQuestion,
  Send,
} from 'lucide-react';
import { useAdminApi } from '@features/admin/api/useAdminApi';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@shared/lib/utils';
import { toast } from 'sonner';
import { IS_SELF_HOSTABLE_BUILD } from '@shared/lib/env';
import { StatCard } from '@pages/admin/components/StatCard';
import SelfHostAdminDashboard from '@pages/admin/SelfHostAdminDashboard';
import StickinessAnalyticsSection from '@pages/admin/StickinessAnalyticsSection';
import type {
  AdminStats,
  ClerkSyncResult,
  FeedbackBroadcastResult,
  FeedbackBroadcastStatus,
} from '@features/admin/model/admin-dashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingClerk, setSyncingClerk] = useState(false);
  const [clerkSyncResult, setClerkSyncResult] = useState<ClerkSyncResult | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackBroadcastStatus | null>(null);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<FeedbackBroadcastResult | null>(null);
  const adminApi = useAdminApi();

  const loadStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminApi]);

  const handleSyncClerkUsers = useCallback(async () => {
    try {
      setSyncingClerk(true);
      const result: ClerkSyncResult = await adminApi.syncClerkUsers();
      setClerkSyncResult(result);
      toast.success('Clerk sync complete', {
        description: `Synced ${result.Synced ?? 0} users (${result.Created ?? 0} created, ${
          result.Migrated ?? 0
        } migrated, ${result.Updated ?? 0} updated).`,
      });
    } catch (error) {
      console.error('Failed to sync Clerk users:', error);
      toast.error('Clerk sync failed', {
        description: 'Unable to sync Clerk users. Check server logs for details.',
      });
    } finally {
      setSyncingClerk(false);
    }
  }, [adminApi]);

  const loadFeedbackStatus = useCallback(async () => {
    try {
      const status = await adminApi.getFeedbackBroadcastStatus();
      setFeedbackStatus(status);
    } catch (error) {
      console.error('Failed to load feedback broadcast status:', error);
    }
  }, [adminApi]);

  const handleSendFeedbackBroadcast = useCallback(async () => {
    if (!feedbackStatus) return;
    const confirmed = window.confirm(
      `Send the ${feedbackStatus.quarter} feedback email to ${feedbackStatus.eligible} active users?${
        feedbackStatus.dryRun ? ' (dry run — nothing actually sends)' : ''
      }`
    );
    if (!confirmed) return;
    try {
      setSendingFeedback(true);
      const result = await adminApi.sendFeedbackBroadcast();
      setFeedbackResult(result);
      toast.success('Feedback broadcast complete', {
        description: `Sent ${result.sent ?? 0} of ${result.eligible ?? 0}, failed ${
          result.failed ?? 0
        }${result.dryRun ? ' (dry run)' : ''}.`,
      });
      void loadFeedbackStatus();
    } catch (error) {
      console.error('Failed to send feedback broadcast:', error);
      toast.error('Feedback broadcast failed', {
        description: 'Check server logs. Re-sending is safe — delivered users are skipped.',
      });
    } finally {
      setSendingFeedback(false);
    }
  }, [adminApi, feedbackStatus, loadFeedbackStatus]);

  useEffect(() => {
    if (!IS_SELF_HOSTABLE_BUILD) {
      void loadStats();
      void loadFeedbackStatus();
    }
  }, [loadStats, loadFeedbackStatus]);

  // Early return for self-hostable build after all hooks
  if (IS_SELF_HOSTABLE_BUILD) {
    return <SelfHostAdminDashboard />;
  }

  if (loading && !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your Budgero platform</p>
        </div>
        <Button onClick={loadStats} disabled={refreshing} size="sm">
          <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          helper={
            <>
              <span className="text-green-600">+{stats?.activeUsers || 0}</span> active
            </>
          }
        />

        <StatCard
          icon={CreditCard}
          label="Paid Users"
          value={stats?.paidUsers || 0}
          helper={
            <>
              <span className="text-blue-600">{stats?.trialUsers || 0}</span> on trial
            </>
          }
        />

        <StatCard
          icon={DollarSign}
          label="MRR"
          value={`$${((stats?.mrr || 0) / 100).toFixed(2)}`}
          helper="Monthly recurring revenue"
        />

        <StatCard
          icon={Gift}
          label="Special Access"
          value={(stats?.foundingMembers || 0) + (stats?.betaUsers || 0)}
          helper={
            <>
              <span className="text-orange-600">{stats?.foundingMembers || 0}</span> founding,{' '}
              <span className="text-indigo-600">{stats?.betaUsers || 0}</span> free access
            </>
          }
        />
      </div>

      {/* Sync Utilities */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Utilities</CardTitle>
          <CardDescription>Keep Clerk users aligned with Budgero.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Sync Clerk -&gt; Budgero</p>
                  <p className="text-sm text-muted-foreground">
                    Create or migrate Budgero users from the latest Clerk directory.
                  </p>
                </div>
              </div>
              {clerkSyncResult && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Synced {clerkSyncResult.Synced ?? 0} | Created {clerkSyncResult.Created ?? 0} |
                  Migrated {clerkSyncResult.Migrated ?? 0} | Updated {clerkSyncResult.Updated ?? 0}
                </div>
              )}
              <div>
                <Button size="sm" onClick={handleSyncClerkUsers} disabled={syncingClerk}>
                  <RefreshCw className={cn('mr-2 h-4 w-4', syncingClerk && 'animate-spin')} />
                  {syncingClerk ? 'Syncing...' : 'Sync Clerk Users'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <MailQuestion className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Quarterly Feedback Email</p>
                  <p className="text-sm text-muted-foreground">
                    Ask everyone active in the last 30 days what's working and what isn't. Replies
                    go to hello@.
                  </p>
                </div>
              </div>
              {feedbackStatus && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {feedbackStatus.quarter} | Eligible {feedbackStatus.eligible} | Already sent{' '}
                  {feedbackStatus.alreadySent}
                  {feedbackStatus.dryRun ? ' | DRY RUN' : ''}
                </div>
              )}
              {feedbackResult && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Last run: sent {feedbackResult.sent ?? 0} | failed {feedbackResult.failed ?? 0}
                </div>
              )}
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSendFeedbackBroadcast}
                  disabled={sendingFeedback || !feedbackStatus || feedbackStatus.eligible === 0}
                >
                  <Send className={cn('mr-2 h-4 w-4', sendingFeedback && 'animate-pulse')} />
                  {sendingFeedback
                    ? 'Sending...'
                    : feedbackStatus && feedbackStatus.eligible === 0
                      ? 'All caught up'
                      : 'Send Feedback Email'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Active Subscribers</span>
                </div>
                <Badge variant="secondary">{stats?.paidUsers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Trial Users</span>
                </div>
                <Badge variant="secondary">{stats?.trialUsers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Beta Testers</span>
                </div>
                <Badge variant="secondary">{stats?.betaUsers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Founding Members</span>
                </div>
                <Badge variant="secondary">{stats?.foundingMembers || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Inactive</span>
                </div>
                <Badge variant="secondary">
                  {(stats?.totalUsers || 0) - (stats?.activeUsers || 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mt-1.5',
                      activity.type === 'signup' && 'bg-green-500',
                      activity.type === 'payment' && 'bg-blue-500',
                      activity.type === 'cancellation' && 'bg-red-500',
                      activity.type === 'login' && 'bg-gray-500'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stickiness & retention — DAU/MAU + signup-cohort retention. */}
      <StickinessAnalyticsSection />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
