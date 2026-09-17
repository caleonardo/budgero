'use client';

import { useTranslations } from 'next-intl';
import { useKlaro } from '@/components/KlaroProvider';

/** Footer link that re-opens the Klaro consent modal. */
export function ManageCookiesButton({ className }: { className?: string }) {
  const { show } = useKlaro();
  const t = useTranslations('common');
  return (
    <button type="button" onClick={show} className={className}>
      {t('manage_cookies')}
    </button>
  );
}
