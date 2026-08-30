import JSZip from 'jszip';
import { DatabaseAdapter } from '../../database/interface.js';
import { asMilli, fromDecimal, ZERO_MILLI } from '../../money/index.js';
import { BudgetService } from '../budgets/index.js';
import { CategoryService } from '../categories/index.js';
import { AccountService } from '../accounts/index.js';
import { isCreditAccountType } from '../accounts/types.js';
import { MonthlyBudgetService } from '../monthly-budgets/index.js';
import { TransactionService } from '../transactions/index.js';
import { SplitService } from '../transactions/split-service.js';
import { ensureCategoryWithGroup } from '../transactions/category-helpers.js';
import {
  YNABImportConfig,
  YNABRegisterRow,
  YNABBudgetRow,
  YNABImportPreview,
  YNABImportResult,
  YNABImportCategorySummary,
} from './types.js';
import { CSVParser } from './csv-parser.js';
import { CurrencyParser } from './currency-parser.js';

import { createLogger } from '../../logger.js';

const debugLog = createLogger('services:import:ynab-import-service');

/** Matches DD/MM/YYYY and MM/DD/YYYY style dates with -, / or . separators. */
const AMBIGUOUS_DATE_REGEX = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
const SPLIT_MEMO_REGEX =
  /^\s*Split\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)(?:\s*[:\-–—]\s*|\s+)?([\s\S]*)$/i;

interface ParsedYNABArchive {
  registerRows: YNABRegisterRow[];
  budgetRows: YNABBudgetRow[];
}

interface YNABCategoryDescriptor {
  categoryGroup: string;
  category: string;
}

interface YNABSplitMarker {
  part: number;
  total: number;
  memo: string;
}

interface YNABSplitGroup {
  startIndex: number;
  rows: YNABRegisterRow[];
  markers: YNABSplitMarker[];
}

function categoryKey(category: YNABCategoryDescriptor): string {
  return `${category.categoryGroup}::${category.category}`;
}

function categoryDescriptor(
  row: Pick<YNABRegisterRow | YNABBudgetRow, 'CategoryGroup' | 'Category' | 'CategoryPath'>
): YNABCategoryDescriptor | null {
  let categoryGroup = (row.CategoryGroup || '').trim();
  let category = (row.Category || '').trim();
  const categoryPath = (row.CategoryPath || '').trim();

  if ((!categoryGroup || !category) && categoryPath) {
    const separator = categoryPath.indexOf(':');
    if (separator >= 0) {
      categoryGroup ||= categoryPath.slice(0, separator).trim();
      category ||= categoryPath.slice(separator + 1).trim();
    } else {
      category ||= categoryPath;
    }
  }

  if (!category) return null;

  if (
    categoryGroup.toLowerCase().includes('inflow') ||
    category.toLowerCase().includes('ready to assign')
  ) {
    return { categoryGroup: 'Income', category: 'Income' };
  }

  if (category.toLowerCase() === 'uncategorized') {
    return { categoryGroup: 'Uncategorized', category: 'Uncategorized' };
  }

  if (category.toLowerCase() === 'transfer' || category.toLowerCase() === 'transfers') {
    return { categoryGroup: 'Transfers', category: 'Transfers' };
  }

  return {
    categoryGroup: categoryGroup || 'Imported from YNAB',
    category,
  };
}

function parseSplitMarker(memo: string): YNABSplitMarker | null {
  const match = memo.match(SPLIT_MEMO_REGEX);
  if (!match) return null;

  const part = Number(match[1]);
  const total = Number(match[2]);
  if (
    !Number.isInteger(part) ||
    !Number.isInteger(total) ||
    total < 2 ||
    part < 1 ||
    part > total
  ) {
    return null;
  }

  return { part, total, memo: match[3].trim() };
}

function sameSplitContainer(left: YNABRegisterRow, right: YNABRegisterRow): boolean {
  // YNAB permits a different payee and category on every split line. Account,
  // date, contiguous position, and the complete 1/n sequence define the parent.
  return left.Account.trim() === right.Account.trim() && left.Date.trim() === right.Date.trim();
}

function distinctSplitPayees(rows: YNABRegisterRow[]): string[] {
  return [...new Set(rows.map((row) => row.Payee.trim()).filter(Boolean))];
}

