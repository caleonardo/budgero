import { Trans } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Alert, AlertDescription } from '@shared/ui/alert';
import { Label } from '@shared/ui/label';
import { Switch } from '@shared/ui/switch';
import { BarChart3, ShieldAlert } from 'lucide-react';
import {
  isAnalyticsDisabled,
  enableAnalytics,
  disableAnalytics,
} from '@shared/lib/analytics/analytics';
import { setPostHogConsent, showKlaro } from '@shared/lib/analytics/klaro';
import { useProfile, useSetAnalyticsDisabled } from '@entities/user/api/useAuth';
import { IS_SELF_HOSTABLE_BUILD } from '@shared/lib/env';

/** Self-contained privacy/analytics card: owns its own state, sync effect, and mutation. */
export function PrivacySettingsCard() {
  const { data: profile } = useProfile();
  const setAnalyticsDisabledMutation = useSetAnalyticsDisabled();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => !isAnalyticsDisabled());

  const typedProfile = profile as import('@shared/model/auth').User | undefined;

  // Sync analytics preference from server profile on load. The server value
  // is authoritative for signed-in users (new accounts are created with
  // analytics DISABLED — opt-in). Mirror into Klaro too, otherwise a
  // pre-seeded "rejected" consent could flip a server-enabled user back off.
  useEffect(() => {
    if (!IS_SELF_HOSTABLE_BUILD && typedProfile?.is_analytics_disabled !== undefined) {
      const serverDisabled = typedProfile.is_analytics_disabled;
      // eslint-disable-next-line react-compiler/react-compiler
      setAnalyticsEnabled(!serverDisabled);
      // Keep localStorage in sync with server state
      if (serverDisabled) {
        disableAnalytics();
      } else {
        enableAnalytics();
      }
      setPostHogConsent(!serverDisabled);
    }
  }, [typedProfile?.is_analytics_disabled]);

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (enabled) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
    // Mirror into Klaro so the cookie banner doesn't reappear contradicting
    // the user's Settings choice. No-op on self-host (Klaro isn't loaded).
    setPostHogConsent(enabled);
    // Persist to server (SaaS only, fire-and-forget)
    if (!IS_SELF_HOSTABLE_BUILD) {
      setAnalyticsDisabledMutation.mutate({ disabled: !enabled });
    }
  };

  return (
    <Card className={IS_SELF_HOSTABLE_BUILD ? 'opacity-60' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trans>
            <BarChart3 className="h-5 w-5" />
            Privacy Settings
          </Trans>
        </CardTitle>
        <CardDescription>
          {IS_SELF_HOSTABLE_BUILD
            ? 'Analytics is not available in self-hosted builds.'
            : 'Control what anonymous usage data Budgero collects.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {IS_SELF_HOSTABLE_BUILD && (
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              <Trans>
                Usage analytics is disabled and not included in self-hosted builds. No tracking code
                is loaded or executed.
              </Trans>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="analytics-toggle"
              className={`text-sm font-medium ${IS_SELF_HOSTABLE_BUILD ? 'text-muted-foreground' : ''}`}
            >
              <Trans>Usage Analytics</Trans>
            </Label>
            <p className="text-sm text-muted-foreground">
              {IS_SELF_HOSTABLE_BUILD
                ? 'Not available in self-hosted builds.'
                : 'Help improve Budgero by sending anonymous usage events. Off by default — nothing is collected unless you turn this on.'}
            </p>
          </div>
          <Switch
            id="analytics-toggle"
            checked={IS_SELF_HOSTABLE_BUILD ? false : analyticsEnabled}
            onCheckedChange={handleAnalyticsToggle}
            disabled={IS_SELF_HOSTABLE_BUILD}
          />
        </div>

        {!IS_SELF_HOSTABLE_BUILD && (
          <div className="pt-4 border-t border-border/60 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">
                <Trans>What we collect</Trans>
              </h3>
              <p className="text-sm text-muted-foreground">
                <Trans>
                  When enabled, we collect{' '}
                  <strong>
                    <Trans>only the event name</Trans>
                  </strong>
                  with no personal data, account information, or financial details. All analytics
                  are completely anonymous.
                </Trans>
              </p>
            </div>

            <div className="rounded-md border border-border/60 bg-muted/20 p-4">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                <Trans>Events we track</Trans>
              </h4>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Transaction Logged / Edited / Deleted</Trans>
                      </strong>
                      — when you add, modify, or remove a transaction
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Account Added</Trans>
                      </strong>
                      — when you create a new account
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Category Added / Edited / Deleted</Trans>
                      </strong>
                      — when you manage categories
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Category Group Added / Edited / Deleted</Trans>
                      </strong>
                      — when you manage category groups
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Assignment Upserted</Trans>
                      </strong>
                      — when you assign money to a category
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Budget Created</Trans>
                      </strong>
                      — when you create a new budget
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Imported from YNAB / Imported CSV/PDF</Trans>
                      </strong>
                      — when you import data into a budget
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Shared Budget</Trans>
                      </strong>
                      — when you create a workspace invite
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Trial Started</Trans>
                      </strong>
                      — when your free trial begins
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Checkout Started / Purchase</Trans>
                      </strong>
                      — subscription funnel events (plan, price)
                    </Trans>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <Trans>
                      <strong>
                        <Trans>Subscription Canceled</Trans>
                      </strong>
                      — cancellation reason (so we can improve the product)
                    </Trans>
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              <Trans>
                We do not collect transaction amounts, payee names, category names, account
                balances, or any other financial information. Your budget data stays entirely
                private.
              </Trans>
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={showKlaro}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                <Trans>Manage cookies</Trans>
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
