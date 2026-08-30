import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeMutationOp } from '@shared/mutations/op-code-registry';

const reportMocks = vi.hoisted(() => ({
  saveReport: vi.fn(),
  addChartToReport: vi.fn(),
  duplicateReport: vi.fn(),
}));

vi.mock('@shared/runtime/global', () => ({
  getRuntime: () => ({ services: () => ({ reports: reportMocks }) }),
}));

const chart = {
  id: 'chart-1',
  chartType: 'bar',
  xAxisColumn: 'month',
  yAxisColumn: 'amount',
  aggregateFunction: 'SUM',
};

describe('report mutation IDs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserves IDs supplied by create and add-chart mutations', async () => {
    await executeMutationOp('reports.create', {
      id: 'report-1',
      name: 'Spending',
      query: 'SELECT 1',
      charts: [chart],
    });
    expect(reportMocks.saveReport).toHaveBeenCalledWith({
      id: 'report-1',
      name: 'Spending',
      description: undefined,
      query: 'SELECT 1',
      charts: [chart],
      tags: undefined,
      isFavorite: undefined,
    });

    await executeMutationOp('reports.addChart', {
      reportId: 'report-1',
      chart,
    });
    expect(reportMocks.addChartToReport).toHaveBeenCalledWith('report-1', chart);
  });

  it('creates a duplicate from the complete report stored in the mutation', async () => {
    const newReport = {
      id: 'report-2',
      name: 'Spending Copy',
      query: 'SELECT 1',
      charts: [{ ...chart, id: 'chart-2' }],
      isFavorite: false,
    };

    await executeMutationOp('reports.duplicate', {
      sourceId: 'report-1',
      newReport,
    });

    expect(reportMocks.saveReport).toHaveBeenCalledWith(newReport);
    expect(reportMocks.duplicateReport).not.toHaveBeenCalled();
  });

  it('continues to accept legacy duplicate payloads', async () => {
    await executeMutationOp('reports.duplicate', {
      id: 'report-1',
      newName: 'Legacy Copy',
    });

    expect(reportMocks.duplicateReport).toHaveBeenCalledWith('report-1', 'Legacy Copy');
  });
});