function detectSplitGroups(registerRows: YNABRegisterRow[]): YNABSplitGroup[] {
  const groups: YNABSplitGroup[] = [];

  for (let index = 0; index < registerRows.length; index++) {
    const firstMarker = parseSplitMarker(registerRows[index].Memo || '');
    if (!firstMarker || firstMarker.part !== 1) continue;

    const rows = registerRows.slice(index, index + firstMarker.total);
    if (rows.length !== firstMarker.total) continue;

    const markers = rows.map((row) => parseSplitMarker(row.Memo || ''));
    const complete = markers.every(
      (marker, partIndex) =>
        marker?.part === partIndex + 1 &&
        marker.total === firstMarker.total &&
        sameSplitContainer(registerRows[index], rows[partIndex]) &&
        categoryDescriptor(rows[partIndex]) !== null
    );

    if (!complete) continue;

    groups.push({
      startIndex: index,
      rows,
      markers: markers as YNABSplitMarker[],
    });
    index += firstMarker.total - 1;
  }

  return groups;
}

function inspectYNABRows(
  registerRows: YNABRegisterRow[],
  budgetRows: YNABBudgetRow[]
): YNABImportPreview {
  const planCategoryKeys = new Set<string>([
    'Income::Income',
    'Uncategorized::Uncategorized',
    'Transfers::Transfers',
  ]);
  const exportedPlanCategoryKeys = new Set<string>();

  for (const row of budgetRows) {
    const descriptor = categoryDescriptor(row);
    if (descriptor) {
      const key = categoryKey(descriptor);
      planCategoryKeys.add(key);
      exportedPlanCategoryKeys.add(key);
    }
  }

  const missing = new Map<string, YNABImportCategorySummary>();
  for (const row of registerRows) {
    const descriptor = categoryDescriptor(row);
    if (!descriptor) continue;
    const key = categoryKey(descriptor);
    if (planCategoryKeys.has(key)) continue;

    const existing = missing.get(key);
    if (existing) {
      existing.transactionCount++;
    } else {
      missing.set(key, { ...descriptor, transactionCount: 1 });
    }
  }

  const splitGroups = detectSplitGroups(registerRows);

  return {
    registerRowCount: registerRows.length,
    accountCount: new Set(registerRows.map((row) => row.Account.trim()).filter(Boolean)).size,
    categoryCount: exportedPlanCategoryKeys.size + missing.size,
    missingCategories: [...missing.values()],
    splitTransactions: splitGroups.map((group) => ({
      account: group.rows[0].Account.trim(),
      date: group.rows[0].Date.trim(),
      payees: distinctSplitPayees(group.rows),
      partCount: group.rows.length,
    })),
  };
}

async function parseYNABArchive(
  zipData: ArrayBuffer | Uint8Array,
  csvParser: CSVParser
): Promise<ParsedYNABArchive> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipData);

  let registerData: string | undefined;
  let budgetData: string | undefined;

  for (const [filename, file] of Object.entries(zipContent.files)) {
    if (file.dir) continue;

    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.tsv')) continue;

    if (lowerName.includes('register') && !registerData) {
      registerData = await file.async('string');
      continue;
    }

    if ((lowerName.includes('budget') || lowerName.includes('plan')) && !budgetData) {
      budgetData = await file.async('string');
    }
  }

  if (!registerData) throw new Error('register CSV file not found in ZIP');
  if (!budgetData) throw new Error('budget CSV file not found in ZIP');

  return {
    registerRows: csvParser.parseRegisterCSV(registerData),
    budgetRows: csvParser.parseBudgetCSV(budgetData),
  };
}

export class YNABImportService {
  private budgetService: BudgetService;

  private categoryService: CategoryService;

  private accountService: AccountService;

  private monthlyBudgetService: MonthlyBudgetService;

  private transactionService: TransactionService;

  private splitService: SplitService;

  private csvParser: CSVParser;

  private currencyParser: CurrencyParser;

  /**
   * Whether ambiguous two-number date formats (01/05/2025) in the current
   * file read day-first (DD/MM) or month-first (MM/DD). Decided once per
   * import by detectAmbiguousDateOrder; day-first is the historical default.
   */
  private ambiguousDayFirst = true;

