'use client';

import Script from 'next/script';
import { flushUmamiEvents } from '@/lib/analytics';

export function UmamiScript() {
  return (
    <Script
      src="/stats/script.js"
      data-website-id="76a1a09b-2dbc-4291-9c0b-d3f4e9eb2caa"
      data-domains="budgero.app"
      strategy="afterInteractive"
      onReady={flushUmamiEvents}
    />
  );
}
