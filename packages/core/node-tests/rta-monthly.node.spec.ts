import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter, asMilli } from '../src';

async function setup() {
  const adapter = await NodeSqlJsAdapter.create();
  const sm = new ServiceManager();
  await sm.initialize(adapter as DatabaseAdapter);
  const services = sm.getServices();
  const budgetId = await services.budgets.createBudget({
    name: 'RTA',
    display_currency: 'USD',
    badge_icon: 'dollar',
    number_format: '123,456.78',
    create_default_categories: true,
  });
  const incomeId = services.categories
    .getAllCategories(budgetId)
    .find((c: { Name: string }) => c.Name === 'Income')!.ID;
  const group = services.categories.addCategoryGroup('Spending', budgetId);
  const food = services.categories.addCategory(group, budgetId, 'Food');
  return { services, budgetId, incomeId, food };
}

// Available for a spending category in a given month.
function avail(services: any, month: string, budgetId: number, categoryId: number): number {
  return (
    services.monthlyBudgets
      .getMonthlyBudget(month, budgetId)
      .find((r: { CategoryID: number }) => r.CategoryID === categoryId)?.Available ?? 0
  );
}

// Available for the (single) CC Payment category in a given month.
function ccPayAvail(services: any, month: string, budgetId: number): number {
  return (
    services.monthlyBudgets
      .getMonthlyBudget(month, budgetId)
      .find((r: { CategoryGroup: string }) => r.CategoryGroup === 'Credit Card Payments')
      ?.Available ?? 0
  );
}

describe('Ready to Assign — monthly (YNAB-style) mode', () => {
  it('defaults to cumulative and is unaffected by the selected month', async () => {
    const { services, budgetId, incomeId, food } = await setup();
    const checking = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0
    );
    await services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      incomeId,
      budgetId,
      '2024-01-05',
      'pay'
    );
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(300), '2024-01', budgetId);

    expect(services.budgets.getRtaMode(budgetId)).toBe('cumulative');
    // Cumulative is month-independent: 1000 income - 300 assigned = 700 everywhere.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(700));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-03')).toBe(asMilli(700));
  });

  it('counts income only through the selected month', async () => {
    const { services, budgetId, incomeId, food } = await setup();
    services.budgets.updateRtaMode(budgetId, 'monthly');
    const checking = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0
    );
    // Income is dated in February.
    await services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      incomeId,
      budgetId,
      '2024-02-05',
      'pay'
    );
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(0), '2024-01', budgetId);

    // January can't see February's income yet.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(0));
    // February does.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(1000));
  });

  it('pulls prior-month cash overspending out of Ready to Assign and resets the category', async () => {
    const { services, budgetId, incomeId, food } = await setup();
    services.budgets.updateRtaMode(budgetId, 'monthly');
    const checking = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0
    );
    await services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      incomeId,
      budgetId,
      '2024-01-01',
      'pay'
    );
    // Assign 150, spend 200 cash -> Food overspent by 50 in January.
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(150), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(200),
      checking.ID,
      food,
      budgetId,
      '2024-01-15',
      'groceries'
    );

    // January: overspend does NOT hit RTA yet; the category shows red.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(850));
    const janFood = services.monthlyBudgets
      .getMonthlyBudget('2024-01', budgetId)
      .find((r) => r.CategoryID === food)!;
    expect(janFood.Available).toBe(asMilli(-50));

    // February: the 50 overspend is pulled from RTA and Food resets to 0.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(800));
    const febFood = services.monthlyBudgets
      .getMonthlyBudget('2024-02', budgetId)
      .find((r) => r.CategoryID === food)!;
    expect(febFood.Available).toBe(asMilli(0));
  });

  it('does not pull credit-card overspending from Ready to Assign', async () => {
    const { services, budgetId, incomeId, food } = await setup();
    services.budgets.updateRtaMode(budgetId, 'monthly');
    const checking = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0
    );
    const card = await services.accounts.createAccount('Card', budgetId, 'credit', 'USD', 0);
    await services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      incomeId,
      budgetId,
      '2024-01-01',
      'pay'
    );
    // Assign 100, spend 150 on the CREDIT card -> 50 over, but on credit.
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(150),
      card.ID,
      food,
      budgetId,
      '2024-01-15',
      'groceries'
    );

    // The credit overspend is card debt, never a Ready-to-Assign deduction.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(900));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(900));
  });

  it('cumulative mode keeps carrying a negative category balance forward', async () => {
    const { services, budgetId, incomeId, food } = await setup();
    const checking = await services.accounts.createAccount(
      'Checking',
      budgetId,
      'checking',
      'USD',
      0
    );
    await services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      incomeId,
      budgetId,
      '2024-01-01',
      'pay'
    );
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(150), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(200),
      checking.ID,
      food,
      budgetId,
      '2024-01-15',
      'groceries'
    );

    // Default cumulative mode: the -50 carries into February inside the category.
    const febFood = services.monthlyBudgets
      .getMonthlyBudget('2024-02', budgetId)
      .find((r) => r.CategoryID === food)!;
    expect(febFood.Available).toBe(asMilli(-50));
  });
});

