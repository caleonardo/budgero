#!/usr/bin/env node

const API_BASE = 'https://api.ynab.com/v1';
const PREFIX = '[Budgero Edge]';
const token = process.env.YNAB_ACCESS_TOKEN?.trim();
const planId = process.env.YNAB_PLAN_ID?.trim() || process.argv[2]?.trim();

if (!token || !planId) {
  throw new Error(
    'Set YNAB_ACCESS_TOKEN and YNAB_PLAN_ID (or pass the plan ID as the first argument)'
  );
}

async function request(path, init = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.detail || payload?.error?.name || `YNAB API ${response.status}`
    );
  }
  return payload.data;
}

const planPath = `/plans/${encodeURIComponent(planId)}`;
let plan = (await request(planPath)).plan;

async function refreshPlan() {
  plan = (await request(planPath)).plan;
}

async function ensureGroup(name) {
  const existing = plan.category_groups.find((group) => !group.deleted && group.name === name);
  if (existing) return existing;
  const data = await request(`${planPath}/category_groups`, {
    method: 'POST',
    body: JSON.stringify({ category_group: { name } }),
  });
  plan.category_groups.push(data.category_group);
  return data.category_group;
}

async function ensureCategory(groupId, name) {
  const existing = plan.categories.find(
    (category) =>
      !category.deleted && category.category_group_id === groupId && category.name === name
  );
  if (existing) return existing;
  const data = await request(`${planPath}/categories`, {
    method: 'POST',
    body: JSON.stringify({ category: { category_group_id: groupId, name } }),
  });
  plan.categories.push(data.category);
  return data.category;
}

async function ensureAccount(name, type, balance = 0) {
  const existing = plan.accounts.find((account) => !account.deleted && account.name === name);
  if (existing) return existing;
  const data = await request(`${planPath}/accounts`, {
    method: 'POST',
    body: JSON.stringify({ account: { name, type, balance } }),
  });
  plan.accounts.push(data.account);
  return data.account;
}

function hasScenario(name) {
  return plan.transactions.some(
    (transaction) => !transaction.deleted && transaction.memo?.startsWith(`${PREFIX} ${name}`)
  );
}

async function createScenario(name, transaction) {
  if (hasScenario(name)) return { name, status: 'existing' };
  await request(`${planPath}/transactions`, {
    method: 'POST',
    body: JSON.stringify({
      transaction: {
        approved: true,
        cleared: 'cleared',
        memo: `${PREFIX} ${name}`,
        ...transaction,
      },
    }),
  });
  await refreshPlan();
  return { name, status: 'created' };
}

const primaryGroup = await ensureGroup(`${PREFIX} Primary`);
const duplicateGroupA = await ensureGroup(`${PREFIX} Duplicate A`);
const duplicateGroupB = await ensureGroup(`${PREFIX} Duplicate B`);
const food = await ensureCategory(primaryGroup.id, 'Food & household');
const refunds = await ensureCategory(primaryGroup.id, 'Refunds and reimbursements');
const unicode = await ensureCategory(primaryGroup.id, '🧪 Unicode Κατηγορία 日本語');
const duplicateA = await ensureCategory(duplicateGroupA.id, 'Same Name');
const duplicateB = await ensureCategory(duplicateGroupB.id, 'Same Name');
const extraCategory = await ensureCategory(primaryGroup.id, 'Hidden historical category');

const checking = await ensureAccount(`${PREFIX} Checking`, 'checking');
const savings = await ensureAccount(`${PREFIX} Savings`, 'savings');
const tracking = await ensureAccount(`${PREFIX} Tracking Asset`, 'otherAsset');
const creditCard = await ensureAccount(`${PREFIX} Credit Card`, 'creditCard');
const liability = await ensureAccount(`${PREFIX} Other Liability`, 'otherLiability');
const openingSavings = await ensureAccount(`${PREFIX} Closed Savings`, 'savings', 12_340);

const today = '2026-09-03';
const scenarios = [];

scenarios.push(
  await createScenario('ordinary transfer text', {
    account_id: checking.id,
    date: today,
    amount: -12_345,
    payee_name: 'Wire Transfer Service',
    category_id: food.id,
    memo: `${PREFIX} ordinary transfer text`,
    import_id: 'YNAB:-12345:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('additional category transaction', {
    account_id: checking.id,
    date: today,
    amount: -7_770,
    payee_name: 'Hidden History Merchant',
    category_id: extraCategory.id,
    import_id: 'YNAB:-7770:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('historical boundary transaction', {
    account_id: checking.id,
    date: '2021-09-04',
    amount: -44_440,
    payee_name: 'Future Merchant',
    category_id: food.id,
    import_id: 'YNAB:-44440:2021-09-04:1',
  })
);

