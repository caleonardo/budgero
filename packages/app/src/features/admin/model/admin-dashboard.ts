export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  paidUsers: number;
  betaUsers: number;
  foundingMembers: number;
  totalRevenue: number;
  mrr: number;
  recentActivity: {
    id: string;
    type: string;
    user: string;
    timestamp: string;
    details: string;
  }[];
}

export interface ClerkSyncResult {
  Synced: number;
  Created: number;
  Migrated: number;
  Updated: number;
}

export interface MailerLiteSyncResult {
  totalClerkUsers: number;
  attempted: number;
  subscribed: number;
  alreadySubscribed: number;
  skipped: number;
  failed: number;
}

export interface FeedbackBroadcastStatus {
  quarter: string;
  eligible: number;
  alreadySent: number;
  dryRun: boolean;
}

export interface FeedbackBroadcastResult {
  quarter: string;
  eligible: number;
  sent: number;
  failed: number;
  dryRun: boolean;
}

export type AnalyticsGranularity = 'daily' | 'weekly' | 'monthly';

export interface TimeSeriesPoint {
  period: string;
  count: number;
}

export interface StickinessSeriesPoint {
  day: string;
  dau: number;
  mau: number;
  /** DAU/MAU; 0 when MAU is 0. */
  stickiness: number;
}

export interface CohortRetentionCell {
  cohort: string;
  day_n: number;
  active: number;
  cohort_size: number;
  /** active / cohort_size in [0, 1]. */
  retention: number;
}

export interface CohortMeta {
  cohort: string;
  size: number;
}

export interface CohortRetentionMatrix {
  cells: CohortRetentionCell[];
  cohorts: CohortMeta[];
  max_day_n: number;
}

export interface StickinessAnalytics {
  from: string;
  to: string;
  cohort_granularity: AnalyticsGranularity;
  current: StickinessSeriesPoint;
  series: StickinessSeriesPoint[];
  cohorts: CohortRetentionMatrix;
}
