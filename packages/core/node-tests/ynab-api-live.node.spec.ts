import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  NodeSqlJsAdapter,
  YNABApiClient,
  YNABImportService,
  mapYNABAccountType,
  normalizeYNABMilliunitPrecision,
} from '../src/index.js';

const tokenFile = process.env.YNAB_ACCESS_TOKEN_FILE?.trim();
const token =
  process.env.YNAB_ACCESS_TOKEN?.trim() ||
  (tokenFile ? readFileSync(tokenFile, 'utf8').trim() : undefined);
const planId = process.env.YNAB_PLAN_ID?.trim();

describe.skipIf(!token || !planId)('YNAB API live reconciliation', () => {
  it('matches the disposable YNAB plan after a direct import', async () => {
    const snapshot = await new YNABApiClient(token as string).getPlan(planId as string);
    const adapter = await NodeSqlJsAdapter.create();

    try {
      const importer = new YNABImportService(adapter);
      const result = await importer.importYNABFromApiSnapshotWithSummary(snapshot, {
        spaceId: 'space_live_ynab_verification',
        budgetName: `${snapshot.plan.name} — API verification`,
        currency: snapshot.plan.currency_format.iso_code,
        numberFormat: snapshot.plan.currency_format.example_format,
        badgeIcon: 'HelpCircle',
      });

      const importedAccounts = adapter
        .prepare(
          `SELECT Name, Type, OnBudget, Archived, BalanceNative
           FROM accounts WHERE BudgetID = ? ORDER BY Name`
        )
        .all(result.budgetId) as {
        Name: string;
        Type: string;
        OnBudget: number;
        Archived: number;
        BalanceNative: number;
      }[];
      const importedByName = new Map(importedAccounts.map((account) => [account.Name, account]));
      const accountComparisons = snapshot.plan.accounts
        .filter((account) => !account.deleted)
        .map((account) => {
          const imported = importedByName.get(account.name);
          return {
            name: account.name,
            ynabBalance: account.balance,
            budgeroBalance: imported?.BalanceNative ?? null,
            ynabType: account.type,
            budgeroType: imported?.Type ?? null,
            ynabOnBudget: account.on_budget,
            budgeroOnBudget: imported ? Boolean(imported.OnBudget) : null,
            ynabClosed: account.closed,
            budgeroArchived: imported ? Boolean(imported.Archived) : null,
          };
        });

      const sourceTransactionNet = snapshot.plan.transactions
        .filter((transaction) => !transaction.deleted)
        .reduce(
          (sum, transaction) =>
            sum +
            normalizeYNABMilliunitPrecision(
              transaction.amount,
              snapshot.plan.currency_format.decimal_digits
            ),
          0
        );
      const importedTransactionNet = (
        adapter
          .prepare(
            `SELECT COALESCE(SUM(InflowNative - OutflowNative), 0) AS Net
             FROM transactions WHERE BudgetID = ?`
          )
          .get(result.budgetId) as { Net: number }
      ).Net;
      const debtBalanceAdjustmentNet =
        result.verification?.accounts.debtBalanceAdjustments.reduce(
          (sum, adjustment) => sum + adjustment.amount,
          0
        ) ?? 0;

      const sourceAssignments = snapshot.plan.months
        .filter((month) => !month.deleted)
        .flatMap((month) => month.categories || [])
        .filter((category) => !category.deleted)
        .reduce((sum, category) => sum + (category.budgeted || 0), 0);
      const importedAssignments = (
        adapter
          .prepare(
            `SELECT COALESCE(SUM(Amount), 0) AS Total
             FROM assignments WHERE BudgetID = ?`
          )
          .get(result.budgetId) as { Total: number }
      ).Total;

      const reconciliation = {
        source: {
          accounts: snapshot.plan.accounts.filter((account) => !account.deleted).length,
          categories: snapshot.plan.categories.filter((category) => !category.deleted).length,
          transactions: snapshot.plan.transactions.filter((transaction) => !transaction.deleted)
            .length,
          subtransactions: snapshot.plan.subtransactions.filter((child) => !child.deleted).length,
          transactionNet: sourceTransactionNet,
          assignments: sourceAssignments,
        },
        imported: {
          ...result.summary,
          accounts: importedAccounts.length,
          transactionNet: importedTransactionNet,
          assignments: importedAssignments,
        },
        accountComparisons,
      };
      console.log(`YNAB live reconciliation:\n${JSON.stringify(reconciliation, null, 2)}`);

      const ordinaryTransferText = adapter
        .prepare(
          `SELECT t.Payee, t.TransferID, c.Name AS Category
           FROM transactions t
           JOIN categories c ON c.ID = t.CategoryID
           WHERE t.BudgetID = ? AND t.Memo = '[Budgero Edge] ordinary transfer text'`
        )
        .get(result.budgetId);
      expect(ordinaryTransferText).toEqual({
        Payee: 'Wire Transfer Service',
        TransferID: null,
        Category: 'Food & household',
      });

      const duplicateTransferPairs = adapter
        .prepare(
          `SELECT TransferID, COUNT(*) AS LegCount
           FROM transactions
           WHERE BudgetID = ? AND (InflowNative = 33000 OR OutflowNative = 33000)
           GROUP BY TransferID`
        )
        .all(result.budgetId);
      expect(duplicateTransferPairs).toHaveLength(2);
      expect(duplicateTransferPairs).toEqual([
        expect.objectContaining({ LegCount: 2 }),
        expect.objectContaining({ LegCount: 2 }),
      ]);

      const duplicateCategories = adapter
        .prepare(
          `SELECT t.Memo, c.Name AS Category, cg.Name AS CategoryGroup
           FROM transactions t
           JOIN categories c ON c.ID = t.CategoryID
           JOIN category_groups cg ON cg.ID = c.CategoryGroupID
           WHERE t.BudgetID = ? AND t.Memo IN (
             '[Budgero Edge] duplicate category group A',
             '[Budgero Edge] duplicate category group B'
           )
           ORDER BY t.Memo`
        )
        .all(result.budgetId);
      expect(duplicateCategories).toEqual([
        {
          Memo: '[Budgero Edge] duplicate category group A',
          Category: 'Same Name',
          CategoryGroup: '[Budgero Edge] Duplicate A',
        },
        {
          Memo: '[Budgero Edge] duplicate category group B',
          Category: 'Same Name',
          CategoryGroup: '[Budgero Edge] Duplicate B',
        },
      ]);

      const uncategorizedSplit = adapter
        .prepare(
          `SELECT c.Name AS Category
           FROM transaction_splits s
           JOIN transactions t ON t.ID = s.TransactionID
           JOIN categories c ON c.ID = s.CategoryID
           WHERE t.BudgetID = ? AND s.Memo = 'uncategorized'`
        )
        .get(result.budgetId);
      expect(uncategorizedSplit).toEqual({ Category: 'Uncategorized' });

      const importedDebtLinks = adapter
        .prepare(
          `SELECT a.Name AS Account, a.Metadata, c.Name AS Category, cg.Name AS CategoryGroup
           FROM accounts a
           JOIN categories c ON c.ID = json_extract(a.Metadata, '$.linked_category_id')
           JOIN category_groups cg ON cg.ID = c.CategoryGroupID
           WHERE a.BudgetID = ? AND a.Name IN (
             '[Budgero Edge] Mortgage',
             '[Budgero Edge] Auto Loan'
           )
           ORDER BY a.Name`
        )
        .all(result.budgetId) as { Account: string; Category: string; CategoryGroup: string }[];
      expect(
        importedDebtLinks.map(({ Account, Category, CategoryGroup }) => ({
          Account,
          Category,
          CategoryGroup,
        }))
      ).toEqual([
        {
          Account: '[Budgero Edge] Auto Loan',
          Category: '[Budgero Edge] Auto Loan Payment',
          CategoryGroup: 'Bills',
        },
        {
          Account: '[Budgero Edge] Mortgage',
          Category: '[Budgero Edge] Mortgage Payment',
          CategoryGroup: 'Bills',
        },
      ]);
      expect(
        adapter
          .prepare(
            `SELECT COUNT(*) AS Count
             FROM categories c
             JOIN category_groups cg ON cg.ID = c.CategoryGroupID
             WHERE c.BudgetID = ? AND cg.Name = 'Liabilities'
               AND c.Name IN ('[Budgero Edge] Mortgage', '[Budgero Edge] Auto Loan')`
          )
          .get(result.budgetId)
      ).toEqual({ Count: 0 });

      for (const comparison of accountComparisons) {
        expect(comparison.budgeroBalance, `${comparison.name} balance`).toBe(
          comparison.ynabBalance
        );
        expect(comparison.budgeroType, `${comparison.name} type`).toBe(
          mapYNABAccountType(comparison.ynabType)
        );
        expect(comparison.budgeroOnBudget, `${comparison.name} on-budget status`).toBe(
          comparison.ynabOnBudget
        );
        expect(comparison.budgeroArchived, `${comparison.name} archived status`).toBe(
          comparison.ynabClosed
        );
      }
      expect(importedTransactionNet).toBe(sourceTransactionNet + debtBalanceAdjustmentNet);
      expect(importedAssignments).toBe(sourceAssignments);
      expect(result.summary.accountBalancesVerified).toBe(accountComparisons.length);
      expect(result.summary.readyToAssignMonthsVerified).toBe(
        snapshot.plan.months.filter((month) => !month.deleted).length
      );
      expect(result.verification?.source.categoryAssignmentsVerified).toBe(
        snapshot.plan.months
          .filter((month) => !month.deleted)
          .flatMap((month) => month.categories || [])
          .filter((category) => {
            const group = snapshot.plan.category_groups.find(
              (candidate) => candidate.id === category.category_group_id
            );
            return !category.deleted && !category.internal && !group?.internal;
          }).length
      );
      expect(result.verification?.readyToAssign.mismatches).toEqual([]);
    } finally {
      adapter.close();
    }
  }, 120_000);
});
