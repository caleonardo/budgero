import React from 'react';
import { render, screen } from '@testing-library/react';
import type { YNABImportPreview } from '@budgero/core/browser';
import { YnabImportTab } from './YnabImportTab';

vi.mock('@features/currencies/ui/CurrencySelector', () => ({
  CurrencySelector: () => <div data-testid="currency-selector" />,
}));

vi.mock('@features/budget-management/ui/IconPicker', () => ({
  IconPicker: () => <div data-testid="icon-picker" />,
}));

vi.mock('@features/budget-management/ui/FormatSelector', () => ({
  FormatSelector: () => <div data-testid="format-selector" />,
}));

vi.mock('./YnabExportGuide', () => ({
  YnabExportGuide: () => <div data-testid="ynab-export-guide" />,
}));

const preview: YNABImportPreview = {
  registerRowCount: 4,
  accountCount: 1,
  categoryCount: 4,
  missingCategories: [
    {
      categoryGroup: 'Archive',
      category: 'Missing From Plan',
      transactionCount: 1,
    },
  ],
  splitTransactions: [
    {
      account: 'Checking',
      date: '2026-08-30',
      payees: ['Split Store'],
      partCount: 3,
    },
  ],
};

describe('YnabImportTab', () => {
  it('previews counts, account-type guidance, created categories, and automatic splits', () => {
    render(
      <YnabImportTab
        budgetName="Imported budget"
        onBudgetNameChange={vi.fn()}
        currency="USD"
        onCurrencyChange={vi.fn()}
        numberFormat="123,456.78"
        onNumberFormatChange={vi.fn()}
        importBadgeIcon="💰"
        onImportBadgeIconChange={vi.fn()}
        fileInputRef={React.createRef<HTMLInputElement>()}
        file={new File(['zip'], 'edge-cases.zip', { type: 'application/zip' })}
        onFileChange={vi.fn()}
        preview={preview}
        isInspecting={false}
        isImporting={false}
        onReset={vi.fn()}
        onImport={vi.fn()}
      />
    );

    expect(screen.getByText(/1 account · 4 categories · 4 register rows/)).toBeInTheDocument();
    expect(screen.getByText('Review account types after import')).toBeInTheDocument();
    expect(screen.getByText(/Archive › Missing From Plan/)).toBeInTheDocument();
    expect(screen.getByText(/as split transactions automatically/)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
