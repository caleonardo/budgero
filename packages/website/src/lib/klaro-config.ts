/**
 * Klaro consent manager config — marketing site (budgero.app).
 *
 * Mirrors the shape of the app-side config; both set the consent cookie at
 * the apex domain (`.budgero.app`) so once a visitor accepts/rejects on either
 * subdomain, the choice carries over without re-prompting.
 *
 * Default is opt-OUT (`default: false`) per ePrivacy. The banner appears on
 * first visit and stays in localStorage/cookie afterwards.
 */
export function createKlaroConfig(locale: string, translate: (key: string) => string): KlaroConfig {
  return {
    version: 1,
    elementID: 'klaro',
    // storageMethod + cookieDomain are patched at runtime in KlaroProvider so
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
    lang: locale,
    additionalClass: 'budgero-klaro',
    // Bottom-right floating card. No `wide` → not full-width.
    styling: { theme: ['light', 'bottom'] },

    translations: {
      // Klaro merges these on top of its bundled `en` defaults at runtime,
      // overriding the corporate "could we please enable some additional
      // services" boilerplate.
      [locale]: {
        privacyPolicyUrl: locale === 'en' ? '/privacy' : `/${locale}/privacy`,
        consentNotice: {
          title: '',
          description: translate('c_130139122daa'),
          learnMore: translate('c_4226ace14bdc'),
        },
        consentModal: {
          title: translate('c_b361f1f2b5f7'),
          description: translate('c_99ba27c096c4'),
        },
        acceptAll: translate('c_f55ee8623408'),
        acceptSelected: translate('c_035882f1a56b'),
        decline: translate('c_adba25230403'),
        ok: translate('c_f55ee8623408'),
        close: translate('c_7d9eb7acb13e'),
        save: translate('c_1509f561f241'),
        poweredBy: '',
        purposes: {
          analytics: {
            title: translate('c_2f050a07553c'),
            description: translate('c_076083bf80dd'),
          },
        },
        purposeItem: {
          service: translate('c_9df6b026a8c6'),
          services: translate('c_ef1c4b45f2ed'),
        },
        service: {
          purpose: translate('c_d4e8830a71c7'),
          purposes: translate('c_8f654d6f37b2'),
          required: {
            title: translate('c_044ba8a9ae43'),
            description: translate('c_51a1e30f7024'),
          },
          optOut: { title: '(opt-out)', description: '' },
        },
      },
    },

    services: [
      {
        name: 'posthog',
        title: translate('c_7cf1affb3478'),
        description: translate('c_7e837b6f305e'),
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
}

/**
 * Loose Klaro type aliases — Klaro 0.7 ships JS only, no .d.ts files. We type
 * just the surface we use (the manager + the public top-level methods).
 */
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
