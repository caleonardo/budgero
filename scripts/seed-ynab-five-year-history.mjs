#!/usr/bin/env node

const API_BASE = 'https://api.ynab.com/v1';
const PREFIX = '[Budgero 5Y]';
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
    const remaining = response.headers.get('x-rate-limit-remaining');
    throw new Error(
      `${payload?.error?.detail || payload?.error?.name || `YNAB API ${response.status}`} for ${init.method || 'GET'} ${path}${remaining ? ` (${remaining} requests remaining)` : ''}`
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

async function ensureAccount(name, type) {
  const existing = plan.accounts.find((account) => !account.deleted && account.name === name);
  if (existing) return existing;
  const data = await request(`${planPath}/accounts`, {
    method: 'POST',
    body: JSON.stringify({ account: { name, type, balance: 0 } }),
  });
  plan.accounts.push(data.account);
  return data.account;
}

function monthsBetween(startYear, startMonth, count) {
  return Array.from({ length: count }, (_, index) => {
    const absoluteMonth = startYear * 12 + startMonth - 1 + index;
    const year = Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    return `${year}-${String(month).padStart(2, '0')}`;
  });
}

function createRandom(seed = 0x5bd6_731a) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

const random = createRandom();
const varied = (base, spread) => Math.round((base + (random() * 2 - 1) * spread) / 10) * 10;
const date = (month, day) => {
  // YNAB's write API accepts dates no more than five years old. The first
  // three days of September 2021 are just outside that rolling window.
  const safeDay = month === '2021-09' ? Math.max(day, 4) : day;
  return `${month}-${String(safeDay).padStart(2, '0')}`;
};
const importId = (month, code, occurrence = 1) =>
  `BG5Y:${month.replace('-', '')}:${code}:${occurrence}`;

const fixedGroup = await ensureGroup(`${PREFIX} Fixed`);
const variableGroup = await ensureGroup(`${PREFIX} Variable`);
const savingsGroup = await ensureGroup(`${PREFIX} Savings`);
const irregularGroup = await ensureGroup(`${PREFIX} Irregular`);

const categories = {
  rent: await ensureCategory(fixedGroup.id, 'Housing'),
  utilities: await ensureCategory(fixedGroup.id, 'Energy & utilities'),
  phone: await ensureCategory(fixedGroup.id, 'Phone & internet'),
  insurance: await ensureCategory(fixedGroup.id, 'Insurance'),
  groceries: await ensureCategory(variableGroup.id, 'Groceries'),
  dining: await ensureCategory(variableGroup.id, 'Dining out'),
  transport: await ensureCategory(variableGroup.id, 'Transport'),
  subscriptions: await ensureCategory(variableGroup.id, 'Subscriptions'),
  household: await ensureCategory(variableGroup.id, 'Household supplies'),
  medical: await ensureCategory(irregularGroup.id, 'Medical'),
  clothing: await ensureCategory(irregularGroup.id, 'Clothing'),
  travel: await ensureCategory(irregularGroup.id, 'Travel'),
  emergency: await ensureCategory(savingsGroup.id, 'Emergency fund'),
  investing: await ensureCategory(savingsGroup.id, 'Investing'),
};
const income = plan.categories.find(
  (category) => !category.deleted && category.internal && /ready to assign/i.test(category.name)
);
if (!income) throw new Error('Could not find YNAB Inflow: Ready to Assign category');

const accounts = {
  checking: await ensureAccount(`${PREFIX} Household Checking`, 'checking'),
  savings: await ensureAccount(`${PREFIX} Emergency Savings`, 'savings'),
  credit: await ensureAccount(`${PREFIX} Rewards Card`, 'creditCard'),
  brokerage: await ensureAccount(`${PREFIX} Brokerage`, 'otherAsset'),
};

const months = monthsBetween(2021, 9, 60);
const transactions = [];
const assignments = [];

function add(month, code, transaction, occurrence = 1) {
  transactions.push({
    approved: true,
    cleared: occurrence % 4 === 0 ? 'uncleared' : 'cleared',
    memo: `${PREFIX} ${code}`,
    import_id: importId(month, code, occurrence),
    ...transaction,
  });
}

for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
  const month = months[monthIndex];
  const yearIndex = Math.floor(monthIndex / 12);
  const salary = Math.round((3_400_000 * 1.03 ** yearIndex) / 10) * 10;
  const rent = Math.round((2_050_000 * 1.04 ** yearIndex) / 10) * 10;
  const monthNumber = Number(month.slice(5, 7));
  const seasonalUtility =
    monthNumber <= 2 || monthNumber >= 11
      ? varied(310_000, 45_000)
      : monthNumber >= 6 && monthNumber <= 8
        ? varied(245_000, 35_000)
        : varied(175_000, 25_000);

  add(month, 'salary-a', {
    account_id: accounts.checking.id,
    date: date(month, 1),
    amount: salary,
    payee_name: 'Northstar Design Studio',
    category_id: income.id,
  });
  add(month, 'salary-b', {
    account_id: accounts.checking.id,
    date: date(month, 15),
    amount: salary,
    payee_name: 'Northstar Design Studio',
    category_id: income.id,
  });
  if (monthIndex % 3 === 0) {
    add(month, 'freelance', {
      account_id: accounts.checking.id,
      date: date(month, 21),
      amount: varied(620_000, 180_000),
      payee_name: 'Freelance Client',
      category_id: income.id,
    });
  }

  add(month, 'rent', {
    account_id: accounts.checking.id,
    date: date(month, 2),
    amount: -rent,
    payee_name: 'Oak Street Property',
    category_id: categories.rent.id,
  });
  add(month, 'utilities', {
    account_id: accounts.checking.id,
    date: date(month, 5),
    amount: -seasonalUtility,
    payee_name: 'City Energy & Water',
    category_id: categories.utilities.id,
  });
  add(month, 'phone', {
    account_id: accounts.credit.id,
    date: date(month, 8),
    amount: -varied(112_000, 8_000),
    payee_name: 'Signal Mobile',
    category_id: categories.phone.id,
  });
  add(month, 'insurance', {
    account_id: accounts.checking.id,
    date: date(month, 10),
    amount: -varied(185_000, 12_000),
    payee_name: 'Harbor Insurance',
    category_id: categories.insurance.id,
  });
  add(month, 'subscription', {
    account_id: accounts.credit.id,
    date: date(month, 12),
    amount: -varied(68_000, 5_000),
    payee_name: 'Streambox Bundle',
    category_id: categories.subscriptions.id,
  });

  for (const [occurrence, day] of [4, 11, 18, 25].entries()) {
    add(
      month,
      'groceries',
      {
        account_id: occurrence % 2 === 0 ? accounts.checking.id : accounts.credit.id,
        date: date(month, day),
        amount: -varied(245_000, 65_000),
        payee_name: occurrence % 2 === 0 ? 'Neighborhood Market' : 'Fresh Basket',
        category_id: categories.groceries.id,
      },
      occurrence + 1
    );
  }

  for (const [occurrence, day] of [6, 20].entries()) {
    add(
      month,
      'transport',
      {
        account_id: accounts.credit.id,
        date: date(month, day),
        amount: -varied(145_000, 50_000),
        payee_name: occurrence === 0 ? 'Metro Fuel' : 'City Transit',
        category_id: categories.transport.id,
      },
      occurrence + 1
    );
  }

  for (const [occurrence, day] of [9, 23].entries()) {
    add(
      month,
      'dining',
      {
        account_id: accounts.credit.id,
        date: date(month, day),
        amount: -varied(125_000, 55_000),
        payee_name: occurrence === 0 ? 'Corner Bistro' : 'Noodle House',
        category_id: categories.dining.id,
      },
      occurrence + 1
    );
  }

  const splitGroceries = varied(155_000, 30_000);
  const splitHousehold = varied(95_000, 25_000);
  add(month, 'split-shop', {
    account_id: accounts.checking.id,
    date: date(month, 26),
    amount: -(splitGroceries + splitHousehold),
    payee_name: 'Warehouse Club',
    category_id: null,
    subtransactions: [
      {
        amount: -splitGroceries,
        payee_name: 'Warehouse Club',
        category_id: categories.groceries.id,
        memo: 'food portion',
      },
      {
        amount: -splitHousehold,
        payee_name: 'Warehouse Club',
        category_id: categories.household.id,
        memo: 'household portion',
      },
    ],
  });

  if (monthIndex % 4 === 1) {
    add(month, 'medical', {
      account_id: accounts.credit.id,
      date: date(month, 19),
      amount: -varied(285_000, 140_000),
      payee_name: 'Family Health Clinic',
      category_id: categories.medical.id,
    });
  }
  if (monthIndex % 3 === 2) {
    add(month, 'clothing', {
      account_id: accounts.credit.id,
      date: date(month, 14),
      amount: -varied(240_000, 90_000),
      payee_name: 'Main Street Outfitters',
      category_id: categories.clothing.id,
    });
  }
  if (monthNumber === 7) {
    add(month, 'summer-trip', {
      account_id: accounts.credit.id,
      date: date(month, 22),
      amount: -varied(1_450_000, 220_000),
      payee_name: 'Summer Travel',
      category_id: categories.travel.id,
    });
  }
  if (monthIndex % 6 === 4) {
    const firstRefund = varied(95_000, 20_000);
    const secondRefund = varied(65_000, 15_000);
    add(month, 'split-refund', {
      account_id: accounts.checking.id,
      date: date(month, 24),
      amount: firstRefund + secondRefund,
      payee_name: 'Shared Expense Reimbursement',
      category_id: null,
      subtransactions: [
        {
          amount: firstRefund,
          payee_name: 'Roommate',
          category_id: categories.utilities.id,
          memo: 'utilities reimbursement',
        },
        {
          amount: secondRefund,
          payee_name: 'Roommate',
          category_id: categories.groceries.id,
          memo: 'groceries reimbursement',
        },
      ],
    });
  }

  add(month, 'save', {
    account_id: accounts.checking.id,
    date: date(month, 16),
    amount: -varied(520_000, 90_000),
    payee_id: accounts.savings.transfer_payee_id,
    category_id: null,
  });
  if (monthIndex % 3 === 0) {
    add(month, 'invest', {
      account_id: accounts.checking.id,
      date: date(month, 17),
      amount: -varied(360_000, 80_000),
      payee_id: accounts.brokerage.transfer_payee_id,
      category_id: categories.investing.id,
    });
  }

  // Pay the card after all card purchases for the month. YNAB creates the
  // matching inflow leg automatically because the card transfer payee is used.
  const cardOutflow = transactions
    .filter(
      (transaction) =>
        transaction.account_id === accounts.credit.id && transaction.date.startsWith(month)
    )
    .reduce((sum, transaction) => sum + Math.max(0, -transaction.amount), 0);
  add(month, 'card-payment', {
    account_id: accounts.checking.id,
    date: date(month, 28),
    amount: -cardOutflow,
    payee_id: accounts.credit.transfer_payee_id,
    category_id: null,
  });

  assignments.push({ month, category: categories.rent, amount: rent });
  if (monthIndex % 3 === 0) {
    assignments.push({ month, category: categories.groceries, amount: 1_150_000 });
  }
}

