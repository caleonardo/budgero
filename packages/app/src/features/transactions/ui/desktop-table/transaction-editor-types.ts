import type {
  Account,
  Category,
  CategoryGroup,
  GetMonthlyBudgetRow,
  LabelListItem,
} from '@budgero/core/browser';

export type TransactionEditableColumn =
  | 'date'
  | 'memo'
  | 'account'
  | 'payee'
  | 'label'
  | 'category'
  | 'inflow'
  | 'outflow'
  | 'exchangeRate';

export interface TransactionEditorDirectories {
  accounts: Account[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  labels: LabelListItem[];
  payees: string[];
  monthlyRows: GetMonthlyBudgetRow[];
  readyToAssignAmount: number;
}