  constructor(private db: DatabaseAdapter) {
    this.budgetService = new BudgetService(db);
    this.categoryService = new CategoryService(db);
    this.accountService = new AccountService(db);
    this.monthlyBudgetService = new MonthlyBudgetService(db);
    this.transactionService = new TransactionService(db);
    this.splitService = new SplitService(db);
    this.csvParser = new CSVParser();
    this.currencyParser = new CurrencyParser();
  }

  static async inspectYNABZip(zipData: ArrayBuffer | Uint8Array): Promise<YNABImportPreview> {
    const { registerRows, budgetRows } = await parseYNABArchive(zipData, new CSVParser());
    return inspectYNABRows(registerRows, budgetRows);
  }

  async importYNABFromZip(
    zipData: ArrayBuffer | Uint8Array,
    config: YNABImportConfig
  ): Promise<number> {
    const result = await this.importYNABFromZipWithSummary(zipData, config);
    return result.budgetId;
  }

  async importYNABFromZipWithSummary(
    zipData: ArrayBuffer | Uint8Array,
    config: YNABImportConfig
  ): Promise<YNABImportResult> {
    const { registerRows, budgetRows } = await parseYNABArchive(zipData, this.csvParser);
    const preview = inspectYNABRows(registerRows, budgetRows);
    debugLog(`Parsed ${registerRows.length} register rows`);

    this.detectAmbiguousDateOrder(registerRows.map((row) => row.Date));
    debugLog(`Parsed ${budgetRows.length} budget rows`);

    // Create budget WITHOUT default categories since we're importing our own
    debugLog('Creating budget...');
    const budgetId = await this.budgetService.createBudget({
      name: config.budgetName,
      display_currency: config.currency,
      badge_icon: config.badgeIcon,
      number_format: config.numberFormat,
      create_default_categories: false,
    });
    // YNAB's Ready to Assign changes with the viewed month. Imported budgets
    // should preserve that expectation, while ordinary Budgero budgets keep
    // the application's cumulative default.
    this.budgetService.updateRtaMode(budgetId, 'monthly');
    debugLog(`Created budget with ID: ${budgetId}`);

    debugLog('Creating categories...');
    debugLog(`About to call createCategoryStructure with budgetId=${budgetId}`);
    const categories = this.createCategoryStructure(budgetId, budgetRows, registerRows);
    debugLog(`Created ${Object.keys(categories).length} categories`);

    // Check what's actually in the database after creation
    const finalGroups = this.categoryService.getAllCategoryGroups(budgetId);
    debugLog(`After createCategoryStructure, database has ${finalGroups.length} groups`);
    const groupCounts: Record<string, number> = {};
    for (const g of finalGroups) {
      groupCounts[g.Name] = (groupCounts[g.Name] || 0) + 1;
    }
    for (const [name, count] of Object.entries(groupCounts)) {
      if (count > 1) {
        debugLog(`DUPLICATE GROUP: "${name}" appears ${count} times`);
      }
    }

    debugLog('Creating accounts...');
    const accounts = await this.createAccounts(budgetId, registerRows, budgetRows, config.currency);
    debugLog(`Created ${Object.keys(accounts).length} accounts`);

    debugLog('Importing assignments...');
    this.importAssignments(budgetId, budgetRows, categories, config.numberFormat);
    debugLog('Assignments imported successfully');

    debugLog('Importing transactions...');
    const transactionSummary = await this.importTransactionsWithProperBalances(
      budgetId,
      registerRows,
      accounts,
      categories,
      config.numberFormat
    );
    debugLog('Transactions imported successfully');

    return {
      budgetId,
      summary: {
        registerRowsImported: registerRows.length,
        transactionsCreated: transactionSummary.transactionsCreated,
        missingCategoriesCreated: preview.missingCategories,
        splitTransactionsImported: transactionSummary.splitTransactionsImported,
      },
    };
  }

