import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { assertReleaseTag } from './release-common.mjs';

const tag = `v${JSON.parse(readFileSync('package.json', 'utf8')).version}`;
assertReleaseTag(tag);
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (repository !== 'tombadilo-bombadilo/budgero' || !token)
  throw new Error('Expected Budgero GitHub release credentials');
const base = `https://api.github.com/repos/${repository}`;
async function api(url, method = 'GET', body, contentType = 'application/json') {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': contentType,
    },
    body:
      body === undefined
        ? undefined
        : contentType === 'application/json'
          ? JSON.stringify(body)
          : body,
  });
  if (response.status === 404 && method === 'GET') return null;
  if (!response.ok) throw new Error(`GitHub ${method} failed: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const names = readdirSync('dist')
  .filter((name) => name.endsWith('.zip'))
  .sort();
if (names.length !== 6) throw new Error('Expected six platform archives');
const checksumText = readFileSync('dist/checksums.txt', 'utf8');
for (const name of names) {
  const hash = createHash('sha256')
    .update(readFileSync(`dist/${name}`))
    .digest('hex');
  if (
    !checksumText
      .split('\n')
      .some((line) => line.trim().split(/\s+/)[0] === hash && line.trim().split(/\s+/)[1] === name)
  ) {
    throw new Error(`Checksum mismatch: ${name}`);
  }
}
names.push('checksums.txt');
const body = readFileSync(process.env.RELEASE_NOTES_FILE, 'utf8');
const prerelease = tag.includes('-');
let release = await api(`${base}/releases/tags/${tag}`);
if (release && !release.draft)
  throw new Error(`${tag} is already published; published assets are never overwritten`);
if (!release)
  release = await api(`${base}/releases`, 'POST', {
    tag_name: tag,
    name: `Budgero ${tag}`,
    body,
    draft: true,
    prerelease,
  });
else
  await api(`${base}/releases/${release.id}`, 'PATCH', {
    name: `Budgero ${tag}`,
    body,
    prerelease,
  });
// Only incomplete drafts can be retried. Replace their assets before publishing.
for (const asset of release.assets ?? [])
  await api(`${base}/releases/assets/${asset.id}`, 'DELETE');
for (const name of names) {
  await api(
    `${release.upload_url.split('{')[0]}?name=${encodeURIComponent(name)}`,
    'POST',
    readFileSync(`dist/${name}`),
    'application/octet-stream'
  );
}
const published = await api(`${base}/releases/${release.id}`, 'PATCH', {
  draft: false,
  make_latest: prerelease ? 'false' : 'true',
});
console.log(`Published ${published.html_url}`);
