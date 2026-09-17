# Localized homepage screenshots

These are real app captures of the year-long **Demo** budget supplied for the
homepage. No database is committed: the original backup contains other data.
The homepage chooses `/screenshots/<locale>/<screen>.png` for all five languages.

## Prepare an isolated app

1. Start a disposable local self-hosted server and a Vite app from this branch.
   Use a new backend database and a separate Playwright CLI session/profile.
   Set `VITE_SELF_HOSTABLE=true`; proxy `/api` to that disposable server and set
   `VITE_API_BASE_URL=/api/v1`. Never use a normal personal or production workspace.
2. Register a temporary user and complete onboarding. Select the **Paper** theme,
   light mode, desktop **Table** layout, mobile **Cards** layout. Keep the default
   USD number format so all languages show identical financial data.
3. Find the disposable workspace ID in the browser:

   ```js
   const {getRuntime} = await import('/src/shared/runtime/global.ts');
   getRuntime().getActiveSpaceId();
   ```

4. Create a fresh database containing only Demo (budget 37). The extractor reads
   the source in read-only mode, copies an allowlist of Demo data into a new file,
   excludes history/settings, and checks foreign keys.

   ```sh
   python3 scripts/localization/extract-demo.py /path/to/budgero-demo-year.db \
     /tmp/demo-only.db --space-id DISPOSABLE_WORKSPACE_ID
   ```

5. In that disposable app, open **Create New Budget → Backup**, select the clean
   file and restore it. Close the sidebar and dismiss development update prompts.
   Keep the app unlocked. The script checks for exactly one budget with ID 37.

## Capture

Run from the repository root with the existing **Chromium** Playwright CLI session:

```sh
# PWCLI is playwright-cli or the installed skill's playwright_cli.sh wrapper.
"$PWCLI" --session localization-capture run-code \
  "$(node scripts/localization/capture-homepage.mjs)"

# Optional: recapture only specific locales.
"$PWCLI" --session localization-capture run-code \
  "$(node scripts/localization/capture-homepage.mjs de fr)"
```

The generator uses actual app catalogs and the imported financial data. It
changes only the disposable fixture's sample budget/category/account names using
`demo-labels.json`; real user-entered names are not automatically translated.
It pins the capture date to September 2026, uses the same report periods,
selects the groceries goal on desktop, and captures the four default reports.
It preserves internal graph identifiers and actual report calculations.

Desktop captures are 1440×960 CSS pixels at 2× resolution (2880×1920 PNG).
Mobile captures are 390×844 at 2× (780×1688 PNG). The script saves Chrome's native
screenshot bytes through a browser download, preserving device resolution. It
waits for fonts and chart animations and resets scroll positions before saving.
There is no text replacement, image editing, or screenshot-only styling.

The capture script uses Vite-only module imports and the runtime's internal query
client to refresh fixture changes. It is a development tool, not a production
entry point. Update the fixture mappings if the demo database changes.

Review every image after capture, including charts and long translated labels.
Build the website and check desktop/mobile image selection plus every report's
full-size viewer. Do not commit the source database, browser profile, or logs.
