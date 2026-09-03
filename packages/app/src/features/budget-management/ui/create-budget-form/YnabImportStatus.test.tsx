import { fireEvent, render, screen } from '@testing-library/react';
import type { YNABImportProgressUpdate, YNABImportSummary } from '@budgero/core/browser';
import { YnabImportStatus } from './YnabImportStatus';

const runningUpdates: YNABImportProgressUpdate[] = [
  {
    stage: 'preparing',
    status: 'passed',
    progress: 10,
    label: 'Budget created',
  },
  {
    stage: 'categories',
    status: 'running',
    progress: 12,
    label: 'Importing categories',
    detail: '22 categories',
  },
];

const summary: YNABImportSummary = {
  registerRowsImported: 4_250,
  transactionsCreated: 4_000,
  missingCategoriesCreated: [],
  splitTransactionsImported: 30,
  accountBalancesVerified: 8,
  readyToAssignMonthsVerified: 62,
};

describe('YnabImportStatus', () => {
  it('shows stage progress and both API verification checks', () => {
    render(
      <YnabImportStatus
        sourceMode="api"
        updates={runningUpdates}
        error={null}
        summary={null}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText('Importing from YNAB')).toBeInTheDocument();
    expect(screen.getByText('Importing categories')).toBeInTheDocument();
    expect(screen.getByText('22 categories')).toBeInTheDocument();
    expect(screen.getByText('Verify account balances')).toBeInTheDocument();
    expect(screen.getByText('Verify Ready to Assign by month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('shows a durable failure warning and lets the user return to the form', () => {
    const onBack = vi.fn();
    render(
      <YnabImportStatus
        sourceMode="api"
        updates={runningUpdates}
        error="YNAB Ready to Assign integrity check failed for 2026-09"
        summary={null}
        onBack={onBack}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText('YNAB import stopped')).toBeInTheDocument();
    expect(screen.getByText('Verification failed')).toBeInTheDocument();
    expect(screen.getByText(/Ready to Assign integrity check failed/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to import' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('summarizes verified balances and RTA months before opening the budget', () => {
    const onContinue = vi.fn();
    render(
      <YnabImportStatus
        sourceMode="api"
        updates={[
          ...runningUpdates,
          {
            stage: 'complete',
            status: 'passed',
            progress: 100,
            label: 'Imported budget saved',
          },
        ]}
        error={null}
        summary={summary}
        onBack={vi.fn()}
        onContinue={onContinue}
      />
    );

    expect(screen.getByText('YNAB import verified')).toBeInTheDocument();
    expect(screen.getByText('8 verified')).toBeInTheDocument();
    expect(screen.getByText('62 months verified')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open imported budget' }));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
