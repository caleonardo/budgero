import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { changedPaths, planChanges, planEvent } from './changes.mjs';

const none = { app: false, website: false, server: false };
const all = { app: true, website: true, server: true };

for (const [name, paths, expected] of [
  ['published docs', ['packages/website/content/docs/push-api.mdx', 'packages/website/content/docs/de/push-api.mdx'], { ...none, website: true }],
  ['website code and audit', ['packages/website/src/app/page.tsx', 'scripts/i18n/audit-website.mjs'], { ...none, website: true }],
  ['app and shared libraries', ['packages/app/src/app.ts', 'packages/core/src/index.ts', 'packages/runtime/src/index.ts', 'packages/eslint-config/index.js'], { ...none, app: true }],
  ['app catalogs', ['scripts/i18n/check-catalogs.mjs', 'packages/app/src/locales/de/messages.po'], { ...none, app: true }],
  ['Go server', ['packages/server/internal/application/push.go', 'packages/server/go.sum'], { ...none, server: true }],
  ['server build script consumed by app build', ['packages/server/package.json'], { ...none, app: true, server: true }],
  ['mixed changes', ['packages/server/go.mod', 'packages/website/package.json'], { ...none, server: true, website: true }],
  ['repository prose', ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'docs/development.md', '.github/ISSUE_TEMPLATE/bug_report.yml'], none],
  ['workflow changes', ['.github/workflows/ci.yml'], all],
  ['classifier changes', ['scripts/ci/changes.mjs'], all],
  ['shared lockfile', ['pnpm-lock.yaml'], all],
  ['workspace manifest', ['pnpm-workspace.yaml'], all],
  ['dependency patches', ['packages/website/patches/@contentlayer2__utils@0.5.8.patch'], all],
  ['unknown consumer', ['new-package/build.sh'], all],
  ['empty diff', [], none],
]) {
  test(name, () => assert.deepEqual(planChanges(paths), expected));
}

test('real git ranges include every PR commit, deletions, and both sides of renames', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'budgero-ci-test-'));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  const commit = () => {
    git('add', '-A');
    git('-c', 'user.name=CI Test', '-c', 'user.email=ci@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture');
    return git('rev-parse', 'HEAD');
  };
  try {
    git('init', '-q');
    mkdirSync(join(cwd, 'packages/app'), { recursive: true });
    writeFileSync(join(cwd, 'packages/app/old.ts'), 'export const old = 1;\n');
    const base = commit();
    mkdirSync(join(cwd, 'packages/website'), { recursive: true });
    git('mv', 'packages/app/old.ts', 'packages/website/new.ts');
    commit();
    mkdirSync(join(cwd, 'packages/server'), { recursive: true });
    writeFileSync(join(cwd, 'packages/server/new.go'), 'package server\n');
    const head = commit();
    const expected = ['packages/app/old.ts', 'packages/server/new.go', 'packages/website/new.ts'];
    assert.deepEqual(changedPaths(base, head, true, cwd), expected);
    assert.deepEqual(changedPaths(base, head, false, cwd), expected);
    assert.deepEqual(planEvent({ pull_request: { base: { sha: base }, head: { sha: head } } }, cwd), all);
    assert.deepEqual(planEvent({ before: base, after: head }, cwd), all);
    assert.deepEqual(planEvent({ before: '0'.repeat(40), after: head }, cwd), all);
    assert.deepEqual(planEvent({ before: 'a'.repeat(40), after: head }, cwd), all);
    assert.deepEqual(planEvent({}, cwd), all);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});


test('actual required gate scripts reject failed, cancelled, and unexpectedly skipped builds', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  for (const name of ['web', 'server']) {
    const job = workflow.split(`\n  ${name}:\n`)[1].split(/\n  [a-z-]+:\n/)[0];
    const script = job.split('        run: |\n')[1].split('\n').map((line) => line.replace(/^          /, '')).join('\n');
    for (const changes of ['success', 'failure', 'cancelled', 'skipped']) {
      for (const checks of ['success', 'failure', 'cancelled', 'skipped']) {
        for (const selected of ['true', 'false']) {
          const result = spawnSync('bash', ['-e', '-c', script], {
            env: { ...process.env, CHANGES_RESULT: changes, CHECKS_RESULT: checks, SELECTED: selected },
          });
          const shouldPass = changes === 'success' && checks === (selected === 'true' ? 'success' : 'skipped');
          assert.equal(result.status === 0, shouldPass, `${name}: changes=${changes}, checks=${checks}, selected=${selected}`);
        }
      }
    }
  }
});
