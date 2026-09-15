import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { RadioGroup, RadioGroupItem } from '@shared/ui/radio-group';
import { Label } from '@shared/ui/label';
import { Textarea } from '@shared/ui/textarea';
import {
  CANCEL_REASON_OPTIONS,
  type CancelReasonValue,
} from '@pages/settings/subscription/subscription.constants';
import type { SubscriptionViewModel } from '@pages/settings/subscription/useSubscriptionViewModel';

interface CancelDialogProps {
  vm: SubscriptionViewModel;
}

export const CancelDialog = React.memo(function CancelDialog({ vm }: CancelDialogProps) {
  const { t } = useLingui();

  const {
    showCancelDialog,
    cancelReason,
    setCancelReason,
    cancelReasonNotes,
    setCancelReasonNotes,
    isCancelConfirmDisabled,
    handleCancelDialogOpenChange,
    handleCancelSubscription,
    cancelMutation,
  } = vm;

  return (
    <Dialog open={showCancelDialog} onOpenChange={handleCancelDialogOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans>Cancel Subscription</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Are you sure you want to cancel your subscription? You'll continue to have access
              until the end of your current billing period.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Trans>Let us know why you are canceling so we can make Budgero better.</Trans>
          </p>
          <RadioGroup
            value={cancelReason ?? undefined}
            onValueChange={(value) => {
              setCancelReason(value as CancelReasonValue);
            }}
            className="space-y-3"
          >
            {CANCEL_REASON_OPTIONS.map((option) => {
              const id = `cancel-reason-${option.value}`;
              const isOther = option.value === 'other';
              const isSelected = cancelReason === option.value;

              return (
                <div
                  key={option.value}
                  className={`rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={id} />
                    <Label htmlFor={id} className="font-medium text-sm">
                      {t(option.label)}
                    </Label>
                  </div>
                  {isSelected && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={cancelReasonNotes}
                        onChange={(event) => setCancelReasonNotes(event.target.value)}
                        placeholder={
                          isOther
                            ? t`Tell us more (required)`
                            : t`Anything else you want to share? (optional)`
                        }
                        rows={3}
                        required={isOther}
                        aria-required={isOther}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isOther
                          ? t`A brief description helps us understand the issue.`
                          : t`Optional notes help our team improve Budgero.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleCancelDialogOpenChange(false)}
            disabled={cancelMutation.isPending}
          >
            <Trans>Keep Subscription</Trans>
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={isCancelConfirmDisabled}
            loading={cancelMutation.isPending}
          >
            <Trans>Cancel Subscription</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
