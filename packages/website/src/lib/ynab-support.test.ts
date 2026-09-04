import assert from 'node:assert/strict';
import test from 'node:test';
import {
  anonymizeYnabSnapshot,
  createYnabSupportBundle,
  type YnabApiSnapshot,
} from './ynab-support.ts';

const fixture: YnabApiSnapshot = {
  serverKnowledge: 42,
  plan: {
    id: 'plan-original',
    name: 'Aleksa household',
    first_month: '2026-01-01',
    last_month: '2026-02-01',
    currency_format: {
      iso_code: 'EUR',
      decimal_digits: 2,
      decimal_separator: '.',
      group_separator: ',',
      currency_symbol: '€',
      display_symbol: true,
      symbol_first: true,
    },
    accounts: [
      {
        id: 'account-original',
        name: 'Main private account',
        type: 'checking',
        on_budget: true,
        closed: false,
        deleted: false,
        balance: 125000,
        cleared_balance: 120000,
        uncleared_balance: 5000,
        balance_formatted: '€125.00',
        balance_currency: 125,
        cleared_balance_formatted: '€120.00',
        cleared_balance_currency: 120,
        uncleared_balance_formatted: '€5.00',
        uncleared_balance_currency: 5,
        transfer_payee_id: 'payee-transfer',
        debt_interest_rates: { '2026-02-01': 6_125 },
        debt_minimum_payments: { '2026-02-01': 25_000 },
        debt_escrow_amounts: { '2026-02-01': 10_000 },
        note: 'This must not survive',
      },
    ],
    category_groups: [
      {
        id: 'group-original',
        name: 'Secret group',
        internal: false,
        deleted: false,
      },
    ],
    categories: [
      {
        id: 'category-original',
        category_group_id: 'group-original',
        name: 'Secret category',
        internal: false,
        deleted: false,
        budgeted: 20000,
        activity: -5000,
        balance: 15000,
        budgeted_formatted: '€20.00',
        budgeted_currency: 20,
        goal_target: 100000,
        goal_target_formatted: '€100.00',
        goal_target_currency: 100,
        goal_percentage_complete: 20,
        note: 'Private category note',
      },
    ],
    months: [
      {
        month: '2026-02-01',
        deleted: false,
        budgeted: 20000,
        activity: -5000,
        income: 100000,
        to_be_budgeted: 80000,
        categories: [
          {
            id: 'category-original',
            category_group_id: 'group-original',
            name: 'Secret category',
            internal: false,
            deleted: false,
            budgeted: 20000,
            activity: -5000,
            balance: 15000,
            balance_formatted: '€15.00',
            balance_currency: 15,
          },
        ],
      },
    ],
    payees: [
      { id: 'payee-original', name: 'Sensitive shop', transfer_account_id: null, deleted: false },
      {
        id: 'payee-transfer',
        name: 'Transfer: Main private account',
        transfer_account_id: 'account-original',
        deleted: false,
      },
    ],
    transactions: [
      {
        id: 'transaction-original',
        account_id: 'account-original',
        date: '2026-02-05',
        amount: 125000,
        amount_formatted: '€125.00',
        amount_currency: 125,
        memo: 'Medical details',
        import_id: 'bank-import-secret',
        import_payee_name_original: 'Original private bank payee',
        flag_name: 'Private flag label',
        payee_id: 'payee-original',
        category_id: 'category-original',
        deleted: false,
      },
    ],
    subtransactions: [],
  },
  moneyMovements: [
    {
      id: 'movement-original',
      month: '2026-02-01',
      from_category_id: null,
      to_category_id: 'category-original',
      amount: 15000,
      amount_formatted: '€15.00',
      amount_currency: 15,
      deleted: false,
    },
  ],
};

const idFactory = (kind: string, index: number) => `anonymous-${kind}-${index}`;