  private createCategoryStructure(
    budgetId: number,
    budgetRows: YNABBudgetRow[],
    registerRows: YNABRegisterRow[]
  ): Record<string, number> {
    const categories: Record<string, number> = {};
    const categoryGroups: Record<string, number> = {};

    debugLog('Starting createCategoryStructure');
    debugLog(`Processing ${budgetRows.length} budget rows`);

    // Resolve the Income and Uncategorized category ids UNCONDITIONALLY.
    // Every budget gets the system categories (Income/Uncategorized/Transfers)
    // at creation even with create_default_categories: false, so the old
    // only-if-group-missing branches never ran — categories['Income'] stayed
    // unset and every income row ("Inflow: Ready to Assign") imported as
    // Uncategorized, while "Ready to Assign" assignment rows were dropped.
    const incomeCategoryId = ensureCategoryWithGroup(
      this.categoryService,
      budgetId,
      'Income',
      'Income',
      ''
    );
    categories['Income::Income'] = incomeCategoryId;
    categories['Income'] = incomeCategoryId; // Fallback for compatibility

    const uncategorizedCategoryId = ensureCategoryWithGroup(
      this.categoryService,
      budgetId,
      'Uncategorized',
      'Uncategorized',
      ''
    );
    categories['Uncategorized::Uncategorized'] = uncategorizedCategoryId;
    categories['Uncategorized'] = uncategorizedCategoryId; // Fallback for compatibility

    // Then map all existing category groups (system ones included) so the
    // row loop below reuses them instead of creating duplicates.
    const existingGroups = this.categoryService.getAllCategoryGroups(budgetId);
    debugLog(`Found ${existingGroups.length} existing category groups`);
    for (const group of existingGroups) {
      categoryGroups[group.Name] = group.ID;
      debugLog(`Existing group: "${group.Name}" with ID ${group.ID}`);
    }

    let rowCount = 0;
    const seenInRows: Set<string> = new Set();
    for (const row of budgetRows) {
      rowCount++;
      if (row.CategoryGroup && row.Category) {
        let groupName = row.CategoryGroup.trim();
        let categoryName = row.Category.trim();

        const rowKey = `${row.Month}::${groupName}::${categoryName}`;
        if (!seenInRows.has(rowKey)) {
          seenInRows.add(rowKey);
          debugLog(
            `Row ${rowCount}: Month="${row.Month}", Group="${groupName}", Category="${categoryName}"`
          );
        }

        // Map YNAB special categories to Income
        if (
          groupName.toLowerCase().includes('inflow') ||
          categoryName.toLowerCase().includes('ready to assign')
        ) {
          debugLog(`Mapping "${groupName}::${categoryName}" to "Income::Income"`);
          groupName = 'Income';
          categoryName = 'Income';
        }

        if (!(groupName in categoryGroups)) {
          debugLog(
            `Row ${rowCount}: Creating category group: "${groupName}" (from Month: ${row.Month})`
          );
          const groupId = this.categoryService.addCategoryGroup(groupName, budgetId);
          categoryGroups[groupName] = groupId;
          debugLog(`Created group "${groupName}" with ID ${groupId}`);
        } else {
          debugLog(
            `Row ${rowCount}: Group "${groupName}" already in dictionary with ID ${categoryGroups[groupName]}`
          );
        }

        // Create category with unique key per group
        // Use groupName::categoryName as the key to allow same category names in different groups
        const categoryKey = `${groupName}::${categoryName}`;
        if (!(categoryKey in categories)) {
          const categoryId = this.categoryService.addCategory(
            categoryGroups[groupName],
            budgetId,
            categoryName,
            ''
          );
          categories[categoryKey] = categoryId;
        }
      }
    }

    // A YNAB register can reference categories absent from Plan.csv (for
    // example after historical category changes). Preserve those transactions
    // by creating the exact group/category pair instead of silently routing
    // them to Uncategorized.
    for (const row of registerRows) {
      const descriptor = categoryDescriptor(row);
      if (!descriptor) continue;

      const key = categoryKey(descriptor);
      if (categories[key]) continue;

      const categoryId = ensureCategoryWithGroup(
        this.categoryService,
        budgetId,
        descriptor.categoryGroup,
        descriptor.category,
        ''
      );
      categories[key] = categoryId;

      if (
        descriptor.category === 'Income' ||
        descriptor.category === 'Uncategorized' ||
        descriptor.category === 'Transfers'
      ) {
        categories[descriptor.category] = categoryId;
      }
    }

    debugLog('Final categoryGroups:', Object.keys(categoryGroups));
    debugLog(`Total category groups created: ${Object.keys(categoryGroups).length}`);

    return categories;
  }

