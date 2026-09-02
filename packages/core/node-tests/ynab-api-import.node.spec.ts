import { describe, expect, it, vi } from 'vitest';
import {
  NodeSqlJsAdapter,
  YNABApiClient,
  YNABImportService,
  mapYNABAccountType,
  normalizeYNABApiSnapshot,
  normalizeYNABMilliunitPrecision,
  type YNABApiPlanSnapshot,
} from '../src/index.js';

const SPACE_ID = 'space_ynab_api_import';

function category(id: string, categoryGroupId: string, name: string, budgeted = 0) {
  return {
    id,
    category_group_id: categoryGroupId,
    name,
    hidden: false,
    deleted: false,
    internal: false,
    note: null,
    budgeted,
    activity: 0,
    balance: budgeted,
  };
}

function snapshotFixture(): YNABApiPlanSnapshot {
  const food = category('category-food', 'group-everyday', 'Food', 5_000);
  const income = {
    ...category('category-income', 'group-income', 'Ready to Assign'),
    internal: true,
  };

  return {
    serverKnowledge: 42,
    plan: {
      id: 'plan-edge-cases',
      name: 'YNAB API edge cases',
      last_modified_on: '2026-09-03T00:00:00Z',
      first_month: '2026-09-01',
      last_month: '2026-09-01',
      currency_format: {
        iso_code: 'USD',
        example_format: '123,456.78',
        decimal_digits: 2,
        decimal_separator: '.',
        symbol_first: true,
        group_separator: ',',
        currency_symbol: '$',
        display_symbol: true,
      },
      accounts: [
        {
          id: 'account-checking',
          name: 'Checking',
          type: 'checking',
          on_budget: true,
          closed: false,
          deleted: false,
          balance: -5_000,
          transfer_payee_id: 'payee-transfer-checking',
        },
        {
          id: 'account-savings',
          name: 'Tracking Savings',
          type: 'savings',
          on_budget: false,
          closed: true,
          deleted: false,
          balance: 10_000,
          transfer_payee_id: 'payee-transfer-savings',
        },
      ],
      category_groups: [
        {
          id: 'group-income',
          name: 'Internal Master Category',
          hidden: false,
          deleted: false,
          internal: true,
        },
        {
          id: 'group-everyday',
          name: 'Everyday',
          hidden: false,
          deleted: false,
          internal: false,
        },
      ],
      categories: [income, food],
      months: [
        {
          month: '2026-09-01',
          deleted: false,
          budgeted: 5_000,
          activity: -95_000,
          income: 100_000,
          to_be_budgeted: 95_000,
          categories: [income, food],
        },
      ],
      payees: [
        {
          id: 'payee-starting',
          name: 'Starting Balance',
          transfer_account_id: null,
          deleted: false,
        },
        {
          id: 'payee-store',
          name: 'Store',
          transfer_account_id: null,
          deleted: false,
        },
        {
          id: 'payee-transfer-checking',
          name: 'Transfer : Checking',
          transfer_account_id: 'account-checking',
          deleted: false,
        },
        {
          id: 'payee-transfer-savings',
          name: 'Transfer : Tracking Savings',
          transfer_account_id: 'account-savings',
          deleted: false,
        },
      ],
      transactions: [
        {
          id: 'transaction-start',
          account_id: 'account-checking',
          date: '2026-09-01',
          amount: 100_000,
          memo: null,
          cleared: 'cleared',
          approved: true,
          payee_id: 'payee-starting',
          category_id: 'category-income',
          transfer_account_id: null,
          transfer_transaction_id: null,
          deleted: false,
        },
        {
          id: 'transaction-transfer-split',
          account_id: 'account-checking',
          date: '2026-09-02',
          amount: -30_000,
          memo: 'Transfer plus groceries',
          cleared: 'cleared',
          approved: true,
          payee_id: 'payee-store',
          category_id: null,
          transfer_account_id: null,
          transfer_transaction_id: null,
          deleted: false,
        },
        {
          id: 'transaction-transfer-counterpart',
          account_id: 'account-savings',
          date: '2026-09-02',
          amount: 10_000,
          memo: 'Move to tracking',
          cleared: 'cleared',
          approved: true,
          payee_id: 'payee-transfer-checking',
          category_id: null,
          transfer_account_id: 'account-checking',
          transfer_transaction_id: null,
          deleted: false,
        },
        {
          id: 'transaction-mixed-split',
          account_id: 'account-checking',
          date: '2026-09-03',
          amount: -75_000,
          memo: 'Purchase with refund',
          cleared: 'uncleared',
          approved: true,
          payee_id: 'payee-store',
          category_id: null,
          transfer_account_id: null,
          transfer_transaction_id: null,
          deleted: false,
        },
      ],
      subtransactions: [
        {
          id: 'sub-transfer',
          transaction_id: 'transaction-transfer-split',
          amount: -10_000,
          memo: 'Move to tracking',
          payee_id: 'payee-transfer-savings',
          category_id: null,
          transfer_account_id: 'account-savings',
          deleted: false,
        },
        {
          id: 'sub-food',
          transaction_id: 'transaction-transfer-split',
          amount: -20_000,
          memo: 'Groceries',
          payee_id: 'payee-store',
          category_id: 'category-food',
          transfer_account_id: null,
          deleted: false,
        },
        {
          id: 'sub-purchase',
          transaction_id: 'transaction-mixed-split',
          amount: -100_000,
          memo: 'Purchase',
          payee_id: 'payee-store',
          category_id: 'category-food',
          transfer_account_id: null,
          deleted: false,
        },
        {
          id: 'sub-refund',
          transaction_id: 'transaction-mixed-split',
          amount: 25_000,
          memo: 'Refund',
          payee_id: 'payee-store',
          category_id: 'category-food',
          transfer_account_id: null,
          deleted: false,
        },
      ],
    },
  };
}

