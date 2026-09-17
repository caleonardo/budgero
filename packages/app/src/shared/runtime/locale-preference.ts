const LOCALE_KEY = 'budgero_locale_v1';

export const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'nl'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  nl: 'Nederlands',
};

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  nl: '🇳🇱',
};

function isSupported(value: string | null | undefined): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getStoredLocale(): SupportedLocale | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const value = localStorage.getItem(LOCALE_KEY);
    return isSupported(value) ? value : null;
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: SupportedLocale | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (!locale) {
      localStorage.removeItem(LOCALE_KEY);
    } else {
      localStorage.setItem(LOCALE_KEY, locale);
    }
  } catch {
    /* no-op: intentionally ignored */
  }
}

function detectBrowserLocale(): SupportedLocale | null {
  try {
    if (typeof navigator === 'undefined') return null;
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const base = candidate?.split('-')[0]?.toLowerCase();
      if (isSupported(base)) return base;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveInitialLocale(): SupportedLocale {
  return getStoredLocale() ?? detectBrowserLocale() ?? DEFAULT_LOCALE;
}