// These mirror the five scenarios verified live against YNAB, using the same
// numbers observed there.
describe('Ready to Assign — monthly mode, credit-card behaviour', () => {
  async function setupWithCard() {
    const base = await setup();
    const checking = await base.services.accounts.createAccount(
      'Checking',
      base.budgetId,
      'checking',
      'USD',
      0
    );
    const card = await base.services.accounts.createAccount(
      'Card',
      base.budgetId,
      'credit',
      'USD',
      0
    );
    base.services.budgets.updateRtaMode(base.budgetId, 'monthly');
    await base.services.transactions.addTransaction(
      asMilli(1000),
      0,
      checking.ID,
      base.incomeId,
      base.budgetId,
      '2024-01-01',
      'pay'
    );
    return { ...base, checking, card };
  }

  it('moves covered credit spending into the CC Payment category (RTA untouched)', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(60),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );

    expect(avail(services, '2024-01', budgetId, food)).toBe(asMilli(40));
    expect(ccPayAvail(services, '2024-01', budgetId)).toBe(asMilli(60));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(900));
  });

  it('caps CC Payment funding at the covered amount on credit overspend', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(140),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );

    // Category is credit-overspent by 40; only the covered 100 funds the card.
    expect(avail(services, '2024-01', budgetId, food)).toBe(asMilli(-40));
    expect(ccPayAvail(services, '2024-01', budgetId)).toBe(asMilli(100));
    // Credit overspend does not touch RTA, in-month or next month.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(900));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(900));
  });

  it('resets the overspent category next month while the CC Payment balance carries', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(140),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );

    // February: category reset to 0, payment set-aside carried forward to 100.
    expect(avail(services, '2024-02', budgetId, food)).toBe(asMilli(0));
    expect(ccPayAvail(services, '2024-02', budgetId)).toBe(asMilli(100));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(900));
  });

  it('applies a card refund to the overspend, leaving the CC Payment balance capped', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(140),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );
    await services.transactions.addTransaction(
      asMilli(20),
      0,
      card.ID,
      food,
      budgetId,
      '2024-01-20',
      'refund'
    );

    // Refund reduces the credit overspend (-40 -> -20); funding stays capped at 100.
    expect(avail(services, '2024-01', budgetId, food)).toBe(asMilli(-20));
    expect(ccPayAvail(services, '2024-01', budgetId)).toBe(asMilli(100));
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(900));
  });

  it('does not let a later assignment retroactively fund an earlier credit overspend', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    // January: credit spend with nothing assigned -> pure credit overspend.
    await services.transactions.addTransaction(
      0,
      asMilli(50),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );
    // February: assign 100 to the category (does NOT pay down January's debt).
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-02', budgetId);

    expect(avail(services, '2024-01', budgetId, food)).toBe(asMilli(-50));
    // February funding stays 0 — the assignment funds the category, not the card.
    expect(ccPayAvail(services, '2024-02', budgetId)).toBe(asMilli(0));
    expect(avail(services, '2024-02', budgetId, food)).toBe(asMilli(100));
    // Credit overspend never hit RTA, so all 1000 income minus 100 assigned = 900.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-02')).toBe(asMilli(900));
  });

  it('reduces the CC Payment balance when the card is paid', async () => {
    const { services, budgetId, food, card, checking } = await setupWithCard();
    const transfersId = services.categories
      .getAllCategories(budgetId)
      .find((c: { Name: string }) => c.Name === 'Transfers')!.ID;
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(60),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );
    // Pay the card $60: transfer checking -> card (two linked legs).
    await services.transactions.addTransaction(
      0,
      asMilli(60),
      checking.ID,
      transfersId,
      budgetId,
      '2024-01-25',
      'payment',
      'transfer-pay-1'
    );
    await services.transactions.addTransaction(
      asMilli(60),
      0,
      card.ID,
      transfersId,
      budgetId,
      '2024-01-25',
      'payment',
      'transfer-pay-1'
    );

    // Set-aside money leaves the payment category to pay the card: 60 - 60 = 0.
    expect(ccPayAvail(services, '2024-01', budgetId)).toBe(asMilli(0));
  });

  it('does not touch Ready to Assign for a card that starts with debt', async () => {
    const { services, budgetId } = await setupWithCard();
    // A second card carrying $200 of pre-existing debt.
    await services.accounts.createAccount('Debt Card', budgetId, 'credit', 'USD', asMilli(-200));

    // RTA is unaffected; the debt shows only as the payment category being underfunded.
    expect(services.monthlyBudgets.getReadyToAssign(budgetId, '2024-01')).toBe(asMilli(1000));
  });

  it('records the credit overspend as a debt-creation event on the card', async () => {
    const { services, budgetId, food, card } = await setupWithCard();
    services.monthlyBudgets.upsertMonthlyAssignment(food, asMilli(100), '2024-01', budgetId);
    await services.transactions.addTransaction(
      0,
      asMilli(140),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'groceries'
    );

    const ccRow = services.monthlyBudgets
      .getMonthlyBudget('2024-01', budgetId)
      .find((r) => r.CategoryGroup === 'Credit Card Payments')!;
    expect(ccRow.debtBreakdown).toEqual([
      { categoryId: food, categoryName: 'Food', month: '2024-01', amount: asMilli(40) },
    ]);
  });

  it('splits category activity into cash and credit', async () => {
    const { services, budgetId, food, card, checking } = await setupWithCard();
    await services.transactions.addTransaction(
      0,
      asMilli(90),
      card.ID,
      food,
      budgetId,
      '2024-01-10',
      'credit buy'
    );
    await services.transactions.addTransaction(
      0,
      asMilli(30),
      checking.ID,
      food,
      budgetId,
      '2024-01-12',
      'cash buy'
    );

    const foodRow = services.monthlyBudgets
      .getMonthlyBudget('2024-01', budgetId)
      .find((r) => r.CategoryID === food)!;
    expect(foodRow.CreditActivity).toBe(asMilli(-90));
    expect(foodRow.CashActivity).toBe(asMilli(-30));
  });
});