  /**
   * Account names that YNAB treats as credit cards. The export carries no
   * account types, but every credit card gets a same-named category in the
   * "Credit Card Payments" group of the plan file.
   */
  private creditCardAccountNames(budgetRows: YNABBudgetRow[]): Set<string> {
    const names = new Set<string>();
    for (const row of budgetRows) {
      if (row.CategoryGroup?.trim().toLowerCase() === 'credit card payments' && row.Category) {
        names.add(row.Category.trim());
      }
    }
    return names;
  }

  private async createAccounts(
    budgetId: number,
    registerRows: YNABRegisterRow[],
    budgetRows: YNABBudgetRow[],
    currency: string
  ): Promise<Record<string, number>> {
    const accounts: Record<string, number> = {};
    const uniqueAccounts = new Set<string>();
    const creditCards = this.creditCardAccountNames(budgetRows);

    for (let i = 0; i < registerRows.length; i++) {
      const row = registerRows[i];
      if (i < 5) {
        // Debug first 5 rows
        debugLog(
          `Row ${i} - Account: '${row.Account}', Date: '${row.Date}', Payee: '${row.Payee}'`
        );
      }
      if (row.Account) {
        uniqueAccounts.add(row.Account.trim());
      }
    }
    debugLog(`Found ${uniqueAccounts.size} unique accounts from ${registerRows.length} rows`);

    for (const accountName of uniqueAccounts) {
      const isCreditCard = creditCards.has(accountName);
      const account = await this.accountService.createAccount(
        accountName,
        budgetId,
        isCreditCard ? 'Credit' : 'Checking',
        currency,
        ZERO_MILLI
      );
      accounts[accountName] = account.ID;
      if (isCreditCard) {
        debugLog(`Account '${accountName}' imported as a credit card`);
      }
    }

    return accounts;
  }

  private importAssignments(
    budgetId: number,
    budgetRows: YNABBudgetRow[],
    categories: Record<string, number>,
    numberFormat: string
  ): void {
    debugLog(`Starting assignment import with ${budgetRows.length} budget rows`);
    let createdAssignments = 0;

    for (let i = 0; i < budgetRows.length; i++) {
      const row = budgetRows[i];
      if (i < 5) {
        // Debug first 5 rows
        debugLog(
          `Assignment row ${i} - Month: '${row.Month}', Category: '${row.Category}', Group: '${row.CategoryGroup}', Assigned: '${row.Assigned}'`
        );
      }

      if (!row.Category || !row.Assigned || !row.Month) {
        continue;
      }

      let categoryName = row.Category.trim();
      let groupName = row.CategoryGroup.trim();

      if (
        row.CategoryGroup.toLowerCase().includes('ready to assign') ||
        row.CategoryGroup.toLowerCase().includes('to be assigned')
      ) {
        categoryName = 'Income';
        groupName = 'Income';
      }

      // Use the same key format as in createCategoryStructure
      const categoryKey = `${groupName}::${categoryName}`;
      const categoryId = categories[categoryKey] || categories[categoryName]; // Fallback for Income/Uncategorized
      if (!categoryId) {
        debugLog(
          `Category '${categoryName}' in group '${groupName}' not found, skipping assignment`
        );
        continue;
      }

      const assignedAmount = fromDecimal(
        this.currencyParser.parseYNABAmountAdvanced(row.Assigned, numberFormat)
      );
      if (assignedAmount === 0) {
        debugLog(`Zero assigned amount for category '${categoryName}', skipping`);
        continue;
      }

      const month = this.parseYNABMonth(row.Month);
      if (!month) {
        debugLog(`Could not parse month '${row.Month}', skipping`);
        continue;
      }

      debugLog(
        `Creating assignment - Category: '${categoryName}' (ID: ${categoryId}), Amount: ${assignedAmount.toFixed(2)}, Month: '${month}'`
      );

      this.monthlyBudgetService.upsertMonthlyAssignment(
        categoryId,
        assignedAmount,
        month,
        budgetId
      );
      createdAssignments++;
    }

    debugLog(`Assignment import complete - Created: ${createdAssignments}`);
  }

