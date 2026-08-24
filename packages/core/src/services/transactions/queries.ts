import { DatabaseAdapter } from '../../database/interface.js';
import { getRow, allRows, run } from '../../database/sql.js';
import {
  Transaction,
  GetTransactionsByAccountRow,
  GetTransactionsByAccountAndMonthRow,
  GetAllTransactions,
  GetTransactionsByCategoryAndMonthRow,
  TransactionSplit,
  LabelListItem,
} from './types.js';
import type { Account } from '../accounts/types.js';
import type { Budget } from '../budgets/types.js';

/**
 * Shared column list for the detailed transaction-row SELECTs.
 * Expects aliases: t = transactions, c = categories, l = labels.
 * Callers that also join accounts append `a.Name as Account`.
 */
const TX_ROW_COLUMNS = `
        t.ID,
        t.Date,
        t.CategoryID,
        CASE WHEN EXISTS (SELECT 1 FROM transaction_splits s WHERE s.TransactionID = t.ID)
             THEN 'Split'
             ELSE c.Name END as Category,
        t.LabelID,
        l.Name as Label,
        l.Color as LabelColor,
        t.Memo,
        t.Payee,
        t.Reconciled,
        t.InflowConverted,
        t.OutflowConverted,
        t.InflowNative,
        t.OutflowNative,
        t.RunningBalanceConverted,
        t.RunningBalanceNative,
        t.ExchangeRate,
        t.ExchangeRateOverride,
        t.TransferID`;

/**
 * Excludes transactions that have split rows (those are queried through their
 * splits instead). Expects `t` as the transactions alias; the subquery uses
 * `s2` so it can sit alongside a `transaction_splits s` join.
 */
export const NO_SPLITS_FILTER = `AND NOT EXISTS (SELECT 1 FROM transaction_splits s2 WHERE s2.TransactionID = t.ID)`;

/**
 * TransactionQueries - All SQL queries for transaction operations
 * Extracted from the main queries file for better organization
 */
export class TransactionQueries {
  constructor(private db: DatabaseAdapter) {}

  /**
   * GetAccountAndBudget - Loads an account row and a budget row together.
   * The budget defaults to the account's own BudgetID; pass `budgetId` to load
   * a specific one. Either row may be undefined when missing.
   */
  getAccountAndBudget(accountId: number, budgetId?: number) {
    const account = getRow<Account>(this.db, 'SELECT * FROM accounts WHERE ID = ?', accountId);

    const effectiveBudgetId = budgetId ?? account?.BudgetID;
    let budget;
    if (effectiveBudgetId != null) {
      budget = getRow<Budget>(this.db, 'SELECT * FROM budgets WHERE ID = ?', effectiveBudgetId);
    }

    return { account, budget };
  }

  /**
   * UpdateAccountBalance - Updates both original and converted account balances
   * SQL: UPDATE accounts SET balance = balance + ? - ?, balance_converted = balance_converted + ? - ? WHERE id = ?
   */
  updateAccountBalance(
    accountId: number,
    inflowOriginal: number,
    outflowOriginal: number,
    inflowConverted: number,
    outflowConverted: number
  ): void {
    run(
      this.db,
      `
      UPDATE accounts 
      SET BalanceNative = BalanceNative + ? - ?,
          BalanceConverted = COALESCE(BalanceConverted, BalanceNative) + ? - ?
      WHERE ID = ?
    `,
      inflowOriginal,
      outflowOriginal,
      inflowConverted,
      outflowConverted,
      accountId
    );
  }

