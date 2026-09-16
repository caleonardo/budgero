import { existsSync } from 'node:fs';
import path from 'node:path';
import { act, cleanup, render, screen } from '@testing-library/react';
import { activateLocale, type SupportedLocale } from '@shared/i18n';
import { StepHeroImage } from './steps/shared';
import { getOnboardingImage } from './onboarding-images';
import { RulesStep } from './steps/RulesStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { INITIAL_STATE, ONBOARDING_STEPS } from './onboarding-data';

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

it('switches displayed artwork immediately when the app language changes', async () => {
  render(<StepHeroImage src="/onboarding-accounts.png" alt="Accounts illustration" />);
  const image = screen.getByRole('img');
  for (const locale of ['de', 'fr', 'es', 'nl', 'en'] as SupportedLocale[]) {
    await act(() => activateLocale(locale, false));
    expect(image).toHaveAttribute(
      'src',
      locale === 'en' ? '/onboarding-accounts.png' : `/onboarding/${locale}/accounts.png`
    );
  }
});

it('ships every localized text-bearing illustration and preserves shared artwork', () => {
  for (const locale of ['de', 'fr', 'es', 'nl']) {
    for (const name of [
      'welcome',
      'rules-hero',
      'workspace',
      'accounts',
      'share',
      'password',
      'final',
    ]) {
      const src = getOnboardingImage(`/onboarding-${name}.png`, locale);
      expect(src).toBe(`/onboarding/${locale}/${name}.png`);
      expect(existsSync(path.join(process.cwd(), 'public', src))).toBe(true);
    }
    expect(getOnboardingImage('/onboarding-goals.png', locale)).toBe('/onboarding-goals.png');
  }
  expect(getOnboardingImage('/onboarding-welcome.png', 'de-DE')).toBe('/onboarding/de/welcome.png');
  expect(getOnboardingImage('/onboarding-welcome.png', 'unknown')).toBe('/onboarding-welcome.png');
});

it('localizes standalone welcome and rules images along with the rule descriptions', async () => {
  await activateLocale('de', false);
  const props = { state: INITIAL_STATE, cur: ONBOARDING_STEPS[0], set: vi.fn() };
  const { container } = render(
    <>
      <WelcomeStep {...props} />
      <RulesStep {...props} />
    </>
  );
  expect(container.querySelector('img[src="/onboarding/de/welcome.png"]')).not.toBeNull();
  expect(container.querySelector('img[src="/onboarding/de/rules-hero.png"]')).not.toBeNull();
  expect(screen.getByText(/^Keine Prognosen, keine Kreditlimits\./)).toBeInTheDocument();
  expect(screen.getByText(/^Miete, Lebensmittel, deine Zukunft\./)).toBeInTheDocument();
  expect(screen.getByText(/^Transaktionen werden von Hand eingegeben/)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Geldbörse mit Bargeld' })).toBeInTheDocument();
  await act(() => activateLocale('en', false));
  expect(container.querySelector('img[src="/onboarding-welcome.png"]')).not.toBeNull();
  expect(container.querySelector('img[src="/onboarding-rules-hero.png"]')).not.toBeNull();
});
