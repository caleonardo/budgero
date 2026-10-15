import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSchedulingGuideStore } from '@shared/store/useSchedulingGuideStore';
import { formatPeriodLabel } from '../account-page.utils';

/**
 * Register date-range wiring shared by AccountPage and AllTransactionsPage:
 * range state defaulting to the last 180 days, a change handler that closes
 * both pickers once a complete range is picked, the mobile/desktop picker
 * open-state pair, and the human-readable period label.
 */
export function useAccountDateRange() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = endOfDay(new Date());
    const start = startOfDay(subDays(today, 180));
    const showUpcoming = useSchedulingGuideStore.getState().showUpcomingRequested;
    return { from: start, to: showUpcoming ? endOfDay(addDays(today, 30)) : today };
  });
  // "Show the next 30 days" from the scheduling guide keeps the start and
  // extends the end; a request made before this register mounted applies above.
  useEffect(() => {
    const guide = useSchedulingGuideStore.getState();
    if (guide.showUpcomingRequested) guide.consumeShowUpcoming();
    return useSchedulingGuideStore.subscribe((state) => {
      if (!state.showUpcomingRequested) return;
      state.consumeShowUpcoming();
      setDateRange((prev) => ({
        from: prev?.from ?? startOfDay(new Date()),
        to: endOfDay(addDays(new Date(), 30)),
      }));
    });
  }, []);
  const [isMobileDatePickerOpen, setIsMobileDatePickerOpen] = useState(false);
  const [isDesktopDatePickerOpen, setIsDesktopDatePickerOpen] = useState(false);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setIsMobileDatePickerOpen(false);
      setIsDesktopDatePickerOpen(false);
    }
  }, []);

  const periodLabel = useMemo(() => formatPeriodLabel(dateRange), [dateRange]);

  return {
    dateRange,
    handleDateRangeChange,
    periodLabel,
    isMobileDatePickerOpen,
    setIsMobileDatePickerOpen,
    isDesktopDatePickerOpen,
    setIsDesktopDatePickerOpen,
  };
}
