#!/usr/bin/env node
/**
 * Flags translations likely to overflow their UI slot.
 *
 * German runs ~30% longer than English on average, which is fine in prose and
 * breaks buttons and table headers. This narrows a 2000-message catalog down to
 * the handful actually worth looking at in a browser.
 *
 *   node scripts/i18n/check-overflow.mjs [--ratio 1.4] [--min 3]
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CATALOGS = join(ROOT, 'packages', 'app', 'src', 'locales');
const TARGETS = ['de', 'fr', 'es', 'nl'];

const args = process.argv.slice(2);
const num = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const RATIO = num('--ratio', 1.4);
const MIN_WORDS = num('--min', 3);

function parse(path) {
  const entries = new Map();
  let id = null;
  let key = null;
  let buf = [];
  const unquote = (lines) => lines.map((l) => (l.startsWith('"') ? JSON.parse(l) : l)).join('');
  const flush = () => {
    if (key === 'msgid') id = unquote(buf);
    else if (key === 'msgstr' && id !== null) entries.set(id, unquote(buf));
    key = null;
    buf = [];
  };
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('#') || line === '') {
      flush();
      continue;
    }
    if (line.startsWith('msgid ')) {
      flush();
      key = 'msgid';
      buf = [line.slice(6)];
    } else if (line.startsWith('msgstr ')) {
      flush();
      key = 'msgstr';
      buf = [line.slice(7)];
    } else if (line.startsWith('"') && key) buf.push(line);
  }
  flush();
  entries.delete('');
  return entries;
}

const source = parse(join(CATALOGS, 'en', 'messages.po'));
const findings = [];

for (const locale of TARGETS) {
  const path = join(CATALOGS, locale, 'messages.po');
  if (!existsSync(path)) continue;
  const target = parse(path);

  for (const [id, en] of source) {
    const tr = target.get(id);
    if (!tr) continue;
    // Short labels are the ones that live in constrained slots.
    if (en.split(/\s+/).length > MIN_WORDS) continue;
    if (en.length < 4) continue;
    const ratio = tr.length / en.length;
    if (ratio >= RATIO) findings.push({ locale, en, tr, ratio, growth: tr.length - en.length });
  }
}

findings.sort((a, b) => b.ratio - a.ratio);

const byLocale = findings.reduce((acc, f) => ({ ...acc, [f.locale]: (acc[f.locale] ?? 0) + 1 }), {});
console.log(`Short labels growing >=${RATIO}x (<=${MIN_WORDS} words):\n`);
for (const locale of TARGETS) console.log(`  ${locale}: ${byLocale[locale] ?? 0}`);

console.log(`\nWorst 25 — check these in a browser:\n`);
for (const f of findings.slice(0, 25)) {
  console.log(
    `  [${f.locale}] ${f.ratio.toFixed(2)}x  +${f.growth}ch\n` +
      `      en: ${JSON.stringify(f.en)}\n` +
      `      ${f.locale}: ${JSON.stringify(f.tr)}`
  );
}

console.log(`\n${findings.length} total. This is advisory — it never fails the build.`);
