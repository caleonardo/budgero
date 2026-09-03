import type {
  YNABApiPlanSnapshot,
  YNABApiSubtransaction,
  YNABApiTransaction,
  YNABBudgetRow,
  YNABImportAccountSpec,
  YNABImportReadyToAssignSpec,
  YNABRegisterRow,
} from './types.js';

export interface NormalizedYNABApiImport {
  registerRows: YNABRegisterRow[];
  budgetRows: YNABBudgetRow[];
  accountSpecs: YNABImportAccountSpec[];
  readyToAssignSpecs: YNABImportReadyToAssignSpec[];
}

export function normalizeYNABMilliunitPrecision(value: number, decimalDigits: number): number {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Invalid YNAB milliunit amount: ${value}`);
  }
  const supportedDigits = Math.max(0, Math.min(3, Math.trunc(decimalDigits)));
  const increment = 10 ** (3 - supportedDigits);
  return Math.sign(value) * Math.round(Math.abs(value) / increment) * increment;
}

function milliToDecimal(value: number): string {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Invalid YNAB milliunit amount: ${value}`);
  }
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  const whole = Math.floor(absolute / 1000);
  const fraction = String(absolute % 1000).padStart(3, '0');
  return `${sign}${whole}.${fraction}`;
}

export function mapYNABAccountType(type: string): string {
  switch (type) {
    case 'checking':
      return 'Checking';
    case 'savings':
      return 'Savings';
    case 'cash':
      return 'Cash';
    case 'creditCard':
    case 'lineOfCredit':
      return 'Credit';
    case 'mortgage':
      return 'Mortgage';
    case 'autoLoan':
    case 'studentLoan':
    case 'medicalDebt':
    case 'personalLoan':
    case 'otherDebt':
    case 'otherLiability':
      return 'Loan';
    case 'otherAsset':
      return 'Other Asset';
    default:
      return 'Checking';
  }
}

function transferIdFor(transaction: YNABApiTransaction): string | undefined {
  if (!transaction.transfer_transaction_id) return undefined;
  return `ynab_transfer_${[transaction.id, transaction.transfer_transaction_id].sort().join('_')}`;
}

