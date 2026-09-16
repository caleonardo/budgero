const LOCALIZED_IMAGES = new Set([
  '/onboarding-welcome.png',
  '/onboarding-rules-hero.png',
  '/onboarding-workspace.png',
  '/onboarding-accounts.png',
  '/onboarding-share.png',
  '/onboarding-password.png',
  '/onboarding-final.png',
]);

/** Text-free illustrations are shared; text-bearing artwork follows the UI language. */
export function getOnboardingImage(src: string, locale: string): string {
  const language = locale.toLowerCase().split(/[-_]/)[0];
  if (!['de', 'fr', 'es', 'nl'].includes(language) || !LOCALIZED_IMAGES.has(src)) return src;
  return `/onboarding/${language}/${src.slice('/onboarding-'.length)}`;
}
