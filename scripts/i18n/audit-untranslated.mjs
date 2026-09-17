#!/usr/bin/env node
/**
 * Counts user-facing English strings that are NOT wrapped for translation.
 *
 * The extraction codemods were deliberately conservative and skipped anything
 * they could not reason about. This measures what they left behind, so
 * "translated" is a number that can be verified rather than asserted.
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages', 'app');

const files = execSync(
  `find src -name '*.tsx' -o -name '*.ts' | grep -v '\\.test\\.' | grep -v '\\.spec\\.' | grep -v '/test/' | grep -v '\\.generated\\.'`,
  { cwd: APP, encoding: 'utf8' }
)
  .trim()
  .split('\n');

const SKIP_VALUE =
  /^(https?:|www\.|mailto:|\/|#|[\d\s\p{P}\p{S}]*$)|^[\w.+-]+@[\w-]+\.\w+$/u;

const looksHuman = (s) => {
  const t = s.trim();
  if (t.length < 3 || t.length > 200) return false;
  if (SKIP_VALUE.test(t)) return false;
  if (!/[a-z]{2}/.test(t)) return false; // needs a lowercase run
  if (!/\p{L}/u.test(t)) return false;
  if (!/\s/.test(t) && /^[\w-]*[-_.][\w-]*$/.test(t)) return false; // slug/ident
  return true;
};

const CATEGORIES = {
  'jsx-text': /(?<=>)[^<>{}]*[A-Za-z]{2}[^<>{}]*(?=<)/g,
  'jsx-ternary-string': /\?\s*'([^']{3,})'\s*:\s*'([^']{3,})'/g,
  'object-literal': /\b(?:label|title|description|placeholder|name|text|heading|tooltip|cta|message|summary|hint|caption|emptyText|confirmText|cancelText)\s*:\s*'([^']{3,})'/g,
  'jsx-attribute': /\b(?:placeholder|title|aria-label|label|alt|description)=("([^"]{3,})")/g,
};

const findings = {};
const perFile = {};

for (const file of files) {
  const src = readFileSync(join(APP, file), 'utf8');
  // Blank out already-wrapped regions so they don't count as misses.
  const masked = src
    .replace(/<Trans>[\s\S]*?<\/Trans>/g, '<Trans/>')
    .replace(/\bt`[^`]*`/g, 't``')
    .replace(/\bmsg`[^`]*`/g, 'msg``')
    .replace(/\bplural\([\s\S]*?\n\s*\}\)/g, 'plural()')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  for (const [cat, re] of Object.entries(CATEGORIES)) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(masked))) {
      const candidates = m.slice(1).filter(Boolean).concat(m[0]);
      const value = candidates.find((c) => looksHuman(c));
      if (!value) continue;
      (findings[cat] ??= new Set()).add(value.trim());
      perFile[file] = (perFile[file] ?? 0) + 1;
    }
  }
}

let total = 0;
console.log('Untranslated user-facing strings still in source:\n');
for (const [cat, set] of Object.entries(findings)) {
  console.log(`  ${cat.padEnd(20)} ${set.size}`);
  total += set.size;
}
console.log(`  ${'TOTAL'.padEnd(20)} ${total}\n`);

const worst = Object.entries(perFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);
console.log('Worst files:');
for (const [f, n] of worst) console.log(`  ${String(n).padStart(4)}  ${f}`);

console.log('\nSamples:');
for (const [cat, set] of Object.entries(findings)) {
  console.log(`\n  [${cat}]`);
  for (const s of [...set].slice(0, 5)) console.log(`    ${JSON.stringify(s.slice(0, 70))}`);
}