describe('YNAB API import', () => {
  it('calls the current plans API with a bearer token', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ data: { plans: [snapshotFixture().plan], server_knowledge: 1 } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );
    const client = new YNABApiClient('  secret-token  ', fetchMock, 'https://example.test/v1');

    const plans = await client.listPlans();

    expect(plans[0].name).toBe('YNAB API edge cases');
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/v1/plans', {
      method: 'GET',
      headers: { Authorization: 'Bearer secret-token', Accept: 'application/json' },
    });
  });

  it('invokes the default fetch with the browser global as its receiver', async () => {
    const fetchMock = vi.fn(function (this: unknown) {
      expect(this).toBe(globalThis);
      return Promise.resolve(
        new Response(JSON.stringify({ data: { plans: [] } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    try {
      await new YNABApiClient('secret-token', undefined, 'https://example.test/v1').listPlans();
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('maps YNAB account types to Budgero account semantics', () => {
    expect(mapYNABAccountType('creditCard')).toBe('Credit');
    expect(mapYNABAccountType('mortgage')).toBe('Mortgage');
    expect(mapYNABAccountType('otherLiability')).toBe('Loan');
    expect(mapYNABAccountType('otherAsset')).toBe('Other Asset');
    expect(normalizeYNABMilliunitPrecision(-12_345, 2)).toBe(-12_350);
    expect(normalizeYNABMilliunitPrecision(-9_876, 2)).toBe(-9_880);
  });

  it('normalizes API splits while marking only ordinary splits for preservation', () => {
    const snapshot = snapshotFixture();
    const normalized = normalizeYNABApiSnapshot(snapshot);
    const preview = YNABImportService.inspectYNABApiSnapshot(snapshot);

    expect(normalized.registerRows).toHaveLength(6);
    expect(normalized.accountSpecs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Checking', type: 'Checking', onBudget: true }),
        expect.objectContaining({
          name: 'Tracking Savings',
          type: 'Savings',
          onBudget: false,
          archived: true,
        }),
      ])
    );
    expect(preview.splitTransactions).toEqual([
      expect.objectContaining({ date: '2026-09-03', partCount: 2 }),
    ]);
  });

  it('imports accounts, assignments, transfer splits, and mixed-direction splits', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    try {
      const importer = new YNABImportService(adapter);
      const result = await importer.importYNABFromApiSnapshotWithSummary(snapshotFixture(), {
        spaceId: SPACE_ID,
        budgetName: 'Direct API import',
        currency: 'USD',
        numberFormat: '123,456.78',
        badgeIcon: 'HelpCircle',
      });

      expect(result.summary).toMatchObject({
        registerRowsImported: 6,
        transactionsCreated: 5,
        splitTransactionsImported: 1,
      });

      const accounts = adapter
        .prepare(
          `SELECT Name, Type, OnBudget, Archived, BalanceNative
           FROM accounts WHERE BudgetID = ? ORDER BY Name`
        )
        .all(result.budgetId);
      expect(accounts).toEqual([
        {
          Name: 'Checking',
          Type: 'Checking',
          OnBudget: 1,
          Archived: 0,
          BalanceNative: -5_000,
        },
        {
          Name: 'Tracking Savings',
          Type: 'Savings',
          OnBudget: 0,
          Archived: 1,
          BalanceNative: 10_000,
        },
      ]);

      const assignment = adapter
        .prepare(
          `SELECT a.Amount
           FROM assignments a
           JOIN categories c ON c.ID = a.CategoryId
           WHERE a.BudgetId = ? AND c.Name = 'Food' AND a.Month = '2026-09'`
        )
        .get(result.budgetId);
      expect(assignment).toEqual({ Amount: 5_000 });

      const transferPairs = adapter
        .prepare(
          `SELECT TransferID, COUNT(*) AS LegCount,
                  SUM(InflowNative) AS TotalInflow, SUM(OutflowNative) AS TotalOutflow
           FROM transactions
           WHERE BudgetID = ? AND TransferID IS NOT NULL AND TransferID != ''
           GROUP BY TransferID`
        )
        .all(result.budgetId);
      expect(transferPairs).toEqual([
        expect.objectContaining({ LegCount: 2, TotalInflow: 10_000, TotalOutflow: 10_000 }),
      ]);

      const mixedLines = adapter
        .prepare(
          `SELECT s.Memo, s.InflowNative, s.OutflowNative
           FROM transaction_splits s
           JOIN transactions t ON t.ID = s.TransactionID
           WHERE t.BudgetID = ? ORDER BY s.OrderIndex`
        )
        .all(result.budgetId);
      expect(mixedLines).toEqual([
        { Memo: 'Purchase', InflowNative: 0, OutflowNative: 100_000 },
        { Memo: 'Refund', InflowNative: 25_000, OutflowNative: 0 },
      ]);
    } finally {
      adapter.close();
    }
  });
});