const chunkSize = 100;
let createdOrMatched = 0;
let duplicateImportIds = 0;
for (let start = 0; start < transactions.length; start += chunkSize) {
  const chunk = transactions.slice(start, start + chunkSize);
  const data = await request(`${planPath}/transactions`, {
    method: 'POST',
    body: JSON.stringify({ transactions: chunk }),
  });
  createdOrMatched += data.transaction_ids?.length ?? 0;
  duplicateImportIds += data.duplicate_import_ids?.length ?? 0;
  console.log(
    `Seeded transaction batch ${Math.floor(start / chunkSize) + 1}/${Math.ceil(transactions.length / chunkSize)}`
  );
}

await refreshPlan();
let assignmentsUpdated = 0;
let assignmentsUnchanged = 0;
let assignmentsOutsideWriteWindow = 0;
for (const assignment of assignments) {
  if (assignment.month === months[0]) {
    // The September 2021 month starts just outside YNAB's rolling five-year
    // write window even though transactions dated September 4 remain valid.
    assignmentsOutsideWriteWindow++;
    continue;
  }
  const month = plan.months.find((entry) => entry.month.startsWith(assignment.month));
  const category = month?.categories?.find((entry) => entry.id === assignment.category.id);
  if (category?.budgeted === assignment.amount) {
    assignmentsUnchanged++;
    continue;
  }
  await request(
    `${planPath}/months/${assignment.month}-01/categories/${encodeURIComponent(assignment.category.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ category: { budgeted: assignment.amount } }),
    }
  );
  assignmentsUpdated++;
}

console.log(
  JSON.stringify(
    {
      plan: plan.name,
      period: { firstMonth: months[0], lastMonth: months.at(-1), months: months.length },
      generatedTransactions: transactions.length,
      createdOrMatched,
      duplicateImportIds,
      assignmentTargets: assignments.length,
      assignmentsUpdated,
      assignmentsUnchanged,
      assignmentsOutsideWriteWindow,
      accounts: Object.values(accounts).map((account) => account.name),
      categoryCount: Object.keys(categories).length,
    },
    null,
    2
  )
);