  private async importTransactionsWithProperBalances(
    budgetId: number,
    registerRows: YNABRegisterRow[],
    accounts: Record<string, number>,
    categories: Record<string, number>,
    numberFormat: string
  ): Promise<{ transactionsCreated: number; splitTransactionsImported: number }> {
    const incomeCategoryId = categories['Income'];
    const uncategorizedCategoryId = categories['Uncategorized'];
    const transfersCategoryId = ensureCategoryWithGroup(
      this.categoryService,
      budgetId,
      'Transfers',
      'Transfers',
      ''
    );
    const creditCardAccountIds = new Set(
      Object.values(accounts).filter((id) =>
        isCreditAccountType(this.accountService.getAccount(id).Type)
      )
    );

    type ImportUnit =
      | { kind: 'row'; row: YNABRegisterRow; originalIndex: number }
      | { kind: 'split'; group: YNABSplitGroup; originalIndex: number };

    const groupsByStart = new Map(
      detectSplitGroups(registerRows).map((group) => [group.startIndex, group])
    );
    const units: ImportUnit[] = [];

    for (let index = 0; index < registerRows.length; index++) {
      const splitGroup = groupsByStart.get(index);
      if (splitGroup) {
        units.push({ kind: 'split', group: splitGroup, originalIndex: index });
        index += splitGroup.rows.length - 1;
      } else {
        units.push({ kind: 'row', row: registerRows[index], originalIndex: index });
      }
    }

    // Sort transactions chronologically (oldest first), retaining register
    // order within a day so YNAB's running history remains deterministic.
    const sortedUnits = units.sort((a, b) => {
      const dateA = this.parseYNABDate(a.kind === 'row' ? a.row.Date : a.group.rows[0].Date);
      const dateB = this.parseYNABDate(b.kind === 'row' ? b.row.Date : b.group.rows[0].Date);
      if (!dateA || !dateB) return 0;
      return dateA.localeCompare(dateB) || a.originalIndex - b.originalIndex;
    });

    debugLog(`Processing ${sortedUnits.length} transaction units in chronological order`);

    let transactionsCreated = 0;
    let splitTransactionsImported = 0;

    for (let index = 0; index < sortedUnits.length; index++) {
      const unit = sortedUnits[index];

      if (unit.kind === 'split') {
        const created = await this.importSplitGroup(
          budgetId,
          unit.group,
          accounts,
          categories,
          numberFormat,
          incomeCategoryId,
          uncategorizedCategoryId
        );
        if (created) {
          transactionsCreated++;
          splitTransactionsImported++;
        }
      } else {
        const created = await this.importRegisterRow(
          budgetId,
          unit.row,
          unit.originalIndex,
          accounts,
          categories,
          numberFormat,
          incomeCategoryId,
          uncategorizedCategoryId,
          transfersCategoryId,
          creditCardAccountIds
        );
        if (created) transactionsCreated++;
      }

      if (index % 50 === 0) {
        debugLog(`Processed ${index + 1}/${sortedUnits.length} transaction units`);
      }
    }

    return { transactionsCreated, splitTransactionsImported };
  }

  private resolveTransactionCategory(
    row: YNABRegisterRow,
    inflow: number,
    categories: Record<string, number>,
    incomeCategoryId: number,
    uncategorizedCategoryId: number
  ): number {
    const descriptor = categoryDescriptor(row);
    if (!descriptor) return inflow > 0 ? incomeCategoryId : uncategorizedCategoryId;

    return (
      categories[categoryKey(descriptor)] ||
      categories[descriptor.category] ||
      uncategorizedCategoryId
    );
  }

