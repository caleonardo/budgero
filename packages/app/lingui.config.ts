import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'de', 'fr', 'es', 'nl'],
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
      exclude: ['**/node_modules/**', '**/*.test.*', '**/test/**', '**/*.generated.*'],
    },
  ],
  format: formatter({ lineNumbers: false }),
  compileNamespace: 'es',
});
