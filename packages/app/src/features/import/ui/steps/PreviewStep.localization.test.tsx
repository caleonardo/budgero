import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { activateLocale } from '@shared/i18n';
import { DEFAULT_IMPORT_CONFIG, type PreviewRow } from '../../model/types';
import { PreviewStep } from './PreviewStep';

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

describe('localized import review', () => {
  it('updates live labels and plural counts without changing import decisions', async () => {
    const row: PreviewRow = {
      input: {
        index: 0, valid: true, budgetId: 1, accountId: 1, currency: 'EUR',
        date: '2026-09-01', inflow: 0, outflow: 10000, payee: 'Coffee', memo: '',
        fileRowKey: 'row-0', operationId: 'op-0',
      },
      original: {}, parsed: { account: 'Checking' }, errors: [],
      duplicate: { index: 0, status: 'already-imported', candidates: [], reason: 'This file row was already imported' },
      decision: 'import',
    };
    await activateLocale('de', false);
    const onDecision = vi.fn();
    const props = {
      previewData: [row], previewTotalCount: 1, previewImportableCount: 1, previewSkippedCount: 0,
      columnMapping: {}, importConfig: DEFAULT_IMPORT_CONFIG, hasBudgetSelected: true,
      onBack: vi.fn(), onStartImport: vi.fn(), onDecision, onResolveAll: vi.fn(),
    };
    const view = render(<PreviewStep {...props} />);
    expect(screen.queryByRole('button', { name: 'Import 1 transaction' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 Transaktion importieren' })).toBeEnabled();
    expect(screen.getByText('Diese Dateizeile wurde bereits importiert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Überspringen' }));
    expect(onDecision).toHaveBeenCalledWith(0, 'skip');
    await act(() => activateLocale('fr', false));
    expect(screen.getByRole('button', { name: 'Importer 1 transaction' })).toBeEnabled();
    expect(screen.getByText('Cette ligne de fichier a déjà été importée')).toBeInTheDocument();
    view.rerender(<PreviewStep {...props} previewData={[row, { ...row, input: { ...row.input, index: 1 } }]} />);
    expect(screen.getByRole('button', { name: 'Importer 2 transactions' })).toBeEnabled();
  });
});
