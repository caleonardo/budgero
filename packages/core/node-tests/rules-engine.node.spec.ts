/**
 * Table-driven coverage of the rules engine: every action type (apply + undo),
 * every condition field/operator, undo guard rails, and rule lifecycle helpers.
 *
 * Money in stored rule JSON and in transactions is integer milliunits
 * (1000 = 1.00), so all amounts below are written in milliunits.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalDateString } from '../src/utils/date';
import { NodeSqlJsAdapter, ServiceManager, DatabaseAdapter } from '../src';
import type { RuleAction, RuleCondition } from '../src/services/rules';

const M = (units: number) => units * 1000; // whole currency units → milliunits

describe('Rules engine (Node/sql.js)', () => {
  let adapter: DatabaseAdapter;
  let sm: ServiceManager;
  let services: ReturnType<ServiceManager['getServices']>;
  let budgetId: number;
  let accountId: number;
  let otherAccountId: number;
  let categoryId: number;
  let otherCategoryId: number;
  const today = getLocalDateString();

  beforeEach(async () => {
    adapter = await NodeSqlJsAdapter.create();
    sm = new ServiceManager();
    await sm.initialize(adapter);
    services = sm.getServices();

    budgetId = await services.budgets.createBudget({
      name: 'Rules Engine Budget',
      display_currency: 'USD',
      badge_icon: 'bolt',
      number_format: 'dollar',
      create_default_categories: true,
    });

    accountId = (
      await services.accounts.createAccount('Checking', budgetId, 'checking', 'USD', M(1000))
    ).ID;
    otherAccountId = (
      await services.accounts.createAccount('Savings', budgetId, 'savings', 'USD', M(1000))
    ).ID;

    const categories = services.categories.getAllCategories(budgetId);
    const spending = categories.filter((c: { Name: string }) => c.Name !== 'Income');
    categoryId = spending[0].ID;
    otherCategoryId = spending[1].ID;
  });

  /** Adds an outflow transaction and returns its ID. */
  async function addTx(opts: {
    inflow?: number;
    outflow?: number;
    memo?: string;
    payee?: string;
    account?: number;
    category?: number;
  }): Promise<number> {
    return services.transactions.addTransaction(
      opts.inflow ?? 0,
      opts.outflow ?? 0,
      opts.account ?? accountId,
      opts.category ?? categoryId,
      budgetId,
      today,
      opts.memo ?? '',
      '',
      opts.payee
    );
  }

  const tx = (id: number) => services.transactions.getTransactionByID(id)!;
  const net = (id: number) => Number(tx(id).InflowConverted) - Number(tx(id).OutflowConverted);

  async function runRule(
    conditions: RuleCondition[],
    actions: RuleAction[],
    transactionIds: number[]
  ) {
    const rule = services.rules.createRule({
      budgetId,
      name: 'engine test',
      conditions,
      actions,
    });
    const execution = await services.rules.executeRule(rule.id, {
      transactionIds,
      trigger: 'manual',
    });
    return { rule, execution };
  }

  const matchAll: RuleCondition[] = [{ field: 'memo', operator: 'contains', value: 'target' }];

  // ---------------------------------------------------------------------------
  // Actions: apply + undo
  // ---------------------------------------------------------------------------
  describe('actions apply and undo', () => {
    type ActionCase = {
      name: string;
      setup: () => Promise<number>;
      action: () => RuleAction;
      expectedField: string;
      assertApplied: (id: number) => void;
      assertRestored: (id: number) => void;
    };

    const cases: ActionCase[] = [
      {
        name: 'memo.set',
        setup: () => addTx({ outflow: M(10), memo: 'target original memo' }),
        action: () => ({ type: 'memo.set', payload: { memo: '  New Memo  ' } }),
        expectedField: 'memo',
        assertApplied: (id) => expect(tx(id).Memo).toBe('New Memo'),
        assertRestored: (id) => expect(tx(id).Memo).toBe('target original memo'),
      },
      {
        name: 'memo.remove_regex',
        setup: () => addTx({ outflow: M(10), memo: 'target   POS 12345 store' }),
        action: () => ({ type: 'memo.remove_regex', payload: { pattern: 'POS \\d+' } }),
        expectedField: 'memo',
        assertApplied: (id) => expect(tx(id).Memo).toBe('target store'),
        assertRestored: (id) => expect(tx(id).Memo).toBe('target   POS 12345 store'),
      },
      {
        name: 'category.set',
        setup: () => addTx({ outflow: M(10), memo: 'target' }),
        action: () => ({ type: 'category.set', payload: { categoryId: otherCategoryId } }),
        expectedField: 'categoryId',
        assertApplied: (id) => expect(tx(id).CategoryID).toBe(otherCategoryId),
        assertRestored: (id) => expect(tx(id).CategoryID).toBe(categoryId),
      },
      {
        name: 'payee.set',
        setup: () => addTx({ outflow: M(10), memo: 'target', payee: 'Old Payee' }),
        action: () => ({ type: 'payee.set', payload: { payee: 'New Payee' } }),
        expectedField: 'payee',
        assertApplied: (id) => expect(tx(id).Payee).toBe('New Payee'),
        assertRestored: (id) => expect(tx(id).Payee).toBe('Old Payee'),
      },
      {
        name: 'account.set',
        setup: () => addTx({ outflow: M(10), memo: 'target' }),
        action: () => ({ type: 'account.set', payload: { accountId: otherAccountId } }),
        expectedField: 'accountId',
        assertApplied: (id) => expect(tx(id).AccountID).toBe(otherAccountId),
        assertRestored: (id) => expect(tx(id).AccountID).toBe(accountId),
      },
      {
        name: 'amount.set (outflow → inflow sign flip)',
        setup: () => addTx({ outflow: M(10), memo: 'target' }),
        action: () => ({ type: 'amount.set', payload: { amount: M(25) } }),
        expectedField: 'amount',
        assertApplied: (id) => {
          expect(Number(tx(id).InflowConverted)).toBe(M(25));
          expect(Number(tx(id).OutflowConverted)).toBe(0);
        },
        assertRestored: (id) => {
          expect(Number(tx(id).InflowConverted)).toBe(0);
          expect(Number(tx(id).OutflowConverted)).toBe(M(10));
        },
      },
      {
        name: 'amount.set to zero',
        setup: () => addTx({ outflow: M(10), memo: 'target' }),
        action: () => ({ type: 'amount.set', payload: { amount: 0 } }),
        expectedField: 'amount',
        assertApplied: (id) => expect(net(id)).toBe(0),
        assertRestored: (id) => expect(net(id)).toBe(-M(10)),
      },
      {
        name: 'amount.adjust_value (negative delta deepens outflow)',
        setup: () => addTx({ outflow: M(10), memo: 'target' }),
        action: () => ({ type: 'amount.adjust_value', payload: { delta: -M(5) } }),
        expectedField: 'amount',
        assertApplied: (id) => expect(Number(tx(id).OutflowConverted)).toBe(M(15)),
        assertRestored: (id) => expect(Number(tx(id).OutflowConverted)).toBe(M(10)),
      },
      {
        name: 'amount.adjust_percent (+10% on inflow, rounds to milliunits)',
        setup: () => addTx({ inflow: 12345, memo: 'target' }),
        action: () => ({ type: 'amount.adjust_percent', payload: { percent: 10 } }),
        expectedField: 'amount',
        // 12345 * 1.1 = 13579.5 → Math.round → 13580
        assertApplied: (id) => expect(Number(tx(id).InflowConverted)).toBe(13580),
        assertRestored: (id) => expect(Number(tx(id).InflowConverted)).toBe(12345),
      },
    ];

    for (const c of cases) {
      it(`applies and undoes ${c.name}`, async () => {
        const id = await c.setup();
        const { execution } = await runRule(matchAll, [c.action()], [id]);

        expect(execution.errors).toEqual([]);
        expect(execution.matchedCount).toBe(1);
        expect(execution.run.status).toBe('completed');
        expect(execution.changes.map((ch) => ch.field)).toEqual([c.expectedField]);
        c.assertApplied(id);

        const undo = await services.rules.undoRun(execution.run.id);
        expect(undo.restoredTransactions).toBe(1);
        expect(undo.run.status).toBe('undone');
        c.assertRestored(id);
      });
    }

    it('applies multiple actions in one rule and undoes all of them together', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target raw', payee: 'p' });
      const { execution } = await runRule(
        matchAll,
        [
          { type: 'memo.set', payload: { memo: 'clean' } },
          { type: 'category.set', payload: { categoryId: otherCategoryId } },
          { type: 'payee.set', payload: { payee: 'Shop' } },
          { type: 'account.set', payload: { accountId: otherAccountId } },
          { type: 'amount.adjust_value', payload: { delta: -M(1) } },
        ],
        [id]
      );

      expect(execution.changes.map((c) => c.field).sort()).toEqual(
        ['accountId', 'amount', 'categoryId', 'memo', 'payee'].sort()
      );
      let t = tx(id);
      expect(t.Memo).toBe('clean');
      expect(t.CategoryID).toBe(otherCategoryId);
      expect(t.Payee).toBe('Shop');
      expect(t.AccountID).toBe(otherAccountId);
      expect(Number(t.OutflowConverted)).toBe(M(11));

      await services.rules.undoRun(execution.run.id);
      t = tx(id);
      expect(t.Memo).toBe('target raw');
      expect(t.CategoryID).toBe(categoryId);
      expect(t.Payee).toBe('p');
      expect(t.AccountID).toBe(accountId);
      expect(Number(t.OutflowConverted)).toBe(M(10));
    });

    it('chains amount actions sequentially within one rule', async () => {
      const id = await addTx({ outflow: M(100), memo: 'target' });
      await runRule(
        matchAll,
        [
          { type: 'amount.set', payload: { amount: -M(200) } },
          { type: 'amount.adjust_percent', payload: { percent: -50 } }, // → -100
          { type: 'amount.adjust_value', payload: { delta: -M(1) } }, // → -101
        ],
        [id]
      );
      expect(net(id)).toBe(-M(101));
    });

    it('records no change (matchedCount 0) when actions produce identical values', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const { execution } = await runRule(
        matchAll,
        [
          { type: 'memo.set', payload: { memo: 'target' } },
          { type: 'category.set', payload: { categoryId } },
          { type: 'amount.set', payload: { amount: -M(10) } },
        ],
        [id]
      );
      expect(execution.matchedCount).toBe(0);
      expect(execution.changes).toEqual([]);
      expect(execution.run.status).toBe('completed');
    });

    it('does not apply actions to non-matching transactions', async () => {
      const id = await addTx({ outflow: M(10), memo: 'unrelated' });
      const { execution } = await runRule(
        matchAll,
        [{ type: 'memo.set', payload: { memo: 'X' } }],
        [id]
      );
      expect(execution.evaluatedCount).toBe(1);
      expect(execution.matchedCount).toBe(0);
      expect(tx(id).Memo).toBe('unrelated');
    });

    it('does nothing when memo.remove_regex does not match', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target memo' });
      const { execution } = await runRule(
        matchAll,
        [{ type: 'memo.remove_regex', payload: { pattern: 'ZZZ' } }],
        [id]
      );
      expect(execution.matchedCount).toBe(0);
      expect(tx(id).Memo).toBe('target memo');
    });
  });

  // ---------------------------------------------------------------------------
  // Action payload validation → per-transaction errors, run status
  // ---------------------------------------------------------------------------
  describe('invalid action payloads', () => {
    const invalid: { name: string; action: RuleAction; message: string }[] = [
      {
        name: 'memo.set without string',
        action: { type: 'memo.set', payload: { memo: 42 as unknown as string } },
        message: 'memo.set action requires a memo string',
      },
      {
        name: 'memo.remove_regex without pattern',
        action: { type: 'memo.remove_regex', payload: { pattern: '' } },
        message: 'missing pattern payload',
      },
      {
        name: 'memo.remove_regex with invalid regex',
        action: { type: 'memo.remove_regex', payload: { pattern: '(' } },
        message: 'Invalid memo regex pattern',
      },
      {
        name: 'category.set non-numeric',
        action: { type: 'category.set', payload: { categoryId: 'abc' as unknown as number } },
        message: 'numeric categoryId',
      },
      {
        name: 'payee.set non-string',
        action: { type: 'payee.set', payload: { payee: 1 as unknown as string } },
        message: 'payee string',
      },
      {
        name: 'account.set non-numeric',
        action: { type: 'account.set', payload: { accountId: 'x' as unknown as number } },
        message: 'numeric accountId',
      },
      {
        name: 'amount.set non-numeric',
        action: { type: 'amount.set', payload: { amount: 'x' as unknown as number } },
        message: 'numeric amount',
      },
      {
        name: 'amount.adjust_value non-numeric',
        action: { type: 'amount.adjust_value', payload: { delta: 'x' as unknown as number } },
        message: 'numeric delta',
      },
      {
        name: 'amount.adjust_percent non-numeric',
        action: { type: 'amount.adjust_percent', payload: { percent: 'x' as unknown as number } },
        message: 'numeric percent',
      },
      {
        name: 'unknown action type',
        action: { type: 'bogus.action', payload: {} } as unknown as RuleAction,
        message: 'Unsupported rule action type: bogus.action',
      },
    ];

    for (const c of invalid) {
      it(`reports an error and marks the run failed for ${c.name}`, async () => {
        const id = await addTx({ outflow: M(10), memo: 'target' });
        const { execution } = await runRule(matchAll, [c.action], [id]);
        expect(execution.errors).toHaveLength(1);
        expect(execution.errors[0]).toContain(`Transaction ${id}:`);
        expect(execution.errors[0]).toContain(c.message);
        expect(execution.matchedCount).toBe(0);
        expect(execution.run.status).toBe('failed');
        expect(execution.run.notes).toContain(c.message);
        expect(tx(id).Memo).toBe('target');
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Conditions
  // ---------------------------------------------------------------------------
  describe('conditions', () => {
    type CondCase = {
      name: string;
      tx: Parameters<typeof addTx>[0];
      condition: RuleCondition;
      matches: boolean;
    };

    const text: CondCase[] = [
      // memo: contains
      {
        name: 'memo contains (case-insensitive default)',
        tx: { memo: 'WalMart #1' },
        condition: { field: 'memo', operator: 'contains', value: 'walmart' },
        matches: true,
      },
      {
        name: 'memo contains, case-sensitive mismatch',
        tx: { memo: 'WalMart #1' },
        condition: {
          field: 'memo',
          operator: 'contains',
          value: 'walmart',
          options: { caseSensitive: true },
        },
        matches: false,
      },
      {
        name: 'memo contains, case-sensitive match',
        tx: { memo: 'WalMart #1' },
        condition: {
          field: 'memo',
          operator: 'contains',
          value: 'WalMart',
          options: { caseSensitive: true },
        },
        matches: true,
      },
      {
        name: 'memo contains empty value never matches',
        tx: { memo: 'anything' },
        condition: { field: 'memo', operator: 'contains', value: '' },
        matches: false,
      },
      // memo: equals
      {
        name: 'memo equals (case-insensitive)',
        tx: { memo: 'Coffee' },
        condition: { field: 'memo', operator: 'equals', value: 'coffee' },
        matches: true,
      },
      {
        name: 'memo equals rejects partial',
        tx: { memo: 'Coffee shop' },
        condition: { field: 'memo', operator: 'equals', value: 'coffee' },
        matches: false,
      },
      {
        name: 'memo equals case-sensitive mismatch',
        tx: { memo: 'Coffee' },
        condition: {
          field: 'memo',
          operator: 'equals',
          value: 'coffee',
          options: { caseSensitive: true },
        },
        matches: false,
      },
      // memo: regex
      {
        name: 'memo regex match',
        tx: { memo: 'ORDER 12345' },
        condition: { field: 'memo', operator: 'regex', value: '^order \\d+$' },
        matches: true,
      },
      {
        name: 'memo regex case-sensitive mismatch',
        tx: { memo: 'ORDER 12345' },
        condition: {
          field: 'memo',
          operator: 'regex',
          value: '^order',
          options: { caseSensitive: true },
        },
        matches: false,
      },
      {
        name: 'memo regex no match',
        tx: { memo: 'ORDER abc' },
        condition: { field: 'memo', operator: 'regex', value: '^order \\d+$' },
        matches: false,
      },
      {
        name: 'memo invalid regex never matches',
        tx: { memo: 'anything' },
        condition: { field: 'memo', operator: 'regex', value: '(' },
        matches: false,
      },
      // payee
      {
        name: 'payee contains',
        tx: { memo: 'x', payee: 'Amazon Prime' },
        condition: { field: 'payee', operator: 'contains', value: 'amazon' },
        matches: true,
      },
      {
        name: 'payee equals',
        tx: { memo: 'x', payee: 'Amazon' },
        condition: { field: 'payee', operator: 'equals', value: 'amazon' },
        matches: true,
      },
      {
        name: 'payee regex',
        tx: { memo: 'x', payee: 'Amazon Prime' },
        condition: { field: 'payee', operator: 'regex', value: 'prime$' },
        matches: true,
      },
      {
        name: 'payee missing does not match',
        tx: { memo: 'x' },
        condition: { field: 'payee', operator: 'contains', value: 'a' },
        matches: false,
      },
      // unknown operator
      {
        name: 'unknown text operator never matches',
        tx: { memo: 'x' },
        condition: { field: 'memo', operator: 'startsWith' as never, value: 'x' },
        matches: false,
      },
    ];

    // Net amount for outflow 50 = -50000 milliunits; inflow 20 = +20000.
    const amount: CondCase[] = [
      {
        name: 'amount = (exact)',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '=', value: -M(50) },
        matches: true,
      },
      {
        name: 'amount = (mismatch)',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '=', value: -M(49) },
        matches: false,
      },
      {
        name: 'amount !=',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '!=', value: -M(49) },
        matches: true,
      },
      {
        name: 'amount != equal',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '!=', value: -M(50) },
        matches: false,
      },
      {
        name: 'amount > (inflow)',
        tx: { inflow: M(20) },
        condition: { field: 'amount', operator: '>', value: M(10) },
        matches: true,
      },
      {
        name: 'amount > not strictly',
        tx: { inflow: M(20) },
        condition: { field: 'amount', operator: '>', value: M(20) },
        matches: false,
      },
      {
        name: 'amount >= boundary',
        tx: { inflow: M(20) },
        condition: { field: 'amount', operator: '>=', value: M(20) },
        matches: true,
      },
      {
        name: 'amount < (outflow is negative)',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '<', value: 0 },
        matches: true,
      },
      {
        name: 'amount < not strictly',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '<', value: -M(50) },
        matches: false,
      },
      {
        name: 'amount <= boundary',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '<=', value: -M(50) },
        matches: true,
      },
      {
        name: 'amount with non-numeric value never matches',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '<', value: 'abc' },
        matches: false,
      },
      {
        name: 'amount unknown operator never matches',
        tx: { outflow: M(50) },
        condition: { field: 'amount', operator: '~' as never, value: 0 },
        matches: false,
      },
    ];

    const account: CondCase[] = [
      {
        name: 'account is',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'is', value: 0 /* replaced below */ },
        matches: true,
      },
      {
        name: 'account is (other)',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'is', value: -1 /* replaced below */ },
        matches: false,
      },
      {
        name: 'account is_not',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'is_not', value: -1 /* replaced below */ },
        matches: true,
      },
      {
        name: 'account is_not (same)',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'is_not', value: 0 /* replaced below */ },
        matches: false,
      },
      {
        name: 'account non-numeric value never matches',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'is', value: 'abc' },
        matches: false,
      },
      {
        name: 'account unknown operator never matches',
        tx: { memo: 'x' },
        condition: { field: 'account', operator: 'in' as never, value: 0 },
        matches: false,
      },
      {
        name: 'unknown field never matches',
        tx: { memo: 'x' },
        condition: { field: 'label' as never, operator: 'is', value: 1 },
        matches: false,
      },
    ];

    for (const c of [...text, ...amount, ...account]) {
      it(`${c.name} → ${c.matches ? 'match' : 'no match'}`, async () => {
        const id = await addTx({ ...c.tx, memo: c.tx.memo ?? 'x' });
        // Account cases refer to runtime IDs: value 0 = this account, -1 = other account.
        const condition: RuleCondition =
          c.condition.field === 'account' && typeof c.condition.value === 'number'
            ? { ...c.condition, value: c.condition.value === 0 ? accountId : otherAccountId }
            : c.condition;
        const { execution } = await runRule(
          [condition],
          [{ type: 'payee.set', payload: { payee: 'MATCHED' } }],
          [id]
        );
        expect(execution.errors).toEqual([]);
        expect(execution.matchedCount).toBe(c.matches ? 1 : 0);
        expect(tx(id).Payee ?? '').toBe(c.matches ? 'MATCHED' : (c.tx.payee ?? ''));
      });
    }

    it('requires ALL conditions to match (AND semantics)', async () => {
      const both = await addTx({ outflow: M(50), memo: 'target' });
      const memoOnly = await addTx({ outflow: M(5), memo: 'target' });
      const amountOnly = await addTx({ outflow: M(50), memo: 'other' });
      const { execution } = await runRule(
        [
          { field: 'memo', operator: 'contains', value: 'target' },
          { field: 'amount', operator: '<=', value: -M(50) },
        ],
        [{ type: 'payee.set', payload: { payee: 'MATCHED' } }],
        [both, memoOnly, amountOnly]
      );
      expect(execution.evaluatedCount).toBe(3);
      expect(execution.matchedCount).toBe(1);
      expect(tx(both).Payee).toBe('MATCHED');
      expect(tx(memoOnly).Payee ?? '').toBe('');
      expect(tx(amountOnly).Payee ?? '').toBe('');
    });

    it('scans every budget transaction when no transactionIds are given', async () => {
      const a = await addTx({ outflow: M(1), memo: 'target a' });
      const b = await addTx({ outflow: M(1), memo: 'target b' });
      const c = await addTx({ outflow: M(1), memo: 'nope' });
      const rule = services.rules.createRule({
        budgetId,
        name: 'scan',
        conditions: matchAll,
        actions: [{ type: 'payee.set', payload: { payee: 'MATCHED' } }],
      });
      const execution = await services.rules.executeRule(rule.id, { trigger: 'retroactive' });
      expect(execution.evaluatedCount).toBeGreaterThanOrEqual(3);
      expect(execution.matchedCount).toBe(2);
      expect(tx(a).Payee).toBe('MATCHED');
      expect(tx(b).Payee).toBe('MATCHED');
      expect(tx(c).Payee ?? '').toBe('');
      expect(execution.run.trigger).toBe('retroactive');
    });
  });

  // ---------------------------------------------------------------------------
  // Undo guard rails
  // ---------------------------------------------------------------------------
  describe('undo guard rails', () => {
    it('refuses to undo a run that has not completed', async () => {
      const rule = services.rules.createRule({
        budgetId,
        name: 'r',
        conditions: matchAll,
        actions: [{ type: 'memo.set', payload: { memo: 'x' } }],
      });
      const pending = services.rules.createRun({ ruleId: rule.id, trigger: 'manual' });
      await expect(services.rules.undoRun(pending.id)).rejects.toThrow(/has not completed/);
    });

    it('refuses to undo a failed run', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const { execution } = await runRule(
        matchAll,
        [{ type: 'amount.set', payload: { amount: 'x' as unknown as number } }],
        [id]
      );
      expect(execution.run.status).toBe('failed');
      await expect(services.rules.undoRun(execution.run.id)).rejects.toThrow(
        /Only completed runs can be undone/
      );
    });

    it('refuses to undo an already-undone run', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const { execution } = await runRule(
        matchAll,
        [{ type: 'memo.set', payload: { memo: 'x' } }],
        [id]
      );
      await services.rules.undoRun(execution.run.id);
      await expect(services.rules.undoRun(execution.run.id)).rejects.toThrow(
        /Only completed runs can be undone/
      );
    });

    it('only allows undoing the most recent completed run for a rule', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const rule = services.rules.createRule({
        budgetId,
        name: 'r',
        conditions: matchAll,
        actions: [{ type: 'amount.adjust_value', payload: { delta: -M(1) } }],
      });
      const first = await services.rules.executeRule(rule.id, { transactionIds: [id] });
      // Ensure a strictly later CompletedAt for the second run.
      await new Promise((r) => setTimeout(r, 5));
      const second = await services.rules.executeRule(rule.id, { transactionIds: [id] });
      expect(net(id)).toBe(-M(12));

      await expect(services.rules.undoRun(first.run.id)).rejects.toThrow(
        /most recent completed run/
      );

      // Undo in the correct order works and restores step by step.
      await services.rules.undoRun(second.run.id);
      expect(net(id)).toBe(-M(11));
      await services.rules.undoRun(first.run.id);
      expect(net(id)).toBe(-M(10));
    });

    it('marks a completed run with no recorded changes as undone', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const { execution } = await runRule(
        matchAll,
        [{ type: 'memo.set', payload: { memo: 'target' } }],
        [id]
      );
      expect(execution.changes).toEqual([]);
      const undo = await services.rules.undoRun(execution.run.id);
      expect(undo.restoredTransactions).toBe(0);
      expect(undo.run.status).toBe('undone');
      expect(undo.run.notes).toContain('no changes recorded');
    });

    it('restores each transaction once even when several fields changed', async () => {
      const a = await addTx({ outflow: M(10), memo: 'target a' });
      const b = await addTx({ outflow: M(10), memo: 'target b' });
      const { execution } = await runRule(
        matchAll,
        [
          { type: 'memo.set', payload: { memo: 'z' } },
          { type: 'category.set', payload: { categoryId: otherCategoryId } },
        ],
        [a, b]
      );
      expect(execution.changes).toHaveLength(4);
      const undo = await services.rules.undoRun(execution.run.id);
      expect(undo.restoredTransactions).toBe(2);
      expect(tx(a).Memo).toBe('target a');
      expect(tx(b).CategoryID).toBe(categoryId);
    });

    it('rolls back from oldValue when change metadata is missing', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target', payee: 'Old' });
      const rule = services.rules.createRule({
        budgetId,
        name: 'r',
        conditions: matchAll,
        actions: [],
      });
      const run = services.rules.createRun({
        ruleId: rule.id,
        trigger: 'manual',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      // Simulate a run whose changes were logged without metadata (e.g. autofill/legacy).
      services.rules.logRunChange({
        runId: run.id,
        ruleId: rule.id,
        transactionId: id,
        actionType: 'memo',
        field: 'memo',
        oldValue: 'target',
        newValue: 'changed',
      });
      services.rules.logRunChange({
        runId: run.id,
        ruleId: rule.id,
        transactionId: id,
        actionType: 'category',
        field: 'categoryId',
        oldValue: categoryId,
        newValue: otherCategoryId,
      });
      services.rules.logRunChange({
        runId: run.id,
        ruleId: rule.id,
        transactionId: id,
        actionType: 'account',
        field: 'accountId',
        oldValue: accountId,
        newValue: otherAccountId,
      });
      services.rules.logRunChange({
        runId: run.id,
        ruleId: rule.id,
        transactionId: id,
        actionType: 'payee',
        field: 'payee',
        oldValue: 'Old',
        newValue: 'New',
      });
      services.rules.logRunChange({
        runId: run.id,
        ruleId: rule.id,
        transactionId: id,
        actionType: 'amount',
        field: 'amount',
        oldValue: -M(10),
        newValue: -M(20),
      });
      // Apply the "new" state directly so undo has something to restore.
      await services.transactions.updateTransaction(
        id,
        0,
        M(20),
        otherAccountId,
        otherCategoryId,
        today,
        'changed',
        'New'
      );

      const undo = await services.rules.undoRun(run.id);
      expect(undo.restoredTransactions).toBe(1);
      const t = tx(id);
      expect(t.Memo).toBe('target');
      expect(t.CategoryID).toBe(categoryId);
      expect(t.AccountID).toBe(accountId);
      expect(t.Payee).toBe('Old');
      expect(net(id)).toBe(-M(10));
    });
  });

  // ---------------------------------------------------------------------------
  // Rule lifecycle & run bookkeeping
  // ---------------------------------------------------------------------------
  describe('rule lifecycle', () => {
    it('lists rules ordered by run order and supports delete/restore round-trip', async () => {
      const b = services.rules.createRule({
        budgetId,
        name: 'B',
        conditions: matchAll,
        actions: [],
        runOrder: 2,
      });
      const a = services.rules.createRule({
        budgetId,
        name: 'A',
        conditions: matchAll,
        actions: [],
        runOrder: 1,
      });
      expect(services.rules.listRules(budgetId).map((r) => r.id)).toEqual([a.id, b.id]);

      const snapshot = services.rules.getRule(b.id);
      services.rules.deleteRule(b.id);
      expect(services.rules.listRules(budgetId).map((r) => r.id)).toEqual([a.id]);
      expect(() => services.rules.getRule(b.id)).toThrow(/not found/);

      const restored = services.rules.restoreRule(snapshot);
      expect(restored.id).toBe(b.id);
      expect(restored.name).toBe('B');
      expect(restored.runOrder).toBe(2);
      expect(services.rules.listRules(budgetId).map((r) => r.id)).toEqual([a.id, b.id]);

      // restoreRule is idempotent (upsert)
      services.rules.restoreRule({ ...snapshot, name: 'B2' });
      expect(services.rules.getRule(b.id).name).toBe('B2');
    });

    it('rejects restoring a snapshot without an id', () => {
      expect(() =>
        services.rules.restoreRule({ id: 0 } as unknown as Parameters<
          typeof services.rules.restoreRule
        >[0])
      ).toThrow(/without an ID/);
    });

    it('marks one_time rules consumed after execution and updates lastRunAt', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const rule = services.rules.createRule({
        budgetId,
        name: 'once',
        mode: 'one_time',
        conditions: matchAll,
        actions: [{ type: 'memo.set', payload: { memo: 'x' } }],
      });
      expect(rule.oneTimeConsumed).toBe(false);
      expect(rule.lastRunAt ?? null).toBeNull();
      await services.rules.executeRule(rule.id, { transactionIds: [id] });
      const after = services.rules.getRule(rule.id);
      expect(after.oneTimeConsumed).toBe(true);
      expect(after.lastRunAt).toBeTruthy();
    });

    it('lists runs newest-first with pagination and exposes run changes', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const rule = services.rules.createRule({
        budgetId,
        name: 'r',
        conditions: matchAll,
        actions: [{ type: 'amount.adjust_value', payload: { delta: -M(1) } }],
      });
      const r1 = await services.rules.executeRule(rule.id, { transactionIds: [id] });
      const r2 = await services.rules.executeRule(rule.id, { transactionIds: [id] });
      const r3 = await services.rules.executeRule(rule.id, { transactionIds: [id] });

      const all = services.rules.listRuns(rule.id);
      expect(all.map((r) => r.id)).toEqual([r3.run.id, r2.run.id, r1.run.id]);
      expect(services.rules.listRuns(rule.id, 1).map((r) => r.id)).toEqual([r3.run.id]);
      expect(services.rules.listRuns(rule.id, 1, 1).map((r) => r.id)).toEqual([r2.run.id]);

      const changes = services.rules.listRunChanges(r1.run.id);
      expect(changes).toHaveLength(1);
      expect(changes[0].field).toBe('amount');
      expect(changes[0].actionType).toBe('amount.adjust_value');
      expect(changes[0].oldValue).toBe(-M(10));
      expect(changes[0].newValue).toBe(-M(11));
      expect(changes[0].metadata).toMatchObject({
        delta: -M(1),
        oldOutflow: M(10),
        newOutflow: M(11),
      });
      expect(services.rules.getRunChange(changes[0].id).id).toBe(changes[0].id);
    });

    it('rejects execution of a rule that does not exist', async () => {
      // The run row references the rule via FK, so this fails before getRule is reached.
      await expect(services.rules.executeRule(999_999)).rejects.toThrow();
    });

    it('throws for unknown run / run change ids', () => {
      expect(() => services.rules.getRun(999_999)).toThrow(/not found/);
      expect(() => services.rules.getRunChange(999_999)).toThrow(/not found/);
    });

    it('logs autofill applications as completed runs with per-rule changes', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const r1 = services.rules.createRule({
        budgetId,
        name: 'auto1',
        mode: 'autofill',
        conditions: matchAll,
        actions: [],
      });
      const r2 = services.rules.createRule({
        budgetId,
        name: 'auto2',
        mode: 'autofill',
        conditions: matchAll,
        actions: [],
      });

      const result = services.rules.logAutofillApplication({
        transactionId: id,
        changes: [
          {
            ruleId: r1.id,
            ruleName: 'auto1',
            field: 'memo',
            value: 'auto memo',
            actionType: 'memo.set',
          },
          {
            ruleId: r1.id,
            ruleName: 'auto1',
            field: 'categoryId',
            value: otherCategoryId,
            actionType: 'category.set',
          },
          {
            ruleId: r2.id,
            ruleName: 'auto2',
            field: 'payee',
            value: 'Auto Payee',
            actionType: 'payee.set',
          },
        ],
      });

      expect(result.runs).toHaveLength(2);
      expect(result.runs.every((r) => r.status === 'completed' && r.trigger === 'autofill')).toBe(
        true
      );
      expect(result.changes).toHaveLength(3);
      const r1Run = result.runs.find((r) => r.ruleId === r1.id)!;
      expect(
        services.rules
          .listRunChanges(r1Run.id)
          .map((c) => c.field)
          .sort()
      ).toEqual(['categoryId', 'memo']);
      expect(services.rules.getRule(r1.id).lastRunAt).toBeTruthy();
    });

    it('returns empty result for an autofill application with no changes', async () => {
      const id = await addTx({ outflow: M(10), memo: 'target' });
      const result = services.rules.logAutofillApplication({ transactionId: id, changes: [] });
      expect(result.runs).toEqual([]);
      expect(result.changes).toEqual([]);
    });
  });
});
