import { t } from '@lingui/core/macro';
import type { ChartConfiguration } from '@budgero/core/browser';

export type ExtendedChartType = ChartConfiguration['chartType'] | 'table' | 'stat';

export function getVisualizationTypeLabel(chartType: ExtendedChartType): string {
  switch (chartType) {
    case 'bar':
      return t`Bar Chart`;
    case 'line':
      return t`Line Chart`;
    case 'area':
      return t`Area Chart`;
    case 'pie':
      return t`Pie Chart`;
    case 'scatter':
      return t`Scatter Plot`;
    case 'table':
      return 'Table';
    case 'stat':
      return 'Stat';
    default:
      return chartType;
  }
}

export function getVisualizationDisplayName(chart: {
  title?: string;
  chartType: ExtendedChartType;
}): string {
  return chart.title || getVisualizationTypeLabel(chart.chartType);
}
