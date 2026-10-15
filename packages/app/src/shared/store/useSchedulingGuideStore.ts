import { create } from 'zustand';

/** First future-dated transaction, or first recurring transaction, in a budget. */
export type SchedulingGuideKind = 'future' | 'recurring';

interface SchedulingGuideState {
  pending: SchedulingGuideKind | null;
  /** Account the transaction or recurring template belongs to. */
  accountId: number | null;
  /** One-shot request for the next register to extend its range 30 days ahead. */
  showUpcomingRequested: boolean;
  dismiss: () => void;
  requestShowUpcoming: () => void;
  consumeShowUpcoming: () => void;
}

export const useSchedulingGuideStore = create<SchedulingGuideState>()((set) => ({
  pending: null,
  accountId: null,
  showUpcomingRequested: false,
  dismiss: () => set({ pending: null }),
  requestShowUpcoming: () => set({ pending: null, showUpcomingRequested: true }),
  consumeShowUpcoming: () => set({ showUpcomingRequested: false }),
}));

const seenKey = (kind: SchedulingGuideKind, spaceKey: string, budgetId: number) =>
  `budgero:scheduling-guide:${kind}:${spaceKey}:${budgetId}`;

/**
 * Shows the guide for `kind` the first time it happens in a budget. "Seen" is
 * remembered per device in localStorage; without storage the guide is skipped.
 */
export function requestSchedulingGuide(
  kind: SchedulingGuideKind,
  spaceKey: string,
  budgetId: number,
  accountId: number | null = null
): void {
  if (!budgetId) return;
  const key = seenKey(kind, spaceKey, budgetId);
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch {
    return;
  }
  useSchedulingGuideStore.setState({ pending: kind, accountId });
}
