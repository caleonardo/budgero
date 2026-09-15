import { format as dateFnsFormat, formatDistanceToNow as dateFnsDistance } from 'date-fns';
import { getDateLocale, getLocaleTag } from '@shared/i18n';

/**
 * Patterns whose English field order would be wrong in other languages.
 * Routed through Intl so each locale decides its own order — German wants
 * "15. Aug. 2026", not the "Aug. 15, 2026" that a token pattern would force.
 */
const ORDERED: Record<string, Intl.DateTimeFormatOptions> = {
  'MMM d, yyyy': { month: 'short', day: 'numeric', year: 'numeric' },
  'MMM dd, yyyy': { month: 'short', day: 'numeric', year: 'numeric' },
  'MMMM d, yyyy': { month: 'long', day: 'numeric', year: 'numeric' },
  'MMMM dd, yyyy': { month: 'long', day: 'numeric', year: 'numeric' },
  'MMM d': { month: 'short', day: 'numeric' },
  'MMMM d': { month: 'long', day: 'numeric' },
  'MMM yyyy': { month: 'short', year: 'numeric' },
  'MMMM yyyy': { month: 'long', year: 'numeric' },
  'EEE, MMM d': { weekday: 'short', month: 'short', day: 'numeric' },
  'EEE, MMM d, yyyy': { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
  'EEEE, MMM d, yyyy': { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' },
};

/** Machine-readable formats — must stay stable regardless of language. */
const MACHINE = new Set(['yyyy-MM-dd', 'yyyy-MM', 'yyyy', 'yy', 'd', 'HH:mm', 'HH:mm:ss']);

export function formatDate(date: Date | number, pattern: string): string {
  if (MACHINE.has(pattern)) return dateFnsFormat(date, pattern);

  const intlOptions = ORDERED[pattern];
  if (intlOptions) {
    return new Intl.DateTimeFormat(getLocaleTag(), intlOptions).format(date);
  }

  return dateFnsFormat(date, pattern, { locale: getDateLocale() });
}

export function formatRelativeToNow(
  date: Date | number,
  options?: { addSuffix?: boolean }
): string {
  return dateFnsDistance(date, { ...options, locale: getDateLocale() });
}