test('anonymizes names, free text, and IDs without mutating the source', () => {
  const anonymized = anonymizeYnabSnapshot(fixture, { idFactory });
  const output = JSON.stringify(anonymized);

  for (const sensitive of [
    'Aleksa household',
    'Main private account',
    'Secret group',
    'Secret category',
    'Sensitive shop',
    'Medical details',
    'bank-import-secret',
    'Original private bank payee',
    'Private flag label',
    'account-original',
    'category-original',
  ]) {
    assert.equal(output.includes(sensitive), false, `${sensitive} leaked into the export`);
  }

  const plan = anonymized.plan;
  const account = (plan.accounts as Record<string, unknown>[])[0];
  const transaction = (plan.transactions as Record<string, unknown>[])[0];
  const category = (plan.categories as Record<string, unknown>[])[0];
  const monthCategory = (
    (plan.months as Record<string, unknown>[])[0].categories as Record<string, unknown>[]
  )[0];

  assert.equal(account.name, 'Account 001');
  assert.equal(account.note, null);
  assert.equal(transaction.memo, null);
  assert.equal(transaction.import_id, null);
  assert.equal(transaction.import_payee_name_original, null);
  assert.equal(transaction.flag_name, null);
  assert.equal(transaction.account_id, account.id);
  assert.equal(transaction.category_id, category.id);
  assert.equal(monthCategory.id, category.id);
  assert.equal(transaction.amount, 125000);
  assert.equal(transaction.date, '2026-02-05');
  assert.equal(fixture.plan.name, 'Aleksa household');
});

test('adds the verification values used by the Budgero import checks', () => {
  const bundle = createYnabSupportBundle(fixture, {
    idFactory,
    amountScaleFactor: 7,
    now: new Date('2026-09-04T12:00:00.000Z'),
  });

  assert.equal(bundle.serverKnowledge, 42);
  assert.equal(bundle._support.generatedAt, '2026-09-04T12:00:00.000Z');
  assert.deepEqual(bundle._support.anonymization.amountScaling, {
    operation: 'multiply',
    k: 7,
    formula: 'exported_amount = original_amount * k',
  });
  assert.equal(bundle._support.anonymization.amountsPreserved, false);
  assert.deepEqual(bundle._support.verification.readyToAssignByMonth, [
    {
      month: '2026-02',
      ready_to_assign: 560000,
      assigned: 140000,
      activity: -35000,
      income: 700000,
    },
  ]);
  assert.equal(bundle._support.verification.categoryValuesByMonth[0].available, 105000);
  assert.equal(bundle._support.verification.accountBalances[0].source_balance, 875000);
  assert.equal(bundle._support.verification.accountBalances[0].transaction_net, 875000);
  assert.equal(bundle._support.verification.moneyMovementAssignments.checked, 1);
  assert.equal(bundle._support.verification.moneyMovementAssignments.matched, 0);
  assert.equal(
    bundle._support.verification.moneyMovementAssignments.mismatches[0].assigned,
    140000
  );
  assert.equal(
    bundle._support.verification.moneyMovementAssignments.mismatches[0].money_movement_net,
    105000
  );
});

test('scales every monetary representation by one factor without scaling rates', () => {
  const bundle = createYnabSupportBundle(fixture, { idFactory, amountScaleFactor: 3 });
  const plan = bundle.plan;
  const account = (plan.accounts as Record<string, unknown>[])[0];
  const category = (plan.categories as Record<string, unknown>[])[0];
  const transaction = (plan.transactions as Record<string, unknown>[])[0];
  const movement = bundle.moneyMovements[0];

  assert.equal(account.balance, 375000);
  assert.equal(account.cleared_balance, 360000);
  assert.equal(account.uncleared_balance, 15000);
  assert.equal(account.balance_currency, 375);
  assert.equal(account.balance_formatted, '€375.00');
  assert.deepEqual(account.debt_minimum_payments, { '2026-02-01': 75_000 });
  assert.deepEqual(account.debt_escrow_amounts, { '2026-02-01': 30_000 });
  assert.deepEqual(account.debt_interest_rates, { '2026-02-01': 6_125 });
  assert.equal(category.goal_target, 300000);
  assert.equal(category.goal_target_currency, 300);
  assert.equal(category.goal_target_formatted, '€300.00');
  assert.equal(category.goal_percentage_complete, 20);
  assert.equal(transaction.amount, 375000);
  assert.equal(transaction.amount_currency, 375);
  assert.equal(transaction.amount_formatted, '€375.00');
  assert.equal(movement.amount, 45000);
  assert.equal(movement.amount_currency, 45);
  assert.equal(movement.amount_formatted, '€45.00');
});

test('rejects scale factors that could make milliunit values unsafe', () => {
  assert.throws(
    () => createYnabSupportBundle(fixture, { amountScaleFactor: Number.MAX_SAFE_INTEGER }),
    /too large to scale safely/
  );
});
