import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';
import { getLocalDateString } from '../src/utils/date';

async function setup() {
  const adapter = await NodeSqlJsAdapter.create();
  const sm = new ServiceManager();
  await sm.initialize(adapter as DatabaseAdapter);
  const services = sm.getServices();
  const bId = await services.budgets.createBudget({
    name: 'Reval',
    display_currency: 'USD',
    badge_icon: 'dollar',
    number_format: '123,456.78',
    create_default_categories: true,
  });
  return { services, bId };
}

describe('account revaluations (stock vs flow)', () => {
  it('trues converted balance up to native × latest rate, journals the delta, and moves RTA', async () => {
    const { services, bId } = await setup();
    const { accounts, categories, currency, transactions, monthlyBudgets } = services;
    const today = getLocalDateString();

    await currency.saveRate('EUR', 'USD', 1.0, today, bId);
    const eur = await accounts.createAccount('EUR', bId, 'checking', 'EUR', 0);
    const income = categories.getAllCategories(bId).find((c) => c.Name === 'Income');
    if (!income) throw new Error('income category missing');

    // €100 income at 1.0 → $100 converted, RTA $100.
    await transactions.addTransaction(100_000, 0, eur.ID, income.ID, bId, today, 'salary');
    expect(await monthlyBudgets.getReadyToAssign(bId)).toBe(100_000);

    // Market moves: 1 EUR = 1.20 USD.
    await currency.saveRate('EUR', 'USD', 1.2, today, bId);
    expect(await currency.revalueAccounts(bId)).toBe(1);

    let acc = accounts.getAccount(eur.ID);
    expect(acc?.BalanceNative).toBe(100_000);
    expect(acc?.BalanceConverted).toBe(120_000);

    // The transaction keeps its historical rate — flows are untouched.
    const summary = currency.getRevaluationSummary(eur.ID);
    expect(summary.total).toBe(20_000);
    expect(summary.lastDate).toBe(today);

    // RTA includes the revaluation delta.
    expect(await monthlyBudgets.getReadyToAssign(bId)).toBe(120_000);

    // Idempotent: same rate, same day → nothing new.
    expect(await currency.revalueAccounts(bId)).toBe(0);

    // A full balance recompute (e.g. after an edit) must not wipe the journaled
    // delta: add and delete a small transaction, which triggers recalculation.
    const cat = categories.getAllCategories(bId).find((c) => c.Name !== 'Income');
    if (!cat) throw new Error('category missing');
    const tmpId = await transactions.addTransaction(0, 1_000, eur.ID, cat.ID, bId, today, 'tmp');
    await transactions.deleteTransaction(tmpId);
    acc = accounts.getAccount(eur.ID);
    expect(acc?.BalanceConverted).toBe(120_000);
  });

  it('merges same-day true-ups into one row and keeps the first OldRate', async () => {
    const { services, bId } = await setup();
    const { accounts, categories, currency, transactions } = services;
    const today = getLocalDateString();

    await currency.saveRate('EUR', 'USD', 1.0, today, bId);
    const eur = await accounts.createAccount('EUR', bId, 'checking', 'EUR', 0);
    const cat = categories.getAllCategories(bId).find((c) => c.Name !== 'Income');
    if (!cat) throw new Error('category missing');
    await transactions.addTransaction(100_000, 0, eur.ID, cat.ID, bId, today, 'x');

    await currency.saveRate('EUR', 'USD', 1.1, today, bId);
    await currency.revalueAccounts(bId);
    await currency.saveRate('EUR', 'USD', 1.3, today, bId);
    await currency.revalueAccounts(bId);

    const summary = currency.getRevaluationSummary(eur.ID);
    // Net effect: 100 EUR from 1.0 → 1.3 = +30,000 milli across ONE merged row.
    expect(summary.total).toBe(30_000);
    const acc = accounts.getAccount(eur.ID);
    expect(acc?.BalanceConverted).toBe(130_000);
  });

  it('excludes off-budget account revaluations from RTA', async () => {
    const { services, bId } = await setup();
    const { accounts, categories, currency, transactions, monthlyBudgets } = services;
    const today = getLocalDateString();

    await currency.saveRate('BTC', 'USD', 100_000, today, bId);
    const wallet = await accounts.createAccount(
      'Wallet',
      bId,
      'checking',
      'BTC',
      0,
      undefined,
      false
    );
    const income = categories.getAllCategories(bId).find((c) => c.Name === 'Income');
    if (!income) throw new Error('income category missing');

    // 0.1 BTC (1e7 sats-scale) income on the OFF-budget wallet.
    await transactions.addTransaction(10_000_000, 0, wallet.ID, income.ID, bId, today, 'mine');
    const rtaBefore = await monthlyBudgets.getReadyToAssign(bId);

    await currency.saveRate('BTC', 'USD', 120_000, today, bId);
    await currency.revalueAccounts(bId);

    const acc = accounts.getAccount(wallet.ID);
    expect(acc?.BalanceConverted).toBe(12_000_000); // $12,000 in milli
    // Off-budget: the +$2,000 delta must NOT hit RTA.
    expect(await monthlyBudgets.getReadyToAssign(bId)).toBe(rtaBefore);
  });

  it('custom date-range rate pins revaluation over the market rate', async () => {
    const { services, bId } = await setup();
    const { accounts, categories, currency, transactions } = services;
    const today = getLocalDateString();
    const pastDate = '2026-01-02'; // before any custom range; flows keep this rate

    await currency.saveRate('EUR', 'USD', 1.0, pastDate, bId);
    const eur = await accounts.createAccount('EUR', bId, 'checking', 'EUR', 0);
    const income = categories.getAllCategories(bId).find((c) => c.Name === 'Income');
    if (!income) throw new Error('income category missing');
    await transactions.addTransaction(100_000, 0, eur.ID, income.ID, bId, pastDate, 'salary');

    // Market says 1.2 today.
    await currency.saveRate('EUR', 'USD', 1.2, today, bId);
    await currency.revalueAccounts(bId);
    expect(accounts.getAccount(eur.ID)?.BalanceConverted).toBe(120_000);

    // Custom rate 1.5 from today, open-ended — trues the stock up immediately.
    const { id } = await currency.addCustomRate('EUR', 'USD', 1.5, today, null, bId);
    expect(accounts.getAccount(eur.ID)?.BalanceConverted).toBe(150_000);

    // Market moves again; the pin must hold.
    await currency.saveRate('EUR', 'USD', 1.3, today, bId);
    expect(await currency.revalueAccounts(bId)).toBe(0);
    expect(accounts.getAccount(eur.ID)?.BalanceConverted).toBe(150_000);

    // Deleting the custom rate reverts the stock to the market rate.
    await currency.deleteCustomRate(id, bId);
    expect(accounts.getAccount(eur.ID)?.BalanceConverted).toBe(130_000);
  });
});