  private async importSplitGroup(
    budgetId: number,
    group: YNABSplitGroup,
    accounts: Record<string, number>,
    categories: Record<string, number>,
    numberFormat: string,
    incomeCategoryId: number,
    uncategorizedCategoryId: number
  ): Promise<boolean> {
    const firstRow = group.rows[0];
    const accountId = accounts[firstRow.Account.trim()];
    const parsedDate = this.parseYNABDate(firstRow.Date);
    if (!accountId || !parsedDate) return false;

    const prepared = group.rows.map((row, index) => {
      const inflow = fromDecimal(
        this.currencyParser.parseYNABAmountAdvanced(row.Inflow, numberFormat)
      );
      const outflow = fromDecimal(
        this.currencyParser.parseYNABAmountAdvanced(row.Outflow, numberFormat)
      );
      return {
        row,
        inflow,
        outflow,
        categoryId: this.resolveTransactionCategory(
          row,
          inflow,
          categories,
          incomeCategoryId,
          uncategorizedCategoryId
        ),
        memo: group.markers[index].memo,
        payee: row.Payee.trim(),
      };
    });

    const inflow = asMilli(prepared.reduce((sum, part) => sum + Number(part.inflow), 0));
    const outflow = asMilli(prepared.reduce((sum, part) => sum + Number(part.outflow), 0));
    // YNAB exports only the child rows for a split, not separate parent
    // metadata. Keep every exported payee/memo on its own line and use a clear
    // generated parent memo rather than promoting the first child arbitrarily.
    const parentMemo = 'Imported YNAB split';
    const payee = '';

    try {
      const parentId = await this.transactionService.addTransaction(
        inflow,
        outflow,
        accountId,
        prepared[0].categoryId,
        budgetId,
        parsedDate,
        parentMemo,
        '',
        payee
      );

      await this.splitService.upsertSplits(
        parentId,
        prepared.map((part, orderIndex) => ({
          CategoryID: part.categoryId,
          Memo: part.memo,
          Payee: part.payee,
          InflowConverted: part.inflow,
          OutflowConverted: part.outflow,
          InflowNative: part.inflow,
          OutflowNative: part.outflow,
          OrderIndex: orderIndex,
        }))
      );

      return true;
    } catch (error) {
      throw new Error(
        `Failed to import ${group.rows.length}-part split transaction at register row ${group.startIndex + 1}: ${error}`
      );
    }
  }

  private async importRegisterRow(
    budgetId: number,
    row: YNABRegisterRow,
    rowIndex: number,
    accounts: Record<string, number>,
    categories: Record<string, number>,
    numberFormat: string,
    incomeCategoryId: number,
    uncategorizedCategoryId: number,
    transfersCategoryId: number,
    creditCardAccountIds: Set<number>
  ): Promise<boolean> {
    if (!row.Account || !row.Date) return false;

    const accountId = accounts[row.Account.trim()];
    if (!accountId) return false;

    const inflow = fromDecimal(
      this.currencyParser.parseYNABAmountAdvanced(row.Inflow, numberFormat)
    );
    const outflow = fromDecimal(
      this.currencyParser.parseYNABAmountAdvanced(row.Outflow, numberFormat)
    );

    let categoryId = this.resolveTransactionCategory(
      row,
      inflow,
      categories,
      incomeCategoryId,
      uncategorizedCategoryId
    );

    const parsedDate = this.parseYNABDate(row.Date);
    if (!parsedDate) {
      debugLog(`Skipping transaction with invalid date: ${row.Date}`);
      return false;
    }

    let memo = row.Memo;
    const rawPayee = (row.Payee || '').trim();
    const payeeLower = rawPayee.toLowerCase();
    let payee = rawPayee.length > 0 ? rawPayee : 'Budgero';
    let transferId = '';

    if (payeeLower.includes('starting balance')) {
      memo = 'Starting Balance';
      payee = 'Budgero';
      // A credit card's opening balance is existing debt, not budget money:
      // YNAB leaves it out of Ready to Assign, and so does Budgero (credit
      // opening balances use the Transfers category). Keep that parity here.
      if (creditCardAccountIds.has(accountId)) {
        categoryId = transfersCategoryId;
      }
    } else if (payeeLower.includes('reconciliation balance adjustment')) {
      payee = 'Budgero';
    }

    if (this.isTransfer(row)) {
      transferId = `transfer_${parsedDate}_${inflow + outflow}`;

      // YNAB transfer rows have an empty category, so the block above defaulted
      // categoryId to Uncategorized. Reset it to 0 so addTransaction assigns the
      // proper "Transfers" category — passing a non-zero, non-Transfers id would
      // trip its "user chose a custom category" heuristic and keep Uncategorized
      // on the source (outflow) leg.
      categoryId = 0;

      const currentAccount = row.Account.trim();
      if (inflow > 0) {
        // This is the receiving account
        if (rawPayee && payeeLower.includes('transfer')) {
          const payeeParts = rawPayee.split(':');
          if (payeeParts.length > 1) {
            const sourceAccount = payeeParts[1].trim();
            memo = `Transfer from ${sourceAccount} to ${currentAccount}`;
          } else {
            memo = `Transfer to ${currentAccount}`;
          }
        }
      } else if (outflow > 0) {
        // This is the sending account
        if (rawPayee && payeeLower.includes('transfer')) {
          const payeeParts = rawPayee.split(':');
          if (payeeParts.length > 1) {
            const destAccount = payeeParts[1].trim();
            memo = `Transfer from ${currentAccount} to ${destAccount}`;
          } else {
            memo = `Transfer from ${currentAccount}`;
          }
        }
      }
    }

    // Use transactions service to properly handle balances
    try {
      debugLog(
        `Importing row ${rowIndex} -> memo='${memo}' payee='${payee}' inflow=${inflow} outflow=${outflow}`
      );
      await this.transactionService.addTransaction(
        inflow,
        outflow,
        accountId,
        categoryId,
        budgetId,
        parsedDate,
        memo,
        transferId,
        payee
      );
      return true;
    } catch (error) {
      console.error(`DEBUG: Error adding transaction ${rowIndex}:`, error);
      throw new Error(`Failed to add transaction ${rowIndex}: ${error}`);
    }
  }

