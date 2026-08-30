import { describe, expect, it, vi } from 'vitest';
import {
  prepareAddReportChartMutation,
  prepareCreateReportMutation,
  prepareDuplicateReportMutation,
} from './reportMutationPayloads';

const chart = {
  chartType: 'bar' as const,
  xAxisColumn: 'month',
  yAxisColumn: 'amount',
  aggregateFunction: 'SUM' as const,
};

function idSequence(...ids: string[]) {
  const generateId = vi.fn();
  ids.forEach((id) => generateId.mockReturnValueOnce(id));
  return generateId;
}

describe('report mutation payloads', () => {
  it('assigns report and chart IDs before creating a report', () => {
    const generateId = idSequence('report-1', 'chart-1');

    const payload = prepareCreateReportMutation(
      { name: 'Spending', query: 'SELECT 1', charts: [chart] },
      generateId
    );

    expect(payload.id).toBe('report-1');
    expect(payload.charts[0]?.id).toBe('chart-1');
    expect(generateId).toHaveBeenCalledTimes(2);
  });

  it('assigns a chart ID before adding it to a report', () => {
    const payload = prepareAddReportChartMutation(
      { reportId: 'report-1', chart },
      idSequence('chart-2')
    );

    expect(payload).toEqual({
      reportId: 'report-1',
      chart: { ...chart, id: 'chart-2' },
    });
  });

  it('captures a complete duplicate with stable report and chart IDs', () => {
    const payload = prepareDuplicateReportMutation(
      { id: 'report-1', newName: 'Spending Copy' },
      {
        id: 'report-1',
        name: 'Spending',
        description: 'Monthly spending',
        query: 'SELECT 1',
        charts: [{ ...chart, id: 'chart-1' }],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        tags: ['monthly'],
        isFavorite: true,
      },
      idSequence('report-2', 'chart-2')
    );

    expect(payload).toEqual({
      sourceId: 'report-1',
      newReport: {
        id: 'report-2',
        name: 'Spending Copy',
        description: 'Monthly spending',
        query: 'SELECT 1',
        charts: [{ ...chart, id: 'chart-2' }],
        tags: ['monthly'],
        isFavorite: false,
      },
    });
  });
});
