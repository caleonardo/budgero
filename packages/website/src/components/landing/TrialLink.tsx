'use client';

import type { ComponentProps } from 'react';
import { track } from '@/lib/analytics';

type Placement = 'header' | 'hero' | 'reports' | 'sharing' | 'pricing' | 'final' | 'mobile-sticky';
export const HOMEPAGE_VARIANT = 'trial-focused-v1';

export function TrialLink({
  placement,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href' | 'onClick'> & { placement: Placement }) {
  const query = new URLSearchParams({
    mode: 'signup',
    utm_source: 'website',
    utm_medium: 'cta',
    utm_campaign: 'home',
    utm_content: placement,
    landing_variant: HOMEPAGE_VARIANT,
  });

  return (
    <a
      {...props}
      href={`https://my.budgero.app/auth?${query}`}
      onClick={() => {
        const data = { placement, page: 'home', path: '/', variant: HOMEPAGE_VARIANT };
        track('Trial CTA Clicked', data);
        // Preserve existing event names for comparisons with earlier periods.
        track(placement === 'header' ? 'Cloud Trial - Header' : 'CTA Clicked - Cloud', data);
      }}
    >
      {children}
    </a>
  );
}