scenarios.push(
  await createScenario('pure inflow split', {
    account_id: checking.id,
    date: today,
    amount: 30_000,
    payee_name: 'Split Refund Source',
    category_id: null,
    import_id: 'YNAB:30000:2026-09-03:1',
    subtransactions: [
      { amount: 20_000, category_id: refunds.id, payee_name: 'Refund A', memo: 'refund part' },
      { amount: 10_000, category_id: food.id, payee_name: 'Refund B', memo: 'rebate part' },
    ],
  })
);

scenarios.push(
  await createScenario('mixed direction split', {
    account_id: checking.id,
    date: today,
    amount: -75_000,
    payee_name: 'Mixed Direction Store',
    category_id: null,
    import_id: 'YNAB:-75000:2026-09-03:1',
    subtransactions: [
      { amount: -100_000, category_id: food.id, payee_name: 'Purchase', memo: 'purchase' },
      { amount: 25_000, category_id: refunds.id, payee_name: 'Refund', memo: 'refund' },
    ],
  })
);

scenarios.push(
  await createScenario('uncategorized split child', {
    account_id: checking.id,
    date: today,
    amount: -30_000,
    payee_name: 'Partially Categorized Store',
    category_id: null,
    import_id: 'YNAB:-30000:2026-09-03:1',
    subtransactions: [
      { amount: -10_000, category_id: null, payee_name: 'Unknown Item', memo: 'uncategorized' },
      { amount: -20_000, category_id: food.id, payee_name: 'Known Item', memo: 'categorized' },
    ],
  })
);

for (let occurrence = 1; occurrence <= 2; occurrence++) {
  scenarios.push(
    await createScenario(`duplicate equal transfer ${occurrence}`, {
      account_id: checking.id,
      date: today,
      amount: -33_000,
      payee_id: savings.transfer_payee_id,
      import_id: `YNAB:-33000:2026-09-03:${occurrence}`,
    })
  );
}

scenarios.push(
  await createScenario('transfer to tracking inside split', {
    account_id: checking.id,
    date: today,
    amount: -60_000,
    payee_name: 'Investment and groceries',
    category_id: null,
    import_id: 'YNAB:-60000:2026-09-03:1',
    subtransactions: [
      {
        amount: -40_000,
        payee_id: tracking.transfer_payee_id,
        category_id: null,
        memo: 'tracking transfer',
      },
      { amount: -20_000, category_id: food.id, payee_name: 'Grocer', memo: 'groceries' },
    ],
  })
);

scenarios.push(
  await createScenario('unicode multiline memo', {
    account_id: checking.id,
    date: today,
    amount: -9_876,
    payee_name: 'Café “Quoted”, Inc.',
    category_id: unicode.id,
    memo: `${PREFIX} unicode multiline memo\nSecond line, with comma\nThird “quoted” line ✅`,
    import_id: 'YNAB:-9876:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('duplicate category group A', {
    account_id: checking.id,
    date: today,
    amount: -11_000,
    payee_name: 'Duplicate A',
    category_id: duplicateA.id,
    import_id: 'YNAB:-11000:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('duplicate category group B', {
    account_id: checking.id,
    date: today,
    amount: -13_000,
    payee_name: 'Duplicate B',
    category_id: duplicateB.id,
    import_id: 'YNAB:-13000:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('credit card purchase', {
    account_id: creditCard.id,
    date: today,
    amount: -24_000,
    payee_name: 'Card Merchant',
    category_id: food.id,
    import_id: 'YNAB:-24000:2026-09-03:1',
  })
);

scenarios.push(
  await createScenario('credit card payment', {
    account_id: checking.id,
    date: today,
    amount: -24_000,
    payee_id: creditCard.transfer_payee_id,
    import_id: 'YNAB:-24000:2026-09-03:2',
  })
);

scenarios.push(
  await createScenario('liability transfer', {
    account_id: checking.id,
    date: today,
    amount: -200_000,
    payee_id: liability.transfer_payee_id,
    import_id: 'YNAB:-200000:2026-09-03:1',
  })
);

console.log(
  JSON.stringify(
    {
      plan: plan.name,
      accounts: [
        checking.name,
        savings.name,
        tracking.name,
        creditCard.name,
        liability.name,
        openingSavings.name,
      ],
      categories: [
        food.name,
        refunds.name,
        unicode.name,
        duplicateA.name,
        duplicateB.name,
        extraCategory.name,
      ],
      scenarios,
    },
    null,
    2
  )
);
