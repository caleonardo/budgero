#!/usr/bin/env python3
"""Translate Lingui .po catalogs with the locked glossary as a hard constraint.

Validates every result: placeholders, JSX tag markers and ICU plural structure
must survive the round trip, or the message is rejected and retried.

    SYN_KEY=... python3 scripts/i18n/translate.py de [--limit N] [--redo]
"""

import json, os, re, ssl, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

import certifi

SSL_CTX = ssl.create_default_context(cafile=certifi.where())

API = "https://api.synthetic.new/v1/chat/completions"
KEY = os.environ["SYN_KEY"]
MODEL = "hf:zai-org/GLM-5.2"
BATCH = 25
WORKERS = 6

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GLOSSARY = os.path.join(ROOT, "i18n", "glossary.json")
CATALOGS = os.path.join(ROOT, "packages", "app", "src", "locales")

LANG = {"de": "German", "fr": "French", "es": "Spanish", "nl": "Dutch"}

# Address register, pinned so 1500+ messages don't drift between formal and informal.
# Matches the prevailing convention for consumer finance apps in each market.
REGISTER = {
    "de": 'Address the user informally with "du" (dein/deine), never "Sie". This is the norm '
          "for consumer finance apps in Germany. Prefer impersonal phrasing where it reads better.",
    "nl": 'Address the user informally with "je" (jouw), never "u".',
    "fr": 'Address the user formally with "vous", never "tu". French consumer software stays formal.',
    "es": 'Address the user informally with "tú", never "usted". Use peninsular Spanish (Spain).',
}

# Only bare {name} / {0} count as placeholders. A looser pattern would match ICU
# plural branch bodies, whose text is *supposed* to change under translation.
PLACEHOLDER = re.compile(r"\{\s*(\w+)\s*\}")
TAG = re.compile(r"</?\d+\s*/?>")
ICU_HEAD = re.compile(r"\{\s*(\w+)\s*,\s*(plural|select|selectordinal)\s*,")
ICU_BRANCH = re.compile(r"\b(zero|one|two|few|many|other)\s*\{")


# ---------- .po ----------

def unquote(lines):
    return "".join(json.loads(l) if l.startswith('"') else l for l in lines)


def parse_po(path):
    entries, header = [], []
    cur, key, buf = {}, None, []

    def flush():
        nonlocal key, buf
        if key:
            cur[key] = unquote(buf)
        key, buf = None, []

    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if line.startswith("#") or line == "":
                flush()
                if cur.get("msgid") is not None:
                    entries.append(cur)
                    cur = {}
                if line.startswith("#"):
                    cur.setdefault("comments", []).append(line)
                continue
            if line.startswith("msgid "):
                flush()
                key, buf = "msgid", [line[len("msgid ") :]]
            elif line.startswith("msgstr "):
                flush()
                key, buf = "msgstr", [line[len("msgstr ") :]]
            elif line.startswith('"') and key:
                buf.append(line)
    flush()
    if cur.get("msgid") is not None:
        entries.append(cur)

    if entries and entries[0]["msgid"] == "":
        header = entries[0]
        entries = entries[1:]
    return header, entries


def quote(value):
    return json.dumps(value, ensure_ascii=False)


def write_po(path, header, entries):
    out = []
    if header:
        out.append(f"msgid {quote('')}")
        out.append(f"msgstr {quote(header.get('msgstr', ''))}")
        out.append("")
    for e in entries:
        for c in e.get("comments", []):
            out.append(c)
        out.append(f"msgid {quote(e['msgid'])}")
        out.append(f"msgstr {quote(e.get('msgstr', ''))}")
        out.append("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out).rstrip("\n") + "\n")


# ---------- validation ----------

def valid(source, translated):
    if not translated or not translated.strip():
        return False, "empty"

    if sorted(PLACEHOLDER.findall(source)) != sorted(PLACEHOLDER.findall(translated)):
        return False, f"placeholders {PLACEHOLDER.findall(source)} -> {PLACEHOLDER.findall(translated)}"

    if sorted(TAG.findall(source)) != sorted(TAG.findall(translated)):
        return False, f"tags {TAG.findall(source)} -> {TAG.findall(translated)}"

    # ICU: same variable and same construct, in the same order.
    if ICU_HEAD.findall(source) != ICU_HEAD.findall(translated):
        return False, f"ICU head {ICU_HEAD.findall(source)} -> {ICU_HEAD.findall(translated)}"

    # Every branch keyword present in the source must survive.
    if sorted(set(ICU_BRANCH.findall(source))) != sorted(set(ICU_BRANCH.findall(translated))):
        return False, f"ICU branches {set(ICU_BRANCH.findall(source))} -> {set(ICU_BRANCH.findall(translated))}"

    if source.count("#") != translated.count("#"):
        return False, "# count"

    if source.count("{") != translated.count("{") or source.count("}") != translated.count("}"):
        return False, "brace balance"

    return True, ""


# ---------- model ----------

def post(payload, tries=3):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        API, data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=180, context=SSL_CTX) as r:
                return json.load(r)
        except Exception as e:
            if attempt == tries - 1:
                return {"_error": f"{type(e).__name__}: {e}"}
    return {"_error": "unreachable"}


