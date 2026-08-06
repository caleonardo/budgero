import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';
import {
  CRYPTO_SCALE,
  FIAT_SCALE,
  convertScaled,
  getCurrencyInfo,
  getCurrencyScale,
  isCryptoCurrency,
} from '../src/currencies';

describe('currency registry', () => {
  it('classifies codes and assigns scales', () => {
    expect(isCryptoCurrency('BTC')).toBe(true);
    expect(isCryptoCurrency('btc')).toBe(true);
    expect(isCryptoCurrency('USD')).toBe(false);
    expect(isCryptoCurrency('RSD')).toBe(false);

    expect(getCurrencyScale('ETH')).toBe(CRYPTO_SCALE);
    expect(getCurrencyScale('USD')).toBe(FIAT_SCALE);
    expect(getCurrencyScale('UNKNOWN')).toBe(FIAT_SCALE);

    expect(getCurrencyInfo('JPY').displayDecimals).toBe(0);
    expect(getCurrencyInfo('KWD').displayDecimals).toBe(3);
    expect(getCurrencyInfo('EUR').displayDecimals).toBe(2);
    expect(getCurrencyInfo('BTC').displayDecimals).toBe(8);
  });

  it('converts across storage scales', () => {
    // Fiat → fiat: scale ratio 1, identical to plain rounding.
    expect(convertScaled(100_000, 1.2, 'EUR', 'USD')).toBe(120_000);

    // Crypto → fiat: 0.5 BTC (5e7 sats-scale) at 100k USD/BTC = 50,000 USD (5e7 milli).
    expect(convertScaled(50_000_000, 100_000, 'BTC', 'USD')).toBe(50_000_000);

    // Fiat → crypto: $50 (50,000 milli) at 1 USD = 0.00001 BTC → 1,000 sats-scale units.
    expect(convertScaled(50_000, 0.00001, 'USD', 'BTC')).toBe(50_000);

    // Tiny amounts survive the scale change: $0.06 at 60k USD/BTC ≈ 100 sats.
    expect(convertScaled(60, 1 / 60_000, 'USD', 'BTC')).toBe(100);
  });
});

describe('crypto accounts end-to-end conversion', () => {
  it('converts a BTC account transaction into budget milliunits at sat precision', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter as DatabaseAdapter);
    const { budgets, accounts, categories, currency, transactions } = sm.getServices();

    const bId = await budgets.createBudget({
      name: 'Crypto',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: true,
    });

    await currency.saveRate('BTC', 'USD', 100_000, '2026-08-03', bId);

    const wallet = await accounts.createAccount('Cold wallet', bId, 'checking', 'BTC', 0);
    const cat = categories.getAllCategories(bId).find((c) => c.Name !== 'Income');
    if (!cat) throw new Error('category missing');

    // Spend 0.0042 BTC = 420,000 sats-scale units.
    const txId = await transactions.addTransaction(
      0,
      420_000,
      wallet.ID,
      cat.ID,
      bId,
      '2026-08-03',
      'hardware'
    );
    const tx = transactions.getTransactionByID(txId);
    expect(tx.OutflowNative).toBe(420_000);
    // 0.0042 BTC × 100,000 USD = 420 USD = 420,000 milliunits.
    expect(tx.OutflowConverted).toBe(420_000);
    expect(tx.ExchangeRate).toBeCloseTo(100_000, 6);

    const walletAfter = accounts.getAccount(wallet.ID);
    expect(walletAfter?.BalanceNative).toBe(-420_000);
    expect(walletAfter?.BalanceConverted).toBe(-420_000);
  });

  it('rejects crypto as a budget display currency', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter as DatabaseAdapter);
    const { budgets } = sm.getServices();

    await expect(
      budgets.createBudget({
        name: 'Nope',
        display_currency: 'BTC',
        badge_icon: 'dollar',
        number_format: '123,456.78',
        create_default_categories: false,
      })
    ).rejects.toThrow(/fiat/i);

    const bId = await budgets.createBudget({
      name: 'Ok',
      display_currency: 'USD',
      badge_icon: 'dollar',
      number_format: '123,456.78',
      create_default_categories: false,
    });
    await expect(budgets.updateBudgetCurrency(bId, 'ETH')).rejects.toThrow(/fiat/i);
  });
});
