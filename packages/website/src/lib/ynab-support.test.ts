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
    currency_format: { iso_code: 'EUR', decimal_digits: 2 },
    accounts: [
      {
        id: 'account-original',
        name: 'Main private account',
        type: 'checking',
        on_budget: true,
        closed: false,
        deleted: false,
        balance: 125000,
        transfer_payee_id: 'payee-transfer',
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
        memo: 'Medical details',
        import_id: 'bank-import-secret',
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
    'account-original',
    'category-original',
  ]) {
    assert.equal(output.includes(sensitive), false, `${sensitive} leaked into the export`);
  }

  const plan = anonymized.plan;
  const account = (plan.accounts as Record<string, unknown>[])[0];
  const transaction = (plan.transactions as Record<string, unknown>[])[0];
  const category = (plan.categories as Record<string, unknown>[])[0];
  const monthCategory = ((plan.months as Record<string, unknown>[])[0]
    .categories as Record<string, unknown>[])[0];

  assert.equal(account.name, 'Account 001');
  assert.equal(account.note, null);
  assert.equal(transaction.memo, null);
  assert.equal(transaction.import_id, null);
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
    now: new Date('2026-09-04T12:00:00.000Z'),
  });

  assert.equal(bundle.serverKnowledge, 42);
  assert.equal(bundle._support.generatedAt, '2026-09-04T12:00:00.000Z');
  assert.deepEqual(bundle._support.verification.readyToAssignByMonth, [
    {
      month: '2026-02',
      ready_to_assign: 80000,
      assigned: 20000,
      activity: -5000,
      income: 100000,
    },
  ]);
  assert.equal(bundle._support.verification.categoryValuesByMonth[0].available, 15000);
  assert.equal(bundle._support.verification.accountBalances[0].source_balance, 125000);
  assert.equal(bundle._support.verification.accountBalances[0].transaction_net, 125000);
  assert.equal(bundle._support.verification.moneyMovementAssignments.checked, 1);
  assert.equal(bundle._support.verification.moneyMovementAssignments.matched, 0);
  assert.equal(bundle._support.verification.moneyMovementAssignments.mismatches[0].assigned, 20000);
  assert.equal(
    bundle._support.verification.moneyMovementAssignments.mismatches[0].money_movement_net,
    15000
  );
});

