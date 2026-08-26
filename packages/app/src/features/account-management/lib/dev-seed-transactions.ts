import type { Account, Category } from '@budgero/core/browser';
import { asMilli, decimalToScaled } from '@budgero/core/browser';
import { formatDateISO } from '@shared/lib/date-utils';

/** Dev-only transaction volume guard to avoid accidentally freezing the tab. */
export const MAX_FAKE_TRANSACTIONS = 20_000;

type SeedAccount = Pick<Account, 'ID' | 'Currency' | 'Archived'>;
type SeedCategory = Pick<Category, 'ID' | 'Name'>;

export interface FakeTransactionSpec {
  accountId: number;
  categoryId: number;
  date: string;
  inflow: number;
  outflow: number;
  memo: string;
  payee: string;
}

const PAYEES = [
  'Corner Market',
  'Metro Transit',
  'Northstar Energy',
  'Daily Coffee',
  'Cloud Services',
  'City Pharmacy',
  'Home Supply',
  'Online Store',
];

const SPECIAL_CATEGORY_NAMES = new Set(['income', 'transfers']);

/**
 * Builds deterministic account assignment (round-robin) with varied dates,
 * amounts, categories, and payees. Randomness only affects transaction data;
 * account distribution always differs by at most one transaction.
 */
export function buildFakeTransactions({
  count,
  accounts,
  categories,
  today = new Date(),
  random = Math.random,
}: {
  count: number;
  accounts: SeedAccount[];
  categories: SeedCategory[];
  today?: Date;
  random?: () => number;
}): FakeTransactionSpec[] {
  const activeAccounts = accounts.filter((account) => !account.Archived);
  if (activeAccounts.length === 0 || categories.length === 0 || count <= 0) return [];

  const incomeCategory = categories.find((category) => category.Name.toLowerCase() === 'income');
  const spendingCategories = categories.filter(
    (category) => !SPECIAL_CATEGORY_NAMES.has(category.Name.toLowerCase())
  );
  const fallbackCategories = spendingCategories.length > 0 ? spendingCategories : categories;

  return Array.from({ length: count }, (_, index) => {
    const account = activeAccounts[index % activeAccounts.length];
    const isInflow = index % 5 === 0;
    const category = isInflow
      ? (incomeCategory ?? categories[index % categories.length])
      : fallbackCategories[index % fallbackCategories.length];
    const decimalAmount = isInflow ? 500 + random() * 4_500 : 5 + random() * 495;
    const amount = asMilli(decimalToScaled(decimalAmount, account.Currency || 'USD'));
    const daysAgo = Math.floor(random() * 365);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    return {
      accountId: account.ID,
      categoryId: category.ID,
      date: formatDateISO(date),
      inflow: isInflow ? amount : 0,
      outflow: isInflow ? 0 : amount,
      memo: `Dev seed transaction ${index + 1}`,
      payee: isInflow ? 'Sample income' : PAYEES[index % PAYEES.length],
    };
  });
}
