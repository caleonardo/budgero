#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

if (!process.env.YNAB_ACCESS_TOKEN?.trim() || !process.env.YNAB_PLAN_ID?.trim()) {
  throw new Error('Set YNAB_ACCESS_TOKEN and YNAB_PLAN_ID before running this verifier');
}

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  'pnpm',
  ['exec', 'vitest', 'run', 'node-tests/ynab-api-live.node.spec.ts', '--reporter=verbose'],
  {
    cwd: join(repositoryRoot, 'packages/core'),
    env: process.env,
    stdio: 'inherit',
  }
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
