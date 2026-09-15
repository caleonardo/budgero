import type { ReactNode } from 'react';
import { WeekStartsOnProvider } from '@shared/contexts/WeekStartsOnContext';
import { useWeekStartsOnPreference } from '@shared/hooks/useUserPreferences';

export function PersistedCalendarPreferencesProvider({ children }: { children: ReactNode }) {
  const { weekStartsOn } = useWeekStartsOnPreference();
  return <WeekStartsOnProvider value={weekStartsOn}>{children}</WeekStartsOnProvider>;
}
