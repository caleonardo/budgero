import { i18n, type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
/**
 * Klaro consent manager config — app (my.budgero.app).
 *
 * Mirrors the marketing-site config so consent travels across subdomains
 * via the apex `.budgero.app` cookie. Self-host builds skip Klaro entirely
 * (see KlaroProvider) — there's no third-party tracking to gate.
 */

export const klaroConfig: KlaroConfig = {
  version: 1,
  elementID: 'klaro',
  // storageMethod + cookieDomain are patched at runtime in setupKlaro so
  // localhost / preview deploys fall back to localStorage (browsers drop
  // cookies whose Domain attribute isn't an ancestor of the current host).
  storageMethod: 'localStorage',
  storageName: 'klaro',
  cookieExpiresAfterDays: 365,
  htmlTexts: true,
  embedded: false,
  groupByPurpose: true,
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  noticeAsModal: false,
  disablePoweredBy: true,
  lang: 'en',
  additionalClass: 'budgero-klaro',
  styling: { theme: ['light', 'bottom'] },

  translations: {
    en: {
      privacyPolicyUrl: 'https://budgero.app/privacy',
      consentNotice: {
        title: '',
        description: msg`We use a couple of cookies for product analytics and ad attribution. Your encrypted budget data is never tracked. Up to you whether to allow these.`,
        learnMore: msg`Choose what to allow`,
      },
      consentModal: {
        title: msg`Cookies on Budgero`,
        description: msg`Pick which cookies are OK with you. Your encrypted budget data is never tracked either way. You can change this any time from Settings → Security.`,
      },
      acceptAll: msg`Accept all`,
      acceptSelected: msg`Save choices`,
      decline: msg`Reject all`,
      ok: msg`Accept all`,
      close: msg`Close`,
      save: msg`Save`,
      poweredBy: '',
      purposes: {
        analytics: {
          title: msg`Product analytics`,
          description: msg`Which features get used. No personal or financial data.`,
        },
      },
      purposeItem: { service: msg`service`, services: msg`services` },
      service: {
        purpose: msg`Purpose`,
        purposes: msg`Purposes`,
        required: { title: msg`Always on`, description: msg`Required, no consent needed.` },
        optOut: { title: '(opt-out)', description: '' },
      },
    },
  },

  services: [
    {
      name: 'posthog',
      title: msg`PostHog (EU)`,
      description: msg`Self-hosted-friendly product analytics. Tracks event names and page views, never amounts or personal data.`,
      purposes: ['analytics'],
      cookies: [
        [/^ph_/, '/', '.budgero.app'],
        [/^_posthog$/, '/', '.budgero.app'],
      ],
      required: false,
      optOut: false,
      onlyOnce: true,
    },
  ],
};

export interface KlaroManager {
  getConsent(name: string): boolean;
  updateConsent(name: string, value: boolean): boolean;
  saveAndApplyConsents(eventType?: string): void;
  applyConsents(): void;
  watch(watcher: KlaroWatcher): void;
  unwatch(watcher: KlaroWatcher): void;
  consents: Record<string, boolean>;
  confirmed: boolean;
}

export interface KlaroWatcher {
  update(manager: KlaroManager, name: string, data: unknown): void;
}

export interface KlaroApi {
  setup(config: KlaroConfig): void;
  getManager(): KlaroManager;
  show(config?: KlaroConfig | undefined, modal?: boolean): boolean;
  render(config?: KlaroConfig | undefined, show?: boolean): boolean;
}

/** Loose Klaro config type — Klaro itself ships no .d.ts. */
export interface KlaroConfig {
  version?: number;
  elementID?: string;
  storageMethod?: 'cookie' | 'localStorage';
  storageName?: string;
  cookieDomain?: string;
  cookieExpiresAfterDays?: number;
  htmlTexts?: boolean;
  embedded?: boolean;
  groupByPurpose?: boolean;
  default?: boolean;
  mustConsent?: boolean;
  acceptAll?: boolean;
  hideDeclineAll?: boolean;
  hideLearnMore?: boolean;
  noticeAsModal?: boolean;
  disablePoweredBy?: boolean;
  lang?: string;
  additionalClass?: string;
  styling?: { theme?: string[] };
  translations?: Record<string, unknown>;
  services?: unknown[];
}

const sourceTranslations = klaroConfig.translations;
const sourceServices = klaroConfig.services;

function translateConsent(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if ('id' in value && typeof value.id === 'string') return i18n._(value as MessageDescriptor);
  if (Array.isArray(value)) return value.map(translateConsent);
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, translateConsent(child)])
  );
}

/** Refresh display copy without changing the consent manager or stored choices. */
export function refreshKlaroLocale(): void {
  const locale = i18n.locale || 'en';
  klaroConfig.lang = locale;
  klaroConfig.translations = { [locale]: translateConsent(sourceTranslations?.en) };
  klaroConfig.services = sourceServices?.map((service) => {
    const item = service as Record<string, unknown>;
    return {
      ...item,
      title: translateConsent(item.title),
      description: translateConsent(item.description),
    };
  });
}
