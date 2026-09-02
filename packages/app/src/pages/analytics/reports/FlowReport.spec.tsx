import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { AnalyticsData } from '../useAnalyticsData';
import type { AnalyticsTxn } from '../analytics-model';
import { FlowReport } from './FlowReport';

const chartState = vi.hoisted(() => ({
  option: null as unknown,
}));

vi.mock('@shared/ui/echart', () => ({
  EChart: ({ option, onMarkClick }: { option: unknown; onMarkClick?: (mark: unknown) => void }) => {
    chartState.option = option;
    return (
      <button
        type="button"
        onClick={() =>
          onMarkClick?.({ name: 'Other spending', dataIndex: 0, value: 0, seriesName: '' })
        }
      >
        Select Other spending
      </button>
    );
  },
}));

vi.mock('@shared/ui/animated-number', () => ({
  AnimatedNumber: ({ value }: { value: number }) => <span>{value}</span>,
}));

vi.mock('../components/chart-utils', () => ({
  tooltipBase: () => ({}),
  tooltipHtml: () => '',
  useMoneyFormatters: () => ({
    amount: (value: number) => String(value),
    compact: (value: number) => String(value),
    tile: (value: number) => String(value),
    masked: false,
  }),
  usePalette: () => ({
    series: ['#1d4ed8', '#0f766e', '#a16207', '#be123c', '#6d28d9', '#0369a1', '#4d7c0f'],
    chrome: {
      surface: '#ffffff',
      grid: '#d4d4d8',
      axisLine: '#d4d4d8',
      axisText: '#52525b',
      inkPrimary: '#18181b',
      inkSecondary: '#52525b',
      other: '#71717a',
    },
    flow: { positive: '#15803d', negative: '#b91c1c' },
  }),
}));

function transaction(index: number): AnalyticsTxn {
  return {
    id: index,
    date: '2026-08-01',
    monthKey: '2026-08',
    accountId: 1,
    categoryId: index,
    category: `Category ${index}`,
    groupName: `Group ${index}`,
    payee: '',
    labelId: null,
    label: '',
    labelColor: null,
    inflow: 0,
    outflow: (11 - index) * 10_000,
    isTransfer: false,
    isIncome: false,
  };
}

function destinationNames(): string[] {
  const option = chartState.option as {
    series: { data: { name: string }[] }[];
  };
  return option.series[0].data.map((node) => node.name.trim());
}

function destinationColor(name: string): string | undefined {
  const option = chartState.option as {
    series: { data: { name: string; itemStyle?: { color?: string } }[] }[];
  };
  return option.series[0].data.find((node) => node.name.trim() === name)?.itemStyle?.color;
}

describe('FlowReport', () => {
  it('toggles to categories and expands Other into colored graph nodes', () => {
    const income: AnalyticsTxn = {
      ...transaction(100),
      category: 'Salary',
      groupName: 'Income',
      inflow: 1_000_000,
      outflow: 0,
      isIncome: true,
    };
    const data: AnalyticsData = {
      budgetId: 1,
      isLoading: false,
      allTxns: [],
      txns: [income, ...Array.from({ length: 10 }, (_, index) => transaction(index + 1))],
      accounts: [],
      onBudgetAccountIds: new Set([1]),
      categories: [],
      categoryGroups: [],
      labels: [],
      payees: [],
    };

    render(<FlowReport data={data} />);
    expect(destinationNames()).toContain('Group 1');
    expect(destinationNames()).toContain('Other spending');

    fireEvent.click(screen.getByRole('button', { name: 'Categories' }));
    expect(destinationNames()).toContain('Category 1');
    expect(destinationNames()).toContain('Other spending');
    expect(destinationColor('Other spending')).toBe('#71717a');

    fireEvent.click(screen.getByRole('button', { name: 'Select Other spending' }));
    expect(destinationNames()).toContain('Category 10');
    expect(destinationNames()).not.toContain('Other spending');
    expect(destinationColor('Category 10')).not.toBe('#71717a');
    expect(screen.getByRole('button', { name: '← Collapse Other' })).toBeInTheDocument();
  });
});
