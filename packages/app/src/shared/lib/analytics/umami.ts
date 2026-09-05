/**
 * Anonymous Cloud funnel events, sent through the same Umami proxy and website
 * ID as the marketing site. No device storage, user IDs, or financial data.
 * Signup URLs contain only the finite, public homepage campaign values below;
 * never forward an auth URL, OAuth parameter, invite token, or referrer verbatim.
 *
 * Umami owns session grouping. In v2.19 it hashes website, IP, user agent and a
 * rotating salt. Sharing the endpoint preserves the client IP seen by Umami,
 * but a changed network, browser, or salt can still split a journey. Validate
 * the deployed version's funnel after release; events are not exact people.
 */
import { IS_SELF_HOSTABLE_BUILD } from '@shared/lib/env';

const UMAMI_ENDPOINT = 'https://budgero.app/stats/api/send';
const UMAMI_WEBSITE_ID = '76a1a09b-2dbc-4291-9c0b-d3f4e9eb2caa';
const HOMEPAGE_PLACEMENTS = new Set([
  'header',
  'hero',
  'sharing',
  'pricing',
  'final',
  'mobile-sticky',
]);

function signupEventUrl(search: string): string {
  const incoming = new URLSearchParams(search);
  const safe = new URLSearchParams({ mode: 'signup' });
  if (
    incoming.get('utm_source') === 'website' &&
    incoming.get('utm_medium') === 'cta' &&
    incoming.get('utm_campaign') === 'home' &&
    HOMEPAGE_PLACEMENTS.has(incoming.get('utm_content') ?? '')
  ) {
    safe.set('utm_source', 'website');
    safe.set('utm_medium', 'cta');
    safe.set('utm_campaign', 'home');
    safe.set('utm_content', incoming.get('utm_content')!);
    if (incoming.get('landing_variant') === 'trial-focused-v1') {
      safe.set('landing_variant', 'trial-focused-v1');
    }
  }
  return `/auth?${safe}`;
}

function sendFunnelEvent(name: 'Signup Viewed' | 'Trial Started', url: string): void {
  // Keep both checks: one supports static elimination, one runtime self-host.
  if (import.meta.env.VITE_SELF_HOSTABLE === 'true') return;
  if (IS_SELF_HOSTABLE_BUILD || typeof window === 'undefined') return;
  if (window.location.hostname !== 'my.budgero.app') return;

  try {
    void fetch(UMAMI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: UMAMI_WEBSITE_ID,
          hostname: window.location.hostname,
          url,
          name,
          language: navigator.language,
          screen: `${window.screen.width}x${window.screen.height}`,
        },
      }),
    }).catch(() => {
      /* Analytics must never interrupt authentication. */
    });
  } catch {
    /* Fetch unavailable — ignore. */
  }
}

export function sendSignupViewedToUmami(search: string): void {
  sendFunnelEvent('Signup Viewed', signupEventUrl(search));
}

/** New backend account observed at startup; not first-budget activation. */
export function sendTrialStartedToUmami(): void {
  sendFunnelEvent('Trial Started', '/trial-started');
}
