import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { changelogEntries } from '../src/lib/changelog-data.ts';

const root = fileURLToPath(new URL('../.next/server/app/', import.meta.url));
const sitemap = readFileSync(join(root, 'sitemap.xml.body'), 'utf8');
const locales = ['en', 'de', 'fr', 'es', 'nl'];
let pagesChecked = 0;
let largestPage = 0;
for (const locale of locales) {
  const archiveDir = join(root, locale, 'changelog/page');
  const archives = readdirSync(archiveDir)
    .filter((name) => name.endsWith('.html'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const files = [
    join(root, locale, 'changelog.html'),
    ...archives.map((name) => join(archiveDir, name)),
  ];
  const versions = [];
  for (const [index, file] of files.entries()) {
    const html = readFileSync(file, 'utf8');
    const bytes = Buffer.byteLength(html);
    // Keep headroom below Googlebot's 2 MB HTML fetch limit.
    assert.ok(bytes < 1_500_000, `${file} exceeds the 1.5 MB HTML budget (${bytes})`);
    largestPage = Math.max(largestPage, bytes);
    pagesChecked++;
    const prefix = locale === 'en' ? '' : `/${locale}`;
    const pathFor = (number) => `${prefix}/changelog${number === 1 ? '' : `/page/${number}`}`;
    const path = pathFor(index + 1);
    const canonical = `https://budgero.app${path}`;
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}"`),
      `Wrong canonical: ${file}`
    );
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `Missing sitemap entry: ${canonical}`);
    for (const alternate of locales) {
      const alternatePath = `${alternate === 'en' ? '' : `/${alternate}`}/changelog${index === 0 ? '' : `/page/${index + 1}`}`;
      assert.ok(
        html.includes(`hrefLang="${alternate}" href="https://budgero.app${alternatePath}"`),
        `Missing ${alternate} alternate: ${file}`
      );
    }
    if (index > 0)
      assert.ok(html.includes(`href="${pathFor(index)}"`), `Missing previous link: ${file}`);
    if (index < files.length - 1)
      assert.ok(html.includes(`href="${pathFor(index + 2)}"`), `Missing next link: ${file}`);
    assert.ok(
      html.includes('<!--email_off--><a href="mailto:hello@budgero.app"'),
      `Missing email opt-out: ${file}`
    );
    versions.push(...[...html.matchAll(/<article id="([^"]+)"/g)].map((match) => match[1]));
  }
  assert.deepEqual(
    versions,
    changelogEntries.map((entry) => entry.version),
    `Missing or duplicate releases for ${locale}`
  );
}
console.log(
  `Verified ${pagesChecked} changelog pages: complete history, canonical/hreflang URLs, sitemap, navigation, email opt-out. Largest HTML: ${largestPage} bytes.`
);
