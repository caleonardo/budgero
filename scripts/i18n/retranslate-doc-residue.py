#!/usr/bin/env python3
"""Re-translate only the untranslated residue in localized docs.

The original docs run occasionally dropped blocks (rate limits) or skipped
frontmatter, leaving English paragraphs inside otherwise-translated files.
This walks every locale file, finds body blocks and frontmatter values that
are byte-identical to the English source, and re-translates just those.

    SYN_KEY=... python3 scripts/i18n/retranslate-doc-residue.py [locale ...]
"""

import os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate as T  # noqa: E402
import importlib.util as _ilu

_spec = _ilu.spec_from_file_location(
    "tdocs", os.path.join(os.path.dirname(os.path.abspath(__file__)), "translate-docs.py")
)
tdocs = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(tdocs)

DOCS = tdocs.DOCS
WORDY = re.compile(r"[A-Za-z]{2}.*[A-Za-z]{2}", re.S)


def fix_front(locale, en_front, loc_front):
    if not en_front or not loc_front:
        return loc_front, 0
    en_lines, loc_lines = en_front.split("\n"), loc_front.split("\n")
    if len(en_lines) != len(loc_lines):
        return loc_front, 0
    todo = []
    for i, (e, l) in enumerate(zip(en_lines, loc_lines)):
        if e != l or not e.strip():
            continue
        m = re.match(r"^(\w+):\s*(.+)$", e)
        if m and m.group(1) in tdocs.TRANSLATE_KEYS:
            todo.append((i, "scalar", m.group(1), m.group(2).strip().strip('"')))
            continue
        m = re.match(r"^(\s*)-\s+(.+)$", e)
        if m and WORDY.search(m.group(2)):
            todo.append((i, "item", m.group(1), m.group(2).strip().strip('"')))
    if not todo:
        return loc_front, 0
    got = T.translate_batch(locale, [t[3] for t in todo])
    import json as _json
    fixed = 0
    for j, (i, kind, meta, _) in enumerate(todo):
        value = got.get(j)
        if not value:
            continue
        enc = _json.dumps(value, ensure_ascii=False)
        loc_lines[i] = f"{meta}: {enc}" if kind == "scalar" else f"{meta}- {enc}"
        fixed += 1
    return "\n".join(loc_lines), fixed


def fix_file(locale, name):
    en_raw = open(os.path.join(DOCS, name), encoding="utf-8").read()
    loc_path = os.path.join(DOCS, locale, name)
    if not os.path.exists(loc_path):
        return f"{locale}/{name}: MISSING (run translate-docs.py)"
    loc_raw = open(loc_path, encoding="utf-8").read()

    en_front, en_body = tdocs.parse_front(en_raw)
    loc_front, loc_body = tdocs.parse_front(loc_raw)

    new_front, front_fixed = fix_front(locale, en_front, loc_front)

    en_masked, _ = tdocs.mask(en_body)
    loc_masked, loc_store = tdocs.mask(loc_body)
    en_blocks = tdocs.split_blocks(en_masked)
    loc_blocks = tdocs.split_blocks(loc_masked)

    body_fixed = 0
    if len(en_blocks) == len(loc_blocks):
        idx = [
            i
            for i, (e, l) in enumerate(zip(en_blocks, loc_blocks))
            if e == l and e.strip() and WORDY.search(re.sub(r"⟦\d+⟧", " ", e))
        ]
        for start in range(0, len(idx), 8):
            chunk = idx[start : start + 8]
            got = T.translate_batch(locale, [loc_blocks[i] for i in chunk])
            for j, i in enumerate(chunk):
                if got.get(j):
                    loc_blocks[i] = got[j]
                    body_fixed += 1
    else:
        return f"{locale}/{name}: BLOCK COUNT MISMATCH en={len(en_blocks)} loc={len(loc_blocks)} — needs full --redo"

    if not front_fixed and not body_fixed:
        return None

    new_body = tdocs.unmask("\n\n".join(loc_blocks), loc_store)
    with open(loc_path, "w", encoding="utf-8") as fh:
        if new_front:
            fh.write(f"---\n{new_front}\n---\n\n")
        fh.write(new_body.rstrip("\n") + "\n")
    return f"{locale}/{name}: fixed {front_fixed} frontmatter + {body_fixed} blocks"


def main():
    locales = sys.argv[1:] or ["de", "fr", "es", "nl"]
    files = sorted(f for f in os.listdir(DOCS) if f.endswith(".mdx"))
    for locale in locales:
        for name in files:
            msg = fix_file(locale, name)
            if msg:
                print(msg, flush=True)


if __name__ == "__main__":
    main()
