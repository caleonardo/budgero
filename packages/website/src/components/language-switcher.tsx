'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeFlags, localeNames, routing, type Locale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={t('aria_language')}
      value={locale}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as Locale;
        startTransition(() => router.replace(pathname, { locale: next }));
      }}
      className="h-8 rounded-md border border-border/60 bg-transparent px-2 text-xs text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {localeFlags[code]} {localeNames[code]}
        </option>
      ))}
    </select>
  );
}
