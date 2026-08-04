import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Separator } from '@shared/ui/separator';
import { CreditCard, ExternalLink } from 'lucide-react';
import type { SubscriptionViewModel } from '@pages/settings/subscription/useSubscriptionViewModel';

interface PlanSelectionProps {
  vm: SubscriptionViewModel;
}

export const PlanSelection = React.memo(function PlanSelection({ vm }: PlanSelectionProps) {
  const {
    plans,
    billingPortalAvailable,
    canStartSubscription,
    handleManageSubscription,
    portalMutation,
    handleStartSubscription,
    checkoutMutation,
  } = vm;

  const orderedPlans = [...plans].sort((a, b) => {
    if (a.interval === 'year' && b.interval !== 'year') return -1;
    if (a.interval !== 'year' && b.interval === 'year') return 1;
    return a.price - b.price;
  });
  const monthlyPlan = plans.find((plan) => plan.interval === 'month');

  if (!canStartSubscription && !billingPortalAvailable) {
    return null;
  }

  return (
    <div className="space-y-6">
      {canStartSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Choose a Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plans are not available right now. Please try again in a moment.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {orderedPlans.map((plan) => {
                  const isYearly = plan.interval === 'year';
                  const monthsCovered =
                    plan.interval === 'year'
                      ? 12 * Math.max(plan.interval_count || 1, 1)
                      : plan.interval === 'month'
                        ? Math.max(plan.interval_count || 1, 1)
                        : null;
                  const monthlyEquivalent =
                    monthsCovered && monthsCovered > 0 ? plan.price / 100 / monthsCovered : null;
                  const yearlyMonthlyEquivalent = isYearly
                    ? (monthlyEquivalent?.toFixed(2) ?? null)
                    : null;
                  const yearlySavingsPercent =
                    isYearly && monthlyPlan
                      ? Math.max(0, Math.round((1 - plan.price / (monthlyPlan.price * 12)) * 100))
                      : null;
                  return (
                    <div
                      key={plan.id}
                      className={`flex h-full flex-col rounded-[1.6rem] border p-5 shadow-sm transition-colors ${
                        isYearly
                          ? 'border-amber-300 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_50%),linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,247,237,0.85))]'
                          : 'border-border/80 bg-card/90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold leading-none text-foreground">
                          {isYearly ? 'Yearly' : 'Monthly'}
                        </h3>
                      </div>

                      <div className="mt-4 flex items-baseline gap-2">
                        <p className="text-4xl font-semibold tracking-tight text-foreground">
                          {plan.price_formatted}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isYearly ? '/year' : '/month'}
                        </p>
                      </div>

                      {isYearly && yearlyMonthlyEquivalent && (
                        <p className="mt-1 text-sm font-medium text-amber-900">
                          ${yearlyMonthlyEquivalent}/month
                          {yearlySavingsPercent && yearlySavingsPercent > 0 ? (
                            <span className="text-amber-900/70">
                              {' '}
                              · save {yearlySavingsPercent}% vs. monthly
                            </span>
                          ) : null}
                        </p>
                      )}

                      <div className="mt-6 flex-1" />

                      <Button
                        className={`w-full ${
                          isYearly
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                        disabled={checkoutMutation.isPending}
                        loading={checkoutMutation.isPending}
                        onClick={() => handleStartSubscription(plan.id)}
                      >
                        {checkoutMutation.isPending
                          ? 'Opening checkout...'
                          : isYearly
                            ? 'Start yearly plan'
                            : 'Start monthly plan'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {billingPortalAvailable ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Management
            </CardTitle>
            <CardDescription>
              Update payment methods, download invoices, or manage billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Payment methods, invoice downloads, and billing info updates are handled in your Lemon
              Squeezy customer portal. Click below to generate a secure, pre-signed session.
              <Button
                onClick={handleManageSubscription}
                disabled={portalMutation.isPending}
                loading={portalMutation.isPending}
                variant="outline"
                className="mt-2 flex items-center gap-2"
              >
                {portalMutation.isPending ? (
                  'Preparing portal...'
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Open Lemon Squeezy portal
                  </>
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">
                In the billing portal, you can:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Update payment methods and billing information</li>
                <li>Download invoices and payment history</li>
                <li>Update billing address and tax information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
});
