import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

// Empty catalog: <Trans> falls back to the English source text, which is what
// existing assertions already expect.
i18n.load('en', {});
i18n.activate('en');

vi.mock('@testing-library/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testing-library/react')>();

  const withI18n =
    (Inner?: React.ComponentType<{ children: ReactNode }>) =>
    ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>{Inner ? <Inner>{children}</Inner> : children}</I18nProvider>
    );

  return {
    ...actual,
    renderHook: (
      callback: Parameters<typeof actual.renderHook>[0],
      options?: Parameters<typeof actual.renderHook>[1]
    ) => actual.renderHook(callback, { ...options, wrapper: withI18n(options?.wrapper) }),
    render: (ui: React.ReactElement, options?: Parameters<typeof actual.render>[1]) =>
      actual.render(ui, { ...options, wrapper: withI18n(options?.wrapper) }),
  };
});
