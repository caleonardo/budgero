import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { assertReleaseTag, findLinuxBinary } from './release-common.mjs';
import { releaseNotes } from './release-notes.mjs';

test('Docker staging selects binaries from directories even when archives sort first', () => {
  const dir = mkdtempSync(join(tmpdir(), 'budgero-artifacts-'));
  try {
    for (const [arch, suffix] of [
      ['amd64', 'v1'],
      ['arm64', 'v8.0'],
    ]) {
      writeFileSync(join(dir, `budgero_linux_${arch}.zip`), 'archive');
      const buildDir = join(dir, `budgero_linux_${arch}_${suffix}`);
      mkdirSync(buildDir);
      writeFileSync(join(buildDir, 'budgero'), 'binary');
      assert.equal(findLinuxBinary(dir, arch), join(buildDir, 'budgero'));
    }
    assert.throws(() => findLinuxBinary(dir, '386'), /Expected one/);
    mkdirSync(join(dir, 'budgero_linux_amd64_v2'));
    assert.throws(() => findLinuxBinary(dir, 'amd64'), /Expected one/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

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

test('GitHub publication uploads all assets before publishing, and leaves failures as drafts', async () => {
  const { writeFileSync, mkdirSync, readFileSync } = await import('node:fs');
  const { createHash } = await import('node:crypto');
  const { fileURLToPath } = await import('node:url');
  const dir = mkdtempSync(join(tmpdir(), 'budgero-publish-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' });
  try {
    git('init');
    git('config', 'user.name', 'Release test');
    git('config', 'user.email', 'test@example.invalid');
    git('commit', '--allow-empty', '-m', 'release');
    git('tag', 'v1.0.0');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ version: '1.0.0' }));
    writeFileSync(join(dir, 'notes.md'), 'Curated release notes');
    mkdirSync(join(dir, 'dist'));
    const names = ['linux', 'darwin', 'windows'].flatMap((os) =>
      ['amd64', 'arm64'].map((arch) => `budgero_${os}_${arch}.zip`)
    );
    writeFileSync(
      join(dir, 'dist/checksums.txt'),
      names
        .map((name) => {
          writeFileSync(join(dir, 'dist', name), name);
          return `${createHash('sha256').update(name).digest('hex')}  ${name}`;
        })
        .join('\n')
    );
    writeFileSync(
      join(dir, 'mock.mjs'),
      `
      import { appendFileSync } from 'node:fs';
      let uploads = 0;
      globalThis.fetch = async (url, options) => {
        const body = options.headers['Content-Type'] === 'application/json' && options.body ? JSON.parse(options.body) : null;
        appendFileSync('calls.jsonl', JSON.stringify({url, method: options.method, body}) + '\\n');
        if (url.includes('/releases/tags/')) return process.env.SCENARIO === 'published'
          ? Response.json({id: 1, draft: false}) : new Response('', {status: 404});
        if (url.startsWith('https://uploads.github.com/')) {
          uploads++;
          if (process.env.SCENARIO === 'upload-failure' && uploads === 2) return new Response('', {status: 500});
          return Response.json({id: uploads});
        }
        return Response.json({id: 1, draft: true, assets: [], upload_url: 'https://uploads.github.com/repos/tombadilo-bombadilo/budgero/releases/1/assets{?name}', html_url: 'https://github.com/tombadilo-bombadilo/budgero/releases/tag/v1.0.0'});
      };
    `
    );
    const script = fileURLToPath(new URL('./publish-github-release.mjs', import.meta.url));
    for (const scenario of ['success', 'upload-failure', 'published']) {
      writeFileSync(join(dir, 'calls.jsonl'), '');
      const execute = () =>
        execFileSync(process.execPath, ['--import', join(dir, 'mock.mjs'), script], {
          cwd: dir,
          stdio: 'pipe',
          env: {
            ...process.env,
            SCENARIO: scenario,
            GITHUB_TOKEN: 'test-only',
            GITHUB_REPOSITORY: 'tombadilo-bombadilo/budgero',
            RELEASE_NOTES_FILE: join(dir, 'notes.md'),
          },
        });
      if (scenario === 'success') execute();
      else assert.throws(execute);
      const calls = readFileSync(join(dir, 'calls.jsonl'), 'utf8')
        .trim()
        .split('\n')
        .map(JSON.parse);
      const published = calls.filter((call) => call.body?.draft === false);
      assert.equal(published.length, scenario === 'success' ? 1 : 0);
      if (scenario === 'success') {
        assert.equal(
          calls.filter((call) => call.url.startsWith('https://uploads.github.com/')).length,
          7
        );
        assert.equal(calls.at(-1).body.draft, false);
        assert.equal(
          calls.find((call) => call.body?.draft === true).body.body,
          'Curated release notes'
        );
      }
      if (scenario === 'published') assert.equal(calls.length, 1);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
