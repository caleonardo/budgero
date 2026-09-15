'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { localeFlags, localeNames, routing } from '@/i18n/routing';
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

function useLocaleNavigation() {
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const changeLocale = (next: string) => {
    if (!routing.locales.some((value) => value === next) || next === locale) return;
    setPending(true);
    // A document navigation preserves fragments through locale redirects.
    // Prefix English explicitly so middleware updates the locale cookie before
    // redirecting to its canonical, unprefixed URL.
    const path = pathname === '/' ? '' : pathname;
    window.location.replace(`/${next}${path}${window.location.search}${window.location.hash}`);
  };
  return { locale, pending, changeLocale };
}

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const { locale, pending, changeLocale } = useLocaleNavigation();

  return (
    <select
      aria-label={t('aria_language')}
      value={locale}
      disabled={pending}
      onChange={(event) => changeLocale(event.target.value)}
      className="h-10 rounded-md border border-border/60 bg-transparent px-3 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {localeFlags[code]} {localeNames[code]}
        </option>
      ))}
    </select>
  );
}

/** Keyboard-accessible language choices for the compact site navigation. */
export function LanguageMenu() {
  const t = useTranslations('common');
  const { locale, pending, changeLocale } = useLocaleNavigation();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t('aria_language')}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={locale} onValueChange={changeLocale}>
          {routing.locales.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} disabled={pending}>
              {localeFlags[code]} {localeNames[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
