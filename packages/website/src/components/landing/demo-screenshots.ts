import { locales, type Locale } from '@/i18n/routing';

type DemoScreenshot =
  | 'budget-desktop'
  | 'budget-mobile'
  | 'report-money-map'
  | 'report-spending'
  | 'report-wealth'
  | 'report-scenario';

/** Real app captures use the same locale as the surrounding homepage. */
export function demoScreenshot(locale: string, screen: DemoScreenshot): string {
  const supportedLocale = locales.includes(locale as Locale) ? locale : 'en';
  return `/screenshots/${supportedLocale}/${screen}.png`;
}
