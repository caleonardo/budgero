# Budgero i18n

Target locales: German, French, Spanish, Dutch, alongside English.

`glossary.json` is the source of truth for Budgero's terms of art. Every translated
string in the app, the landers, and the docs must use these exact terms. Inconsistent
domain vocabulary is what makes a localized app feel broken, so the glossary is
reviewed and locked before any bulk translation runs.

## Workflow

```bash
node i18n/scripts/glossary.mjs status              # review progress per locale
node i18n/scripts/glossary.mjs export [locale...]  # -> i18n/review-sheets/glossary-<locale>.csv
node i18n/scripts/glossary.mjs import <locale> <file.csv>
```

1. `export` produces a CSV per locale.
2. Send it to a native reviewer. They need no repo access and no JSON.
3. `import` merges corrections back and flips those terms to `reviewed`.
4. Once a locale is 100% reviewed, its terms are set to `locked` and the translation
   pipeline may run against it.

## Term status

| status | meaning |
|---|---|
| `proposed` | LLM-proposed, not native-verified. **Never ship.** |
| `reviewed` | A native speaker read and corrected it. |
| `locked` | Final. The translation pipeline must reproduce it exactly. |

Everything currently sits at `proposed`.

## Instructions to send with a review sheet

> This is the core vocabulary of a budgeting app. These ~44 terms repeat constantly
> throughout the product, so they need to be right and internally consistent — every
> other translated string is built on top of them.
>
> - `what_it_means` and `where_it_appears` give you the context. A word like
>   "Available" or "Clear" is ambiguous without it — please read these before deciding.
> - Fill **YOUR_CORRECTION** only if the proposal is wrong or unnatural. Leave it blank
>   if the proposal is good, and put `y` in **OK_AS_IS** so we know you read the row
>   rather than skipped it.
> - `length_limit: tight` means the term goes in a button or a table column. A shorter
>   approximate word beats a longer precise one there. Flag anything that will not fit.
> - Use **YOUR_COMMENTS** for doubts, alternatives, or "technically right but nobody
>   says this."
> - The most important judgement: does this read like it was written by someone in your
>   language, or like it was translated from English? Flag the latter.
>
> The highest-priority rows are `ready_to_assign`, `assign`, `assigned`, `activity`,
> `available`, `payee`, `transaction`, and `cleared` — they appear on nearly every screen.

## Coverage

FR and ES have a reviewer. **DE and NL do not** — options are a paid native pass
(the ~44 terms here plus the top few hundred UI strings covers most of the quality),
or a community review via Weblate/Crowdin, which suits an AGPL project with a European
user base. The glossary is the piece that most needs a human either way.
