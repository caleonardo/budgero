import { Trans } from '@lingui/react/macro';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSchedulingGuideStore } from '@shared/store/useSchedulingGuideStore';
import { Button } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';

/**
 * Explains, once per budget, where future-dated and recurring transactions
 * show up: registers follow the date range, and its presets end today.
 */
export function SchedulingGuideDialog() {
  const pending = useSchedulingGuideStore((state) => state.pending);
  const dismiss = useSchedulingGuideStore((state) => state.dismiss);
  const requestShowUpcoming = useSchedulingGuideStore((state) => state.requestShowUpcoming);
  const location = useLocation();
  const navigate = useNavigate();

  const accountId = useSchedulingGuideStore((state) => state.accountId);

  const showUpcoming = () => {
    requestShowUpcoming();
    // Projected recurring rows only render on account registers.
    const target = accountId ? `/accounts/${accountId}` : '/accounts/all';
    if (location.pathname !== target) void navigate(target);
  };

  return (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="sm:max-w-md">
        {pending === 'recurring' ? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <Trans>Where your recurring transactions show up</Trans>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <Trans>
                    Nothing is posted automatically. Each upcoming occurrence appears in the account
                    register once the date range at the top reaches its due date. Pick{' '}
                    <strong>Next 30 days</strong> or <strong>Next 3 months</strong> there to see
                    them.
                  </Trans>
                </p>
                <p>
                  <Trans>
                    From the register you can <strong>Mark ready</strong> (posts on the due date),{' '}
                    <strong>Post now</strong> (posts today) or <strong>Skip</strong>. The
                    dashboard’s Upcoming transactions card and Settings → Recurring Transactions
                    list them too.
                  </Trans>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <Trans>Your transaction is dated in the future</Trans>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <Trans>
                    Registers show the date range at the top of the page, and the usual presets end
                    today, so future transactions are out of view. Pick{' '}
                    <strong>Next 30 days</strong> or <strong>Next 3 months</strong> in the date
                    range to see them.
                  </Trans>
                </p>
                <p>
                  <Trans>
                    They don’t count toward today’s balance until their date, and the dashboard’s
                    Upcoming transactions card lists them as Scheduled.
                  </Trans>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={showUpcoming}>
            <Trans>Show the next 30 days</Trans>
          </Button>
          <Button onClick={dismiss}>
            <Trans>Got it</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
