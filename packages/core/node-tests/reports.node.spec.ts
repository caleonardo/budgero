import { describe, it, expect } from 'vitest';
import { NodeSqlJsAdapter, DatabaseAdapter, ServiceManager } from '../src';
import { DatabaseUnifiedReportService, ChartConfiguration } from '../src/services/reports/index.js';

describe('UnifiedReportService', () => {
  it('repairs a legacy remote report ID and preserves dashboard widget references', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const sm = new ServiceManager();
    await sm.initialize(adapter as DatabaseAdapter);
    const services = sm.getServices();
    const budgetId = await services.budgets.createBudget({
      name: 'Main',
      display_currency: 'USD',
      badge_icon: 'wallet',
      number_format: 'en-US',
      create_default_categories: false,
    });
    const legacy = services.reports.saveReport({
      id: 'legacy-local-report-id',
      name: 'Original name',
      query: 'SELECT month, amount FROM transactions',
      charts: [
        {
          id: 'legacy-local-chart-id',
          chartType: 'bar',
          xAxisColumn: 'month',
          yAxisColumn: 'amount',
          aggregateFunction: 'SUM',
        },
      ],
    });
    const dashboard = services.customDashboards.createDashboard({
      budgetId,
      name: 'Overview',
    });
    services.customDashboards.addWidget({
      dashboardId: dashboard.id,
      reportId: legacy.id,
      chartId: legacy.charts[0]!.id,
    });

    const repaired = services.reports.reconcileAndUpdateReport('remote-report-id', {
      name: 'Renamed remotely',
      query: legacy.query,
      charts: [{ ...legacy.charts[0]!, id: 'remote-chart-id' }],
    });

    expect(repaired.id).toBe('remote-report-id');
    expect(repaired.name).toBe('Renamed remotely');
    expect(services.reports.getReport('legacy-local-report-id')).toBeNull();
    const repairedDashboard = services.customDashboards.getDashboard(dashboard.id);
    expect(repairedDashboard?.widgets[0]).toMatchObject({
      reportId: 'remote-report-id',
      chartId: 'remote-chart-id',
    });
  });

  it('recreates a missing remote report only from a complete update', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const svc = new DatabaseUnifiedReportService(adapter as DatabaseAdapter);

    const recreated = svc.reconcileAndUpdateReport('remote-report-id', {
      name: 'Remote report',
      description: 'Complete state',
      query: 'SELECT 1',
      charts: [],
    });
    expect(recreated).toMatchObject({ id: 'remote-report-id', name: 'Remote report' });

    expect(() => svc.reconcileAndUpdateReport('another-missing-id', { isFavorite: true })).toThrow(
      /remote update is incomplete/
    );
  });

  it('refuses to guess when multiple legacy reports match a remote update', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const svc = new DatabaseUnifiedReportService(adapter as DatabaseAdapter);
    const chart = {
      chartType: 'stat' as const,
      xAxisColumn: 'label',
      yAxisColumn: 'amount',
      aggregateFunction: 'SUM' as const,
    };
    svc.saveReport({ name: 'First', query: 'SELECT 1', charts: [chart] });
    svc.saveReport({ name: 'Second', query: 'SELECT 1', charts: [chart] });

    expect(() =>
      svc.reconcileAndUpdateReport('remote-id', {
        name: 'Renamed remotely',
        query: 'SELECT 1',
        charts: [{ ...chart, id: 'remote-chart-id' }],
      })
    ).toThrow(/Multiple legacy reports/);
    expect(svc.getReport('remote-id')).toBeNull();
  });

  it('preserves report and chart IDs supplied by mutation payloads', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const svc = new DatabaseUnifiedReportService(adapter as DatabaseAdapter);

    const created = svc.saveReport({
      id: 'report-from-mutation',
      name: 'Synced report',
      query: 'SELECT 1',
      charts: [
        {
          id: 'chart-from-mutation',
          chartType: 'bar',
          xAxisColumn: 'x',
          yAxisColumn: 'y',
          aggregateFunction: 'SUM',
        },
      ],
    });

    expect(created.id).toBe('report-from-mutation');
    expect(created.charts[0]?.id).toBe('chart-from-mutation');

    const withChart = svc.addChartToReport(created.id, {
      id: 'added-chart-from-mutation',
      chartType: 'line',
      xAxisColumn: 'x',
      yAxisColumn: 'y',
      aggregateFunction: 'SUM',
    });

    expect(withChart.charts[1]?.id).toBe('added-chart-from-mutation');
  });

  it('CRUD + charts + duplication + favorites', async () => {
    const adapter = await NodeSqlJsAdapter.create();
    const svc = new DatabaseUnifiedReportService(adapter as DatabaseAdapter);

    // Create
    const created = await svc.saveReport({
      name: 'Spending By Category',
      description: 'Test report',
      query: 'SELECT 1 as x',
      charts: [
        {
          chartType: 'bar',
          xAxisColumn: 'x',
          yAxisColumn: 'y',
          aggregateFunction: 'SUM',
          title: 'Chart 1',
        },
      ],
      tags: ['tag1'],
      isFavorite: false,
    });

    expect(created.id).toBeTruthy();
    expect(created.charts.length).toBe(1);

    // Duplicate name should fail
    expect(() =>
      svc.saveReport({
        name: 'Spending By Category',
        description: 'dup',
        query: 'SELECT 2',
        charts: [],
        tags: [],
        isFavorite: false,
      })
    ).toThrow(/already exists/);

    // Get and list
    const fetched = await svc.getReport(created.id);
    expect(fetched?.name).toBe('Spending By Category');
    const list = await svc.getReports();
    expect(list.length).toBe(1);

    // Update fields
    const updated = await svc.updateReport(created.id, {
      name: 'Spending By Category v2',
      description: 'Updated',
      query: 'SELECT 3',
      tags: ['tag2'],
      isFavorite: true,
    });
    expect(updated.name).toBe('Spending By Category v2');
    expect(updated.isFavorite).toBe(true);

    // Add a chart
    const withChart = await svc.addChartToReport(updated.id, {
      chartType: 'line',
      xAxisColumn: 'd',
      yAxisColumn: 'v',
      aggregateFunction: 'SUM',
      title: 'Time',
    });
    expect(withChart.charts.length).toBe(2);
    const addedChartId = withChart.charts[1].id;

    // Update chart
    const afterChartUpdate = await svc.updateChartInReport(updated.id, addedChartId, {
      title: 'Time Updated',
    } as Partial<ChartConfiguration>);
    expect(afterChartUpdate.charts.find((c) => c.id === addedChartId)?.title).toBe('Time Updated');

    // Remove chart
    const afterRemove = await svc.removeChartFromReport(updated.id, addedChartId);
    expect(afterRemove.charts.length).toBe(1);

    // Toggle favorite
    const toggled = await svc.toggleFavorite(updated.id);
    expect(toggled.isFavorite).toBe(false);

    // Duplicate report
    const dup = await svc.duplicateReport(updated.id, 'Spending Copy');
    expect(dup.id).not.toBe(updated.id);
    expect(dup.name).toBe('Spending Copy');
    // Chart IDs should be regenerated
    expect(dup.charts[0].id).not.toBe(afterRemove.charts[0].id);

    // Update with duplicate name should fail
    expect(() => svc.updateReport(dup.id, { name: 'Spending By Category v2' })).toThrow(
      /already exists/
    );

    // Delete
    await svc.deleteReport(updated.id);
    const postDelete = await svc.getReport(updated.id);
    expect(postDelete).toBeNull();
  });
});
