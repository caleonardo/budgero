import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { assertReleaseTag } from './release-common.mjs';
import { releaseNotes } from './release-notes.mjs';

test('publication requires an existing matching tag and never moves it', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budgero-release-'));
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  try {
    git('init');
    git('config', 'user.name', 'Release test');
    git('config', 'user.email', 'test@example.invalid');
    git('commit', '--allow-empty', '-m', 'first');
    assert.throws(() => assertReleaseTag('v1.0.0', dir));
    git('tag', 'v1.0.0');
    assertReleaseTag('v1.0.0', dir);
    const original = git('rev-parse', 'v1.0.0');
    git('commit', '--allow-empty', '-m', 'second');
    assert.throws(() => assertReleaseTag('v1.0.0', dir), /must already point/);
    assert.equal(git('rev-parse', 'v1.0.0'), original);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test('notes use the requested curated entry and exclude unreleased plans', () => {
  const entries = [
    {
      version: 'v1.0.0',
      summary: 'Shipped summary',
      items: [
        { type: 'fixed', title: 'Correction', description: 'Shipped fix' },
        { type: 'coming-soon', title: 'Future plan', description: 'Not shipped' },
      ],
      acknowledgements: [
        { githubUsername: 'contributor', pullRequest: 7, contribution: 'Picker improvements' },
      ],
    },
  ];
  const notes = releaseNotes('v1.0.0', entries);
  assert.match(notes, /Shipped fix/);
  assert.match(notes, /@contributor/);
  assert.doesNotMatch(notes, /Future plan|Not shipped/);
  assert.throws(() => releaseNotes('v2.0.0', entries), /exactly one/);
  assert.throws(() => releaseNotes('v1.0.0', [...entries, ...entries]), /exactly one/);
});