export function normalizeYNABApiSnapshot(snapshot: YNABApiPlanSnapshot): NormalizedYNABApiImport {
  const { plan } = snapshot;
  const normalizeAmount = (value: number) =>
    normalizeYNABMilliunitPrecision(value, plan.currency_format.decimal_digits);
  const accountsById = new Map(plan.accounts.map((account) => [account.id, account]));
  const groupsById = new Map(plan.category_groups.map((group) => [group.id, group]));
  const categoriesById = new Map(plan.categories.map((category) => [category.id, category]));
  const payeesById = new Map(plan.payees.map((payee) => [payee.id, payee]));
  const childrenByTransactionId = new Map<string, YNABApiSubtransaction[]>();

  for (const child of plan.subtransactions) {
    if (child.deleted) continue;
    const children = childrenByTransactionId.get(child.transaction_id) || [];
    children.push(child);
    childrenByTransactionId.set(child.transaction_id, children);
  }

  const categoryFields = (categoryId: string | null) => {
    const category = categoryId ? categoriesById.get(categoryId) : undefined;
    const group = category ? groupsById.get(category.category_group_id) : undefined;
    return {
      CategoryPath: category ? `${group?.name || 'Imported from YNAB'}: ${category.name}` : '',
      CategoryGroup: category ? group?.name || 'Imported from YNAB' : '',
      Category: category?.name || '',
    };
  };

  const transactionPayee = (
    payeeId: string | null,
    transferAccountId: string | null,
    fallbackPayeeId?: string | null
  ) => {
    if (transferAccountId) {
      const targetAccount = accountsById.get(transferAccountId);
      return targetAccount ? `Transfer : ${targetAccount.name}` : 'Transfer : Unknown account';
    }
    return (
      (payeeId ? payeesById.get(payeeId)?.name : undefined) ||
      (fallbackPayeeId ? payeesById.get(fallbackPayeeId)?.name : undefined) ||
      ''
    );
  };

  const amountFields = (amount: number) => {
    const normalized = normalizeAmount(amount);
    return {
      Outflow: normalized < 0 ? milliToDecimal(-normalized) : '0.000',
      Inflow: normalized > 0 ? milliToDecimal(normalized) : '0.000',
    };
  };

  const isCategorylessBudgetBoundaryTransfer = (
    accountId: string,
    transferAccountId: string | null,
    categoryId: string | null
  ) => {
    if (!transferAccountId || categoryId) return false;
    const source = accountsById.get(accountId);
    const destination = accountsById.get(transferAccountId);
    return Boolean(source && destination && source.on_budget !== destination.on_budget);
  };

  const registerRows: YNABRegisterRow[] = [];
  for (const transaction of plan.transactions) {
    if (transaction.deleted) continue;
    const account = accountsById.get(transaction.account_id);
    if (!account || account.deleted) continue;

    const children = childrenByTransactionId.get(transaction.id) || [];
    if (children.length > 0) {
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        registerRows.push({
          Account: account.name,
          Flag: '',
          Date: transaction.date,
          Payee: transactionPayee(child.payee_id, child.transfer_account_id, transaction.payee_id),
          ...categoryFields(child.category_id),
          Memo: `Split (${index + 1}/${children.length}): ${child.memo || ''}`,
          ...amountFields(child.amount),
          Cleared: transaction.cleared,
          ExcludeFromReadyToAssign: isCategorylessBudgetBoundaryTransfer(
            transaction.account_id,
            child.transfer_account_id,
            child.category_id
          ),
        });
      }
      continue;
    }

    registerRows.push({
      Account: account.name,
      Flag: '',
      Date: transaction.date,
      Payee: transactionPayee(transaction.payee_id, transaction.transfer_account_id),
      ...categoryFields(transaction.category_id),
      Memo: transaction.memo || '',
      ...amountFields(transaction.amount),
      Cleared: transaction.cleared,
      TransferID: transferIdFor(transaction),
      ExcludeFromReadyToAssign: isCategorylessBudgetBoundaryTransfer(
        transaction.account_id,
        transaction.transfer_account_id,
        transaction.category_id
      ),
    });
  }

  const budgetRows: YNABBudgetRow[] = [];
  const representedCategoryIds = new Set<string>();
  for (const month of plan.months) {
    if (month.deleted) continue;
    for (const category of month.categories || []) {
      if (category.deleted) continue;
      const fields = categoryFields(category.id);
      budgetRows.push({
        Month: month.month,
        ...fields,
        Assigned: milliToDecimal(normalizeAmount(category.budgeted || 0)),
        Activity: milliToDecimal(normalizeAmount(category.activity || 0)),
        Available: milliToDecimal(normalizeAmount(category.balance || 0)),
      });
      representedCategoryIds.add(category.id);
    }
  }

  // Categories without a month row (often hidden or recently created) still
  // belong in the imported hierarchy and may be referenced by old history.
  for (const category of plan.categories) {
    if (category.deleted || representedCategoryIds.has(category.id)) continue;
    budgetRows.push({
      Month: plan.first_month || plan.last_month,
      ...categoryFields(category.id),
      Assigned: '0.000',
      Activity: milliToDecimal(normalizeAmount(category.activity || 0)),
      Available: milliToDecimal(normalizeAmount(category.balance || 0)),
    });
  }

  return {
    registerRows,
    budgetRows,
    accountSpecs: plan.accounts
      .filter((account) => !account.deleted)
      .map((account) => ({
        name: account.name,
        type: mapYNABAccountType(account.type),
        onBudget: account.on_budget,
        archived: account.closed,
        ynabAccountId: account.id,
        expectedBalance: normalizeAmount(account.balance),
      })),
    readyToAssignSpecs: plan.months
      .filter((month) => !month.deleted)
      .map((month) => ({
        month: month.month.slice(0, 7),
        expectedReadyToAssign: normalizeAmount(month.to_be_budgeted),
      })),
  };
}