  private isTransfer(row: YNABRegisterRow): boolean {
    const payee = (row.Payee || '').toLowerCase();
    const category = (row.Category || '').toLowerCase();
    const memo = (row.Memo || '').toLowerCase();

    return payee.includes('transfer') || category.includes('transfer') || memo.includes('transfer');
  }

  /**
   * Two-number date formats (01/05/2025) are ambiguous between day-first
   * (DD/MM, e.g. European YNAB settings) and month-first (MM/DD, US
   * settings). One export file is always internally consistent, so scan all
   * dates once for a leading or middle component that can only be a day
   * (> 12) and lock the order in for the whole import.
   */
  private detectAmbiguousDateOrder(dates: (string | undefined)[]): void {
    let dayFirstEvidence = 0;
    let monthFirstEvidence = 0;

    for (const raw of dates) {
      const match = raw?.trim().match(AMBIGUOUS_DATE_REGEX);
      if (!match) continue;
      const first = Number(match[1]);
      const second = Number(match[2]);
      if (first > 12 && second <= 12) dayFirstEvidence++;
      else if (second > 12 && first <= 12) monthFirstEvidence++;
    }

    // Ties (no evidence either way) keep the historical day-first default.
    this.ambiguousDayFirst = monthFirstEvidence <= dayFirstEvidence;
    debugLog(
      `Ambiguous date order: ${this.ambiguousDayFirst ? 'day-first' : 'month-first'} ` +
        `(day-first evidence: ${dayFirstEvidence}, month-first evidence: ${monthFirstEvidence})`
    );
  }

  private parseYNABDate(dateStr: string): string {
    const trimmed = dateStr.trim();
    if (!trimmed) {
      return '';
    }

    const yearFirst = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    const yearLast = trimmed.match(AMBIGUOUS_DATE_REGEX);

    let year: string, month: string, day: string;
    if (yearFirst) {
      [, year, month, day] = yearFirst;
    } else if (yearLast) {
      if (this.ambiguousDayFirst) {
        [, day, month, year] = yearLast;
      } else {
        [, month, day, year] = yearLast;
      }
      // A month above 12 means the detected order is wrong for this row
      // (possible when a short file had no disambiguating dates) — swap.
      if (Number(month) > 12 && Number(day) <= 12) {
        [day, month] = [month, day];
      }
    } else {
      debugLog(`Could not parse date '${dateStr}' with any known format`);
      return '';
    }

    // Return in standard format (YYYY-MM-DD)
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private parseYNABMonth(monthStr: string): string {
    const monthAbbreviations: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };

    const trimmed = monthStr.trim();
    if (!trimmed) {
      return '';
    }

    const parts = trimmed.split(' ');
    if (parts.length !== 2) {
      debugLog(`Invalid month format '${monthStr}', expected 'Mon YYYY'`);
      return '';
    }

    const monthNum = monthAbbreviations[parts[0]];
    if (!monthNum) {
      debugLog(`Unknown month abbreviation '${parts[0]}' in '${monthStr}'`);
      return '';
    }

    const result = `${parts[1]}-${monthNum}`;
    debugLog(`Parsed month '${monthStr}' -> '${result}'`);
    return result;
  }
}