def glossary_block(locale):
    g = json.load(open(GLOSSARY, encoding="utf-8"))
    rows = []
    for e in g["entries"]:
        if e.get("doNotTranslate"):
            rows.append(f'- "{e["term"]}" -> DO NOT TRANSLATE, keep as "{e["term"]}"')
            continue
        t = e["translations"].get(locale)
        if t:
            rows.append(f'- "{e["term"]}" -> "{t["value"]}"')
    return "\n".join(rows)


SYSTEM = """You are a professional software localizer for a personal-finance application.
You produce natural, idiomatic {language} that a native speaker in that market would actually
use - never literal calques from English.

ABSOLUTE RULES:
1. The GLOSSARY below is binding. Whenever an English glossary term appears, use exactly the
   given {language} term. Consistency matters more than elegance.
2. Preserve every placeholder EXACTLY: {{name}}, {{count}}, {{0}} etc. Never translate, reorder
   the characters inside, add, or drop one. You MAY move a placeholder within the sentence to
   respect {language} word order.
3. Preserve JSX markers like <0>...</0> exactly, including their numbers.
4. Preserve ICU plural syntax exactly: {{count, plural, one {{...}} other {{...}}}}. Translate only
   the text inside the branches. Keep the # symbol.
5. UI strings are short. Prefer concise wording; these appear in buttons and table columns.
6. Return ONLY a JSON object mapping each id to its translation. No prose, no code fences.

REGISTER: {register}

GLOSSARY:
{glossary}"""


def translate_batch(locale, batch):
    payload_msgs = {str(i): m for i, m in enumerate(batch)}
    user = (
        f"Translate each value into {LANG[locale]}.\n"
        "Return a JSON object with the same keys.\n\n"
        + json.dumps(payload_msgs, ensure_ascii=False, indent=1)
    )
    res = post({
        "model": MODEL,
        "temperature": 0.2,
        "max_tokens": 8000,
        "messages": [
            {"role": "system", "content": SYSTEM.format(language=LANG[locale], register=REGISTER[locale], glossary=glossary_block(locale))},
            {"role": "user", "content": user},
        ],
    })
    if "_error" in res:
        return {}
    text = res["choices"][0]["message"]["content"] or ""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S | re.I)
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        return {}
    try:
        parsed = json.loads(text[start : end + 1])
    except Exception:
        return {}
    return {int(k): v for k, v in parsed.items() if str(k).isdigit()}


def main():
    locale = sys.argv[1]
    redo = "--redo" in sys.argv
    limit = 0
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    src_header, src_entries = parse_po(os.path.join(CATALOGS, "en", "messages.po"))
    dst_path = os.path.join(CATALOGS, locale, "messages.po")
    dst_header, dst_entries = parse_po(dst_path)
    existing = {e["msgid"]: e.get("msgstr", "") for e in dst_entries}

    todo = [e["msgid"] for e in src_entries if redo or not existing.get(e["msgid"])]
    if limit:
        todo = todo[:limit]
    print(f"{locale}: {len(src_entries)} messages, {len(todo)} to translate")
    if not todo:
        return

    batches = [todo[i : i + BATCH] for i in range(0, len(todo), BATCH)]
    results, rejected = {}, []
    done = [0]

    def run(batch):
        got = translate_batch(locale, batch)
        out = {}
        for i, source in enumerate(batch):
            cand = got.get(i)
            ok, why = valid(source, cand) if cand else (False, "missing")
            if ok:
                out[source] = cand
            else:
                rejected.append((source, cand, why))
        done[0] += 1
        print(f"  batch {done[0]}/{len(batches)}  (+{len(out)})", flush=True)
        return out

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for part in pool.map(run, batches):
            results.update(part)

    for e in src_entries:
        mid = e["msgid"]
        e["msgstr"] = results.get(mid, existing.get(mid, ""))

    write_po(dst_path, dst_header or src_header, src_entries)

    filled = sum(1 for e in src_entries if e["msgstr"])
    print(f"\n{locale}: {filled}/{len(src_entries)} translated ({len(rejected)} rejected)")
    if rejected:
        for s, c, why in rejected[:10]:
            print(f"  REJECT [{why}] {s[:60]!r} -> {str(c)[:60]!r}")


if __name__ == "__main__":
    main()
