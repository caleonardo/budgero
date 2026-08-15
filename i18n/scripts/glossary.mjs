#!/usr/bin/env node
/**
 * Glossary round-trip: export review sheets, import corrections, report status.
 *
 *   node i18n/scripts/glossary.mjs status
 *   node i18n/scripts/glossary.mjs export [locale...]
 *   node i18n/scripts/glossary.mjs import <locale> <file.csv>
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GLOSSARY = join(ROOT, 'glossary.json');
const SHEETS = join(ROOT, 'review-sheets');

const HEADERS = [
  'id',
  'english_term',
  'what_it_means',
  'where_it_appears',
  'length_limit',
  'proposed_translation',
  'translator_note',
  'YOUR_CORRECTION',
  'OK_AS_IS',
  'YOUR_COMMENTS',
];

const load = () => JSON.parse(readFileSync(GLOSSARY, 'utf8'));
const save = (g) => writeFileSync(GLOSSARY, `${JSON.stringify(g, null, 2)}\n`);

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

function exportSheets(locales) {
  const g = load();
  const targets = locales.length ? locales : g.targetLocales;
  mkdirSync(SHEETS, { recursive: true });

  for (const locale of targets) {
    if (!g.targetLocales.includes(locale)) {
      console.error(`unknown locale: ${locale}`);
      process.exitCode = 1;
      continue;
    }
    const lines = [HEADERS.map(csvCell).join(',')];
    let count = 0;

    for (const e of g.entries) {
      if (e.doNotTranslate) continue;
      const t = e.translations?.[locale];
      if (!t) continue;
      count++;
      lines.push(
        [
          e.id,
          e.term,
          e.definition,
          e.context,
          e.uiConstraint,
          t.value,
          t.note,
          '',
          '',
          '',
        ]
          .map(csvCell)
          .join(','),
      );
    }

    const out = join(SHEETS, `glossary-${locale}.csv`);
    writeFileSync(out, `${lines.join('\n')}\n`);
    console.log(`${locale}: ${count} terms -> ${out}`);
  }

  console.log(
    '\nSend the CSV to the reviewer. They fill YOUR_CORRECTION (leave blank if the\n' +
      "proposal is fine) and put 'y' in OK_AS_IS to confirm they actually read it.\n" +
      'Rows with neither stay status:proposed.',
  );
}

function importSheet(locale, file) {
  const g = load();
  if (!g.targetLocales.includes(locale)) throw new Error(`unknown locale: ${locale}`);
  if (!existsSync(file)) throw new Error(`no such file: ${file}`);

  const rows = parseCsv(readFileSync(file, 'utf8'));
  const header = rows.shift().map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const [iId, iCorr, iOk, iCom] = [
    col('id'),
    col('YOUR_CORRECTION'),
    col('OK_AS_IS'),
    col('YOUR_COMMENTS'),
  ];
  if (iId < 0) throw new Error('sheet is missing the id column');

  const byId = new Map(g.entries.map((e) => [e.id, e]));
  let changed = 0;
  let confirmed = 0;
  const unknown = [];

  for (const row of rows) {
    const entry = byId.get((row[iId] ?? '').trim());
    if (!entry) {
      unknown.push(row[iId]);
      continue;
    }
    const t = entry.translations?.[locale];
    if (!t) continue;

    const correction = (row[iCorr] ?? '').trim();
    const ok = (row[iOk] ?? '').trim().toLowerCase();
    const comment = (row[iCom] ?? '').trim();

    if (correction && correction !== t.value) {
      t.value = correction;
      t.status = 'reviewed';
      changed++;
    } else if (['y', 'yes', 'ok', 'x', 'true', '1'].includes(ok)) {
      t.status = 'reviewed';
      confirmed++;
    }
    if (comment) t.note = t.note ? `${t.note} | REVIEWER: ${comment}` : `REVIEWER: ${comment}`;
  }

  save(g);
  console.log(`${locale}: ${changed} corrected, ${confirmed} confirmed as-is.`);
  if (unknown.length) console.warn(`ignored ${unknown.length} unknown id(s): ${unknown.join(', ')}`);
  console.log('Review the diff before committing.');
}

function status() {
  const g = load();
  const translatable = g.entries.filter((e) => !e.doNotTranslate);
  console.log(`${g.entries.length} terms (${translatable.length} translatable)\n`);

  const width = Math.max(...g.targetLocales.map((l) => l.length));
  let blocked = false;

  for (const locale of g.targetLocales) {
    const counts = { proposed: 0, reviewed: 0, locked: 0, missing: 0 };
    for (const e of translatable) {
      const t = e.translations?.[locale];
      if (!t?.value) counts.missing++;
      else counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    const done = counts.reviewed + counts.locked;
    const pct = Math.round((done / translatable.length) * 100);
    if (done < translatable.length) blocked = true;
    console.log(
      `  ${locale.padEnd(width)}  ${String(pct).padStart(3)}% reviewed   ` +
        `proposed:${counts.proposed}  reviewed:${counts.reviewed}  ` +
        `locked:${counts.locked}  missing:${counts.missing}`,
    );
  }

  if (blocked) {
    console.log('\nTranslation pipeline is BLOCKED until every locale is 100% reviewed.');
    console.log('Shipping proposed terms means inconsistent vocabulary across the app.');
  } else {
    console.log('\nAll locales reviewed. Safe to lock and run the translation pipeline.');
  }
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'export') exportSheets(rest);
  else if (cmd === 'import') {
    if (rest.length !== 2) throw new Error('usage: import <locale> <file.csv>');
    importSheet(rest[0], rest[1]);
  } else if (cmd === 'status' || !cmd) status();
  else throw new Error(`unknown command: ${cmd}`);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