  /**
   * InsertTransactionWithBalance - Inserts a new transaction with running balance
   * Always stores both original and converted amounts (they may be the same if no conversion needed)
   * SQL: INSERT INTO transactions (...) VALUES (...) RETURNING id
   */
  insertTransactionWithBalance(
    inflow: number,
    outflow: number,
    inflowOriginal: number,
    outflowOriginal: number,
    categoryId: number,
    accountId: number,
    date: string,
    memo: string,
    payee: string | null,
    budgetId: number,
    runningBalance: number,
    runningBalanceOriginal: number,
    transferId?: string | null,
    exchangeRate?: number | null,
    labelId?: number | null,
    exchangeRateOverride = false
  ): number {
    const result = run(
      this.db,
      `
      INSERT INTO transactions (
        InflowConverted, OutflowConverted, InflowNative, OutflowNative, CategoryID, AccountID,
        Date, Memo, Payee, BudgetID, RunningBalanceConverted, RunningBalanceNative, TransferID,
        ExchangeRate, LabelID, ExchangeRateOverride
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      inflow,
      outflow,
      inflowOriginal,
      outflowOriginal,
      categoryId,
      accountId,
      date,
      memo,
      payee,
      budgetId,
      runningBalance,
      runningBalanceOriginal,
      transferId,
      exchangeRate ?? null,
      labelId ?? null,
      exchangeRateOverride ? 1 : 0
    );
    return Number(result.lastInsertRowid);
  }

  /**
   * GetAllTransactions - Gets all transactions for a budget
   * SQL: SELECT * FROM transactions WHERE budget_id = ? ORDER BY date DESC, id DESC
   */
  getAllTransactions(budgetId: number): GetAllTransactions[] {
    return allRows<GetAllTransactions>(
      this.db,
      `
      SELECT
        t.ID,
        t.AccountID as AccountId,
        a.Name as AccountName,
        t.Date,
        t.CategoryID,
        CASE WHEN EXISTS (SELECT 1 FROM transaction_splits s WHERE s.TransactionID = t.ID)
             THEN 'Split'
             ELSE c.Name END as Category,
        t.LabelID,
        l.Name as Label,
        l.Color as LabelColor,
        t.Memo,
        t.Payee,
        t.InflowConverted,
        t.OutflowConverted,
        t.RunningBalanceConverted,
        t.TransferID
      FROM transactions t
        LEFT JOIN categories c ON t.CategoryID = c.ID
        LEFT JOIN labels l ON t.LabelID = l.ID
        LEFT JOIN accounts a ON t.AccountID = a.ID
      WHERE t.BudgetID = ?
      ORDER BY t.Date DESC, t.ID DESC
    `,
      budgetId
    );
  }

  /**
   * GetAllTransactionsDetailed - Gets all transactions for a budget with full details
   * Returns same format as getTransactionsByAccount but for all accounts
   */
  getAllTransactionsDetailed(budgetId: number): GetTransactionsByAccountRow[] {
    return allRows<GetTransactionsByAccountRow>(
      this.db,
      `
      SELECT${TX_ROW_COLUMNS},
        t.AccountID,
        a.Name as Account
      FROM transactions t
      LEFT JOIN categories c ON t.CategoryID = c.ID
      LEFT JOIN labels l ON t.LabelID = l.ID
      LEFT JOIN accounts a ON t.AccountID = a.ID
      WHERE t.BudgetID = ?
      ORDER BY t.Date DESC, t.ID DESC
    `,
      budgetId
    );
  }

  /**
   * GetAllTransactionsAnalytics - Budget-wide rows with split parents expanded
   * into their split lines (category and amounts from the split; date, account,
   * payee, and label from the parent). Transfer split lines carry the same
   * synthetic TransferID as their mirror rows so both sides read as a transfer.
   * For aggregation views — registers keep getAllTransactionsDetailed.
   */
  getAllTransactionsAnalytics(budgetId: number): GetTransactionsByAccountRow[] {
    return allRows<GetTransactionsByAccountRow>(
      this.db,
      `
      SELECT
        t.ID as ID,
        t.Date as Date,
        s.CategoryID,
        c.Name as Category,
        t.LabelID,
        l.Name as Label,
        l.Color as LabelColor,
        COALESCE(s.Memo, t.Memo) as Memo,
        t.Payee,
        t.Reconciled,
        s.InflowConverted,
        s.OutflowConverted,
        s.InflowNative,
        s.OutflowNative,
        NULL as RunningBalanceConverted,
        NULL as RunningBalanceNative,
        t.ExchangeRate,
        t.ExchangeRateOverride,
        CASE WHEN s.TransferAccountID IS NOT NULL
             THEN 'split_transfer_' || t.ID || '_' || t.Date
             ELSE t.TransferID END as TransferID,
        t.AccountID,
        a.Name as Account
      FROM transaction_splits s
      JOIN transactions t ON t.ID = s.TransactionID
      LEFT JOIN categories c ON s.CategoryID = c.ID
      LEFT JOIN labels l ON t.LabelID = l.ID
      LEFT JOIN accounts a ON t.AccountID = a.ID
      WHERE t.BudgetID = ?
      UNION ALL
      SELECT
        t.ID as ID,
        t.Date as Date,
        t.CategoryID,
        c.Name as Category,
        t.LabelID,
        l.Name as Label,
        l.Color as LabelColor,
        t.Memo,
        t.Payee,
        t.Reconciled,
        t.InflowConverted,
        t.OutflowConverted,
        t.InflowNative,
        t.OutflowNative,
        t.RunningBalanceConverted,
        t.RunningBalanceNative,
        t.ExchangeRate,
        t.ExchangeRateOverride,
        t.TransferID,
        t.AccountID,
        a.Name as Account
      FROM transactions t
      LEFT JOIN categories c ON t.CategoryID = c.ID
      LEFT JOIN labels l ON t.LabelID = l.ID
      LEFT JOIN accounts a ON t.AccountID = a.ID
      WHERE t.BudgetID = ?
      ${NO_SPLITS_FILTER}
      ORDER BY Date DESC, ID DESC
    `,
      budgetId,
      budgetId
    );
  }

  /**
   * GetTransactionsByAccount - Gets transactions for a specific account with category names
   * SQL: Complex JOIN with categories and category_groups
   */
  getTransactionsByAccount(accountId: number): GetTransactionsByAccountRow[] {
    // Note: no accounts join here, so no `a.Name as Account` column.
    return allRows<GetTransactionsByAccountRow>(
      this.db,
      `
      SELECT${TX_ROW_COLUMNS}
      FROM transactions t
      LEFT JOIN categories c ON t.CategoryID = c.ID
      LEFT JOIN labels l ON t.LabelID = l.ID
      WHERE t.AccountID = ?
      ORDER BY t.Date DESC, t.ID DESC
    `,
      accountId
    );
  }

  /**
   * GetTransactionsByAccountAndMonth - Gets transactions for an account in a specific month
   * SQL: Complex JOIN with date filtering
   */
  getTransactionsByAccountAndMonth(
    accountId: number,
    month: string
  ): GetTransactionsByAccountAndMonthRow[] {
    return allRows<GetTransactionsByAccountAndMonthRow>(
      this.db,
      `
      SELECT${TX_ROW_COLUMNS},
        a.Name as Account
      FROM transactions t
      LEFT JOIN categories c ON t.CategoryID = c.ID
      LEFT JOIN labels l ON t.LabelID = l.ID
      LEFT JOIN accounts a ON t.AccountID = a.ID
      WHERE t.AccountID = ? AND strftime('%Y-%m', t.Date) = ?
      ORDER BY t.Date DESC, t.ID DESC
    `,
      accountId,
      month
    );
  }

  private getRunningBalanceColumn(
    col: 'RunningBalanceConverted' | 'RunningBalanceNative',
    accountId: number,
    date: string,
    id?: number
  ): number | null {
    const query = `
      SELECT ${col}
      FROM transactions
      WHERE AccountID = ?
        AND (Date < ? OR (Date = ? AND ID < COALESCE(?, 9223372036854775807)))
      ORDER BY Date DESC, ID DESC
      LIMIT 1
    `;
    const params = [accountId, date, date, id || null];
    const result = getRow<Record<string, number>>(this.db, query, ...params);
    return result?.[col] ?? null;
  }

  /**
   * GetRunningBalanceBefore - Gets the running balance before a specific transaction
   * SQL: SELECT running_balance FROM transactions WHERE account_id = ? AND (date < ? OR (date = ? AND id < COALESCE(?, 9223372036854775807))) ORDER BY date DESC, id DESC LIMIT 1
   */
  getRunningBalanceBefore(accountId: number, date: string, id?: number): number | null {
    return this.getRunningBalanceColumn('RunningBalanceConverted', accountId, date, id);
  }

  /**
   * GetRunningBalanceOriginalBefore - Gets the original currency running balance before a date/transaction
   */
  getRunningBalanceOriginalBefore(accountId: number, date: string, id?: number): number | null {
    return this.getRunningBalanceColumn('RunningBalanceNative', accountId, date, id);
  }

  private bumpFutureBalancesColumn(
    col: 'RunningBalanceConverted' | 'RunningBalanceNative',
    accountId: number,
    date: string,
    id: number,
    delta: number
  ): void {
    run(
      this.db,
      `
      UPDATE transactions
      SET ${col} = ${col} + ?
      WHERE AccountID = ? AND (Date > ? OR (Date = ? AND ID > ?))
    `,
      delta,
      accountId,
      date,
      date,
      id
    );
  }

  /**
   * BumpFutureBalances - Updates running balances for all transactions after a specific date
   * SQL: UPDATE transactions SET running_balance = running_balance + ? WHERE ...
   */
  bumpFutureBalances(accountId: number, date: string, id: number, delta: number): void {
    this.bumpFutureBalancesColumn('RunningBalanceConverted', accountId, date, id, delta);
  }

  /**
   * BumpFutureBalancesOriginal - Updates original running balances for all transactions after a specific date
   */
  bumpFutureBalancesOriginal(accountId: number, date: string, id: number, delta: number): void {
    this.bumpFutureBalancesColumn('RunningBalanceNative', accountId, date, id, delta);
  }

  private updateRunningBalanceColumn(
    col: 'RunningBalanceConverted' | 'RunningBalanceNative',
    id: number,
    runningBalance: number
  ): void {
    run(
      this.db,
      `
      UPDATE transactions
      SET ${col} = ?
      WHERE ID = ?
    `,
      runningBalance,
      id
    );
  }

  /**
   * UpdateRunningBalance - Updates running balance for a specific transaction
   * SQL: UPDATE transactions SET running_balance = ? WHERE id = ?
   */
  updateRunningBalance(id: number, runningBalance: number): void {
    this.updateRunningBalanceColumn('RunningBalanceConverted', id, runningBalance);
  }

  /**
   * UpdateRunningBalanceOriginal - Updates original running balance for a specific transaction
   * SQL: UPDATE transactions SET RunningBalanceNative = ? WHERE ID = ?
   */
  updateRunningBalanceOriginal(id: number, runningBalance: number): void {
    this.updateRunningBalanceColumn('RunningBalanceNative', id, runningBalance);
  }

  /**
   * GetTransactionByID - Gets a specific transaction by ID
   * SQL: SELECT * FROM transactions WHERE id = ?
   */
  getTransactionByID(id: number): Transaction | undefined {
    return getRow<Transaction>(
      this.db,
      `
      SELECT * FROM transactions 
      WHERE ID = ?
    `,
      id
    );
  }

  /**
   * GetTransactionsByCategory - Gets all transactions for a category
   * SQL: SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC
   */
  getTransactionsByCategory(categoryId: number): Transaction[] {
    return allRows<Transaction>(
      this.db,
      `
      SELECT * FROM transactions 
      WHERE CategoryID = ? 
      ORDER BY Date DESC
    `,
      categoryId
    );
  }

  /**
   * UpdateTransaction - Updates a transaction with both original and converted amounts
   * SQL: UPDATE transactions SET ... WHERE id = ?
   */
  updateTransaction(
    id: number,
    inflow: number,
    outflow: number,
    inflowOriginal: number,
    outflowOriginal: number,
    categoryId: number,
    accountId: number,
    date: string,
    memo: string,
    payee: string | null
  ): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET InflowConverted = ?, OutflowConverted = ?, InflowNative = ?, OutflowNative = ?, 
          CategoryID = ?, AccountID = ?, Date = ?, Memo = ?, Payee = ?
      WHERE ID = ?
    `,
      inflow,
      outflow,
      inflowOriginal,
      outflowOriginal,
      categoryId,
      accountId,
      date,
      memo,
      payee,
      id
    );
  }

