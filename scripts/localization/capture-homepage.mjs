#!/usr/bin/env node
// Emit a Playwright CLI run-code function. Run from the repository root.
import { readFileSync } from 'node:fs';

const allLabels = JSON.parse(readFileSync(new URL('./demo-labels.json', import.meta.url), 'utf8'));
const requested = process.argv.slice(2);
const locales = requested.length ? requested : Object.keys(allLabels);
if (locales.some((locale) => !allLabels[locale])) throw new Error('Unknown capture locale');
const labels = Object.fromEntries(locales.map((locale) => [locale, allLabels[locale]]));

async function capture(page, labels) {
  const cdp = await page.context().newCDPSession(page);
  await page.clock.setSystemTime(new Date('2026-09-15T12:00:00Z'));
  async function viewport(width, height) {
    await page.setViewportSize({ width, height });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: false,
    });
  }
  async function navigate(path) {
    await page.evaluate((path) => {
      history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }
  async function capture(locale, name) {
    await page.mouse.move(0, 0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.activeElement?.blur();
      window.scrollTo(0, 0);
      for (const element of document.querySelectorAll('*')) {
        if (element.scrollTop) element.scrollTop = 0;
        if (element.scrollLeft) element.scrollLeft = 0;
      }
    });
    await page.waitForTimeout(1700);
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    const pending = page.waitForEvent('download');
    await page.evaluate((data) => {
      const anchor = document.createElement('a');
      anchor.href = `data:image/png;base64,${data}`;
      anchor.download = 'demo-capture.png';
      anchor.click();
    }, screenshot.data);
    await (await pending).saveAs(`packages/website/public/screenshots/${locale}/${name}.png`);
  }
  for (const [locale, names] of Object.entries(labels)) {
    await viewport(1440, 960);
    await page.evaluate(
      async ({ locale, names }) => {
        if (!['127.0.0.1', 'localhost'].includes(location.hostname))
          throw new Error('Capture requires an isolated local app.');
        const { getRuntime } = await import('/src/shared/runtime/global.ts');
        const { useUiStore } = await import('/src/shared/store/useUiStore.ts');
        const { activateLocale } = await import('/src/shared/i18n/index.ts');
        const runtime = getRuntime();
        const db = runtime.getDatabase();
        const budgets = db.exec('SELECT ID FROM budgets')[0]?.values;
        if (budgets?.length !== 1 || budgets[0][0] !== 37)
          throw new Error('Import the Demo-only fixture first.');
        const update = (table, id, name) =>
          db.prepare(`UPDATE ${table} SET Name = ? WHERE ID = ?`).run(name, id);
        update('budgets', 37, names.budget);
        names.groups.forEach((name, i) => update('category_groups', 323 + i, name));
        names.categories.forEach((name, i) => update('categories', 803 + i, name));
        names.accounts.forEach((name, i) => update('accounts', 106 + i, name));
        await db.forceSave();
        await runtime.capturedQueryClient.invalidateQueries();
        const budget = runtime.services().budgets.getAllBudgets(runtime.getActiveSpaceId())[0];
        const state = useUiStore.getState();
        state.setSelectedBudget(budget);
        state.setCurrentMonth('2026-09');
        state.setSelectedCategories([]);
        await activateLocale(locale);
      },
      { locale, names }
    );
    await navigate('/budgeting');
    await page.getByRole('button', { name: names.categories[0], exact: true }).waitFor();
    await page
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: names.categories[0], exact: true }) })
      .getByRole('checkbox')
      .check();
    await capture(locale, 'budget-desktop');
    await page.evaluate(async () => {
      const { useUiStore } = await import('/src/shared/store/useUiStore.ts');
      useUiStore.getState().setSelectedCategories([]);
    });
    await viewport(390, 844);
    await capture(locale, 'budget-mobile');
    await viewport(1440, 960);
    await navigate('/reports/prebuilt');
    await page.getByRole('heading', { level: 1 }).waitFor();
    const reportButtons = page.locator('h1 + div').getByRole('button');
    for (const [index, name] of [
      [0, 'wealth'],
      [1, 'spending'],
      [4, 'money-map'],
      [5, 'scenario'],
    ]) {
      await reportButtons.nth(index).click();
      await capture(locale, `report-${name}`);
    }
  }
  await cdp.detach();
}

console.log(`async (page) => { await (${capture.toString()})(page, ${JSON.stringify(labels)}); }`);
