#!/usr/bin/env node
/**
 * Vite resolves vite.config.js before vite.config.ts. A stale generated .js
 * therefore shadows the real config silently — the build still succeeds, but
 * plugins added to the .ts (the Lingui macro transform, React Compiler) never
 * run, and the failure only shows up as a runtime error in the browser.
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const shadow = join(APP, 'vite.config.js');

if (existsSync(shadow)) {
  console.error(
    'vite.config.js exists and shadows vite.config.ts.\n' +
      'Vite loads the .js first, so plugins configured in the .ts are ignored —\n' +
      'including the Lingui macro transform, which fails only at runtime.\n\n' +
      'It is gitignored and generated. Delete it:\n' +
      '  rm packages/app/vite.config.js\n'
  );
  process.exit(1);
}