  /**
   * UpdateTransactionWithOriginal - Updates a transaction when editing original amounts
   * This method updates both original and converted amounts, maintaining the currency conversion
   */
  updateTransactionWithOriginal(
    id: number,
    inflowOriginal: number,
    outflowOriginal: number,
    inflowConverted: number,
    outflowConverted: number,
    categoryId: number,
    accountId: number,
    date: string,
    memo: string,
    payee: string | null
  ): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET InflowNative = ?, OutflowNative = ?, 
          InflowConverted = ?, OutflowConverted = ?,
          CategoryID = ?, AccountID = ?, Date = ?, Memo = ?, Payee = ?
      WHERE ID = ?
    `,
      inflowOriginal,
      outflowOriginal,
      inflowConverted,
      outflowConverted,
      categoryId,
      accountId,
      date,
      memo,
      payee,
      id
    );
  }

  /**
   * Set or clear ConversionPending flag on a transaction
   */
  setConversionPending(id: number, pending: boolean): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET ConversionPending = ?
      WHERE ID = ?
    `,
      pending ? 1 : 0,
      id
    );
  }

  /**
   * SetExchangeRate - Updates the exchange rate and override flag for a transaction
   */
  setExchangeRate(id: number, rate: number | null, override: boolean): void {
    run(
      this.db,
      `
      UPDATE transactions
      SET ExchangeRate = ?, ExchangeRateOverride = ?
      WHERE ID = ?
    `,
      rate,
      override ? 1 : 0,
      id
    );
  }

  /**
   * RecalculateBalances - Recalculates all running balances for an account
   * This is needed after updating transactions to ensure balance consistency
   */
  recalculateBalances(accountId: number): void {
    // Get all transactions for the account ordered by date and ID
    const transactions = allRows<{
      ID: number;
      InflowConverted: number;
      OutflowConverted: number;
      InflowNative: number;
      OutflowNative: number;
    }>(
      this.db,
      `
      SELECT ID, InflowConverted, OutflowConverted, InflowNative, OutflowNative
      FROM transactions 
      WHERE AccountID = ?
      ORDER BY Date ASC, ID ASC
    `,
      accountId
    );

    let runningBalance = 0;
    let runningBalanceOriginal = 0;

    const updateStmt = this.db.prepare(`
      UPDATE transactions 
      SET RunningBalanceConverted = ?, RunningBalanceNative = ?
      WHERE ID = ?
    `);

    for (const tx of transactions) {
      runningBalance += (tx.InflowConverted ?? 0) - (tx.OutflowConverted ?? 0);
      runningBalanceOriginal += (tx.InflowNative ?? 0) - (tx.OutflowNative ?? 0);
      updateStmt.run(runningBalance, runningBalanceOriginal, tx.ID);
    }

    updateStmt.finalize();

    // BalanceConverted = Σ converted transactions + Σ journaled revaluation
    // deltas — a full recompute must not wipe rate true-ups.
    run(
      this.db,
      `
      UPDATE accounts
      SET BalanceNative = ?,
          BalanceConverted = ? + (
            SELECT COALESCE(SUM(DeltaConverted), 0)
            FROM account_revaluations
            WHERE AccountID = ?
          )
      WHERE ID = ?
    `,
      runningBalanceOriginal,
      runningBalance,
      accountId,
      accountId
    );
  }

  /**
   * DeleteTransaction - Deletes a transaction
   * SQL: DELETE FROM transactions WHERE id = ?
   */
  deleteTransaction(id: number): void {
    run(
      this.db,
      `
      DELETE FROM transactions 
      WHERE ID = ?
    `,
      id
    );
  }

  /**
   * MoveTransactionToAccount - Moves a transaction to a different account
   * SQL: UPDATE transactions SET account_id = ? WHERE id = ?
   */
  moveTransactionToAccount(id: number, accountId: number): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET AccountID = ? 
      WHERE ID = ?
    `,
      accountId,
      id
    );
  }

  /**
   * RecategorizeTransaction - Changes the category of a transaction
   * SQL: UPDATE transactions SET category_id = ? WHERE id = ?
   */
  recategorizeTransaction(id: number, categoryId: number): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET CategoryID = ? 
      WHERE ID = ?
    `,
      categoryId,
      id
    );
  }

  /**
   * ReassignTransactionCategories - Moves all transactions from one category to another
   * SQL: UPDATE transactions SET category_id = ? WHERE category_id = ?
   */
  reassignTransactionCategories(newCategoryId: number, oldCategoryId: number): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET CategoryID = ? 
      WHERE CategoryID = ?
    `,
      newCategoryId,
      oldCategoryId
    );
  }

  /**
   * GetTransactionsByTransferID - Gets transactions by transfer ID
   * SQL: SELECT * FROM transactions WHERE transfer_id = ? ORDER BY date DESC
   */
  getTransactionsByTransferID(transferId: string): Transaction[] {
    return allRows<Transaction>(
      this.db,
      `
      SELECT * FROM transactions 
      WHERE TransferID = ? 
      ORDER BY Date DESC
    `,
      transferId
    );
  }

  /**
   * Delete transactions by transfer ID (used to remove old split mirrors)
   */
  deleteTransactionsByTransferID(transferId: string): void {
    run(
      this.db,
      `
      DELETE FROM transactions WHERE TransferID = ?
    `,
      transferId
    );
  }

  /**
   * GetTransactionsByCategoryAndMonth - Gets transactions for a specific category and month from on-budget accounts only
   * SQL: Complex JOIN with categories and date filtering
   */
  getTransactionsByCategoryAndMonth(
    budgetId: number,
    categoryName: string,
    month: string
  ): GetTransactionsByCategoryAndMonthRow[] {
    const result = allRows<GetTransactionsByCategoryAndMonthRow>(
      this.db,
      `
      WITH split_rows AS (
        SELECT
          t.ID,
          t.Date,
          COALESCE(s.Memo, t.Memo) as Memo,
          t.Payee as Payee,
          t.LabelID as LabelID,
          l.Name as Label,
          l.Color as LabelColor,
          COALESCE(s.InflowConverted, 0) as InflowConverted,
          COALESCE(s.OutflowConverted, 0) as OutflowConverted,
          NULL as RunningBalanceConverted,
          t.AccountID,
          a.Name as Account,
          c.Name as Category,
          c.ID as CategoryID,
          t.ExchangeRate,
          t.ExchangeRateOverride
        FROM transaction_splits s
        JOIN transactions t ON t.ID = s.TransactionID
        LEFT JOIN categories c ON s.CategoryID = c.ID
        LEFT JOIN labels l ON t.LabelID = l.ID
        LEFT JOIN accounts a ON t.AccountID = a.ID
        WHERE t.BudgetID = ?
          AND c.Name = ?
          AND strftime('%Y-%m', t.Date) = ?
          AND a.OnBudget = TRUE
      ),
      base_rows AS (
        SELECT
          t.ID,
          t.Date,
          t.Memo,
          t.Payee as Payee,
          t.LabelID as LabelID,
          l.Name as Label,
          l.Color as LabelColor,
          t.InflowConverted,
          t.OutflowConverted,
          t.RunningBalanceConverted,
          t.AccountID,
          a.Name as Account,
          c.Name as Category,
          c.ID as CategoryID,
          t.ExchangeRate,
          t.ExchangeRateOverride
        FROM transactions t
        LEFT JOIN categories c ON t.CategoryID = c.ID
        LEFT JOIN labels l ON t.LabelID = l.ID
        LEFT JOIN accounts a ON t.AccountID = a.ID
        WHERE t.BudgetID = ?
          AND c.Name = ?
          AND strftime('%Y-%m', t.Date) = ?
          AND a.OnBudget = TRUE
          AND NOT EXISTS (SELECT 1 FROM transaction_splits s WHERE s.TransactionID = t.ID)
      )
      SELECT * FROM split_rows
      UNION ALL
      SELECT * FROM base_rows
      ORDER BY Date DESC, ID DESC
    `,
      budgetId,
      categoryName,
      month,
      budgetId,
      categoryName,
      month
    );
    const transactions = (result || []) as GetTransactionsByCategoryAndMonthRow[];
    return transactions;
  }

  getTransactionsByCategoryAndRange(
    budgetId: number,
    categoryId: number | null,
    startDate: string,
    endDate: string,
    accountIds?: number[]
  ): GetTransactionsByCategoryAndMonthRow[] {
    const hasAccountFilter = Array.isArray(accountIds) && accountIds.length > 0;
    const accountFilterClause = hasAccountFilter
      ? ` AND a.ID IN (${accountIds.map(() => '?').join(', ')})`
      : '';

    const splitCategoryCondition =
      categoryId === null ? 's.CategoryID IS NULL' : 's.CategoryID = ?';
    const baseCategoryCondition = categoryId === null ? 't.CategoryID IS NULL' : 't.CategoryID = ?';

    const query = `
      WITH split_rows AS (
        SELECT
          t.ID,
          t.Date,
          COALESCE(s.Memo, t.Memo) AS Memo,
          t.Payee AS Payee,
          t.LabelID AS LabelID,
          l.Name AS Label,
          l.Color AS LabelColor,
          COALESCE(s.InflowConverted, 0) AS InflowConverted,
          COALESCE(s.OutflowConverted, 0) AS OutflowConverted,
          NULL AS RunningBalanceConverted,
          t.AccountID,
          a.Name AS Account,
          COALESCE(c.Name, 'Uncategorized') AS Category,
          COALESCE(s.CategoryID, c.ID) AS CategoryID,
          t.ExchangeRate,
          t.ExchangeRateOverride
        FROM transaction_splits s
        JOIN transactions t ON t.ID = s.TransactionID
        LEFT JOIN categories c ON s.CategoryID = c.ID
        LEFT JOIN labels l ON t.LabelID = l.ID
        LEFT JOIN accounts a ON t.AccountID = a.ID
        WHERE t.BudgetID = ?
          AND DATE(t.Date) >= DATE(?)
          AND DATE(t.Date) <= DATE(?)
          ${accountFilterClause}
          AND ${splitCategoryCondition}
      ),
      base_rows AS (
        SELECT
          t.ID,
          t.Date,
          t.Memo,
          t.Payee AS Payee,
          t.LabelID AS LabelID,
          l.Name AS Label,
          l.Color AS LabelColor,
          t.InflowConverted,
          t.OutflowConverted,
          t.RunningBalanceConverted,
          t.AccountID,
          a.Name AS Account,
          COALESCE(c.Name, 'Uncategorized') AS Category,
          t.CategoryID AS CategoryID,
          t.ExchangeRate,
          t.ExchangeRateOverride
        FROM transactions t
        LEFT JOIN categories c ON t.CategoryID = c.ID
        LEFT JOIN labels l ON t.LabelID = l.ID
        LEFT JOIN accounts a ON t.AccountID = a.ID
        WHERE t.BudgetID = ?
          AND DATE(t.Date) >= DATE(?)
          AND DATE(t.Date) <= DATE(?)
          ${accountFilterClause}
          AND ${baseCategoryCondition}
          AND NOT EXISTS (SELECT 1 FROM transaction_splits s WHERE s.TransactionID = t.ID)
      )
      SELECT * FROM split_rows
      UNION ALL
      SELECT * FROM base_rows
      ORDER BY Date DESC, ID DESC;
    `;

    const params: (string | number)[] = [budgetId, startDate, endDate];
    if (hasAccountFilter && accountIds) {
      params.push(...accountIds);
    }
    if (categoryId !== null) {
      params.push(categoryId);
    }

    const params2: (string | number)[] = [budgetId, startDate, endDate];
    if (hasAccountFilter && accountIds) {
      params2.push(...accountIds);
    }
    if (categoryId !== null) {
      params2.push(categoryId);
    }

    return allRows<GetTransactionsByCategoryAndMonthRow>(this.db, query, ...params, ...params2);
  }

  listSavedPayees(
    budgetId: number
  ): { ID: number; Name: string; CreatedAt?: string; UpdatedAt?: string }[] {
    return allRows<{ ID: number; Name: string; CreatedAt?: string; UpdatedAt?: string }>(
      this.db,
      `
      SELECT ID, Name, CreatedAt, UpdatedAt
      FROM payees
      WHERE BudgetID = ?
      ORDER BY Name COLLATE NOCASE
    `,
      budgetId
    );
  }

  insertPayee(budgetId: number, name: string): number {
    const result = run(
      this.db,
      `
      INSERT INTO payees (BudgetID, Name, Metadata)
      VALUES (?, ?, '{}')
      ON CONFLICT(BudgetID, Name) DO NOTHING
    `,
      budgetId,
      name
    );
    return Number(result.lastInsertRowid) || 0;
  }

  deletePayee(budgetId: number, name: string): void {
    run(this.db, `DELETE FROM payees WHERE BudgetID = ? AND Name = ?`, budgetId, name);
  }

  /**
   * The category the payee was last filed under, for the add-transaction
   * form's category memory. Returns null when the payee is new or has no
   * usable history.
   *
   * Deliberately narrow about what counts as "history":
   *  - splits have no single category, so split parents are excluded
   *  - transfers aren't spending, so they're excluded
   *  - "Uncategorized" means the user never chose, so it isn't a memory
   * Payee matching is case-insensitive, matching how the payee directory
   * treats names.
   */
  getLastCategoryForPayee(
    budgetId: number,
    payee: string
  ): { CategoryID: number; CategoryName: string; Date: string } | null {
    const row = getRow<{ CategoryID: number; CategoryName: string; Date: string }>(
      this.db,
      `
      SELECT t.CategoryID AS CategoryID, c.Name AS CategoryName, t.Date AS Date
      FROM transactions t
      JOIN categories c ON c.ID = t.CategoryID
      WHERE t.BudgetID = ?
        AND t.Payee = ? COLLATE NOCASE
        AND t.CategoryID IS NOT NULL
        AND t.CategoryID > 0
        AND c.Name <> 'Uncategorized'
        AND (t.TransferID IS NULL OR t.TransferID = '')
        ${NO_SPLITS_FILTER}
      ORDER BY t.Date DESC, t.ID DESC
      LIMIT 1
    `,
      budgetId,
      payee
    );
    return row ?? null;
  }

  getPayeeUsageCounts(budgetId: number): { Name: string; UsageCount: number }[] {
    return allRows<{ Name: string; UsageCount: number }>(
      this.db,
      `
      SELECT Payee as Name, COUNT(*) as UsageCount
      FROM transactions
      WHERE BudgetID = ?
        AND Payee IS NOT NULL
        AND TRIM(Payee) <> ''
      GROUP BY Payee
      ORDER BY Payee COLLATE NOCASE
    `,
      budgetId
    );
  }

  updatePayeeValue(budgetId: number, oldName: string, newName: string | null): number {
    const result = run(
      this.db,
      `
      UPDATE transactions
      SET Payee = ?
      WHERE BudgetID = ? AND Payee = ?
    `,
      newName,
      budgetId,
      oldName
    );
    return result?.changes ?? 0;
  }

  listLabelsWithUsage(budgetId: number): LabelListItem[] {
    return allRows<LabelListItem>(
      this.db,
      `
      SELECT
        l.ID,
        l.Name,
        l.Color,
        COUNT(t.ID) as UsageCount
      FROM labels l
      LEFT JOIN transactions t
        ON t.LabelID = l.ID
       AND t.BudgetID = l.BudgetID
      WHERE l.BudgetID = ?
      GROUP BY l.ID, l.Name, l.Color
      ORDER BY l.Name COLLATE NOCASE
    `,
      budgetId
    );
  }

  getLabelById(
    id: number,
    budgetId: number
  ): { ID: number; BudgetID: number; Name: string; Color: string } | undefined {
    return getRow<{ ID: number; BudgetID: number; Name: string; Color: string }>(
      this.db,
      `
      SELECT ID, BudgetID, Name, Color
      FROM labels
      WHERE ID = ? AND BudgetID = ?
      LIMIT 1
    `,
      id,
      budgetId
    );
  }

  insertLabel(budgetId: number, name: string, color: string): number {
    const result = run(
      this.db,
      `
      INSERT INTO labels (BudgetID, Name, Color)
      VALUES (?, ?, ?)
    `,
      budgetId,
      name,
      color
    );
    return Number(result.lastInsertRowid) || 0;
  }

  updateLabel(id: number, budgetId: number, name: string, color: string): number {
    const result = run(
      this.db,
      `
      UPDATE labels
      SET Name = ?, Color = ?, UpdatedAt = datetime('now')
      WHERE ID = ? AND BudgetID = ?
    `,
      name,
      color,
      id,
      budgetId
    );
    return result?.changes ?? 0;
  }

  deleteLabel(id: number, budgetId: number): number {
    const result = run(
      this.db,
      `
      DELETE FROM labels
      WHERE ID = ? AND BudgetID = ?
    `,
      id,
      budgetId
    );
    return result?.changes ?? 0;
  }

  clearLabelFromTransactions(budgetId: number, labelId: number): number {
    const result = run(
      this.db,
      `
      UPDATE transactions
      SET LabelID = NULL
      WHERE BudgetID = ? AND LabelID = ?
    `,
      budgetId,
      labelId
    );
    return result?.changes ?? 0;
  }

  updateTransactionLabel(transactionId: number, labelId: number | null): number {
    const result = run(
      this.db,
      `
      UPDATE transactions
      SET LabelID = ?
      WHERE ID = ?
    `,
      labelId,
      transactionId
    );
    return result?.changes ?? 0;
  }

  /**
   * MarkTransactionsAsReconciled - Marks all transactions up to a date as reconciled
   * SQL: UPDATE transactions SET Reconciled = TRUE WHERE AccountID = ? AND Date <= ?
   */
  markTransactionsAsReconciled(accountId: number, date: string): void {
    run(
      this.db,
      `
      UPDATE transactions 
      SET Reconciled = TRUE 
      WHERE AccountID = ? AND Date <= ? AND Reconciled = FALSE
    `,
      accountId,
      date
    );
  }

  /**
   * UpdateAccountReconciledAt - Updates the reconciled_at timestamp for an account
   * SQL: UPDATE accounts SET reconciled_at = ? WHERE id = ?
   */
  updateAccountReconciledAt(accountId: number, reconciledAt: string): void {
    run(
      this.db,
      `
      UPDATE accounts 
      SET ReconciledAt = ? 
      WHERE ID = ?
    `,
      reconciledAt,
      accountId
    );
  }

  /**
   * Split helpers
   */
  deleteSplitsForTransaction(transactionId: number): void {
    run(this.db, `DELETE FROM transaction_splits WHERE TransactionID = ?`, transactionId);
  }

  insertSplitLine(split: Omit<TransactionSplit, 'ID'>): number {
    const result = run(
      this.db,
      `
      INSERT INTO transaction_splits (
        TransactionID, CategoryID, TransferAccountID, Memo,
        InflowConverted, OutflowConverted, InflowNative, OutflowNative, PairID, OrderIndex
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      split.TransactionID,
      split.CategoryID ?? null,
      split.TransferAccountID ?? null,
      split.Memo,
      split.InflowConverted,
      split.OutflowConverted,
      split.InflowNative ?? null,
      split.OutflowNative ?? null,
      split.PairID ?? null,
      split.OrderIndex ?? 0
    );
    return Number(result.lastInsertRowid);
  }

  getSplitsForTransaction(transactionId: number): TransactionSplit[] {
    return allRows<TransactionSplit>(
      this.db,
      `
      SELECT
        s.*,
        c.Name AS CategoryName,
        a.Name AS TransferAccountName
      FROM transaction_splits s
      LEFT JOIN categories c ON s.CategoryID = c.ID
      LEFT JOIN accounts a ON s.TransferAccountID = a.ID
      WHERE s.TransactionID = ?
      ORDER BY s.OrderIndex, s.ID
    `,
      transactionId
    );
  }

  /**
   * UpdateTransferMemosForAccountRename - Updates all transfer memos when an account is renamed
   * Replaces "Transfer from {oldName}" with "Transfer from {newName}"
   * and "to {oldName}" with "to {newName}" (for destination account in "Transfer from X to Y" format)
   */
  updateTransferMemosForAccountRename(budgetId: number, oldName: string, newName: string): number {
    // Two patterns: "Transfer from {name}" (source side) and " to {name}"
    // (destination in the "Transfer from X to Y" format — the leading space
    // keeps the match specific and avoids false positives).
    let changes = 0;
    for (const [pattern, replacement] of [
      [`Transfer from ${oldName}`, `Transfer from ${newName}`],
      [` to ${oldName}`, ` to ${newName}`],
    ]) {
      const result = run(
        this.db,
        `
        UPDATE transactions
        SET Memo = REPLACE(Memo, ?, ?)
        WHERE BudgetID = ?
          AND Memo LIKE ?
      `,
        pattern,
        replacement,
        budgetId,
        `%${pattern}%`
      );
      // Matches previous behavior: the returned count is the last pattern's.
      changes = result.changes || 0;
    }
    return changes;
  }
}
