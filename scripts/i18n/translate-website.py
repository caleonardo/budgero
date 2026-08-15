#!/usr/bin/env python3
"""Translate the website's next-intl JSON catalogs.

Shares the glossary, register rules and validator with the app pipeline in
translate.py so both surfaces speak identical vocabulary.

    SYN_KEY=... python3 scripts/i18n/translate-website.py de [--redo]
"""

import json, os, sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate as T  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MESSAGES = os.path.join(ROOT, "packages", "website", "messages")
BATCH = 12
WORKERS = 8


def flatten(obj, prefix=""):
    out = {}
    for k, v in obj.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict):
            out.update(flatten(v, f"{key}."))
        else:
            out[key] = v
    return out


def unflatten(flat):
    out = {}
    for key, value in flat.items():
        ns, _, leaf = key.partition(".")
        if leaf:
            out.setdefault(ns, {})[leaf] = value
        else:
            out[ns] = value
    return out


def main():
    locale = sys.argv[1]
    redo = "--redo" in sys.argv

    source = flatten(json.load(open(os.path.join(MESSAGES, "en.json"), encoding="utf-8")))
    dst_path = os.path.join(MESSAGES, f"{locale}.json")
    existing = flatten(json.load(open(dst_path, encoding="utf-8"))) if os.path.exists(dst_path) else {}

    todo = [k for k, v in source.items() if redo or not existing.get(k)]
    print(f"{locale}: {len(source)} messages, {len(todo)} to translate")
    if not todo:
        return

    batches = [todo[i : i + BATCH] for i in range(0, len(todo), BATCH)]
    results, rejected = {}, []
    done = [0]

    def run(keys):
        texts = [source[k] for k in keys]
        got = T.translate_batch(locale, texts)
        out = {}
        for i, key in enumerate(keys):
            cand = got.get(i)
            ok, why = T.valid(source[key], cand) if cand else (False, "missing")
            if ok:
                out[key] = cand
            else:
                rejected.append((key, why))
        done[0] += 1
        print(f"  batch {done[0]}/{len(batches)}  (+{len(out)})", flush=True)
        return out

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for part in pool.map(run, batches):
            results.update(part)

    merged = {k: results.get(k, existing.get(k, "")) for k in source}
    merged = {k: v for k, v in merged.items() if v}

    with open(dst_path, "w", encoding="utf-8") as fh:
        json.dump(unflatten(merged), fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print(f"\n{locale}: {len(merged)}/{len(source)} translated ({len(rejected)} rejected)")
    for key, why in rejected[:8]:
        print(f"  REJECT [{why}] {key}")


if __name__ == "__main__":
    main()
