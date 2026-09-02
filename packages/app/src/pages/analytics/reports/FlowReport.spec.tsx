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
    const select = (name: string) => {
      const series = option as { series: { data: { name: string }[] }[] };
      const dataIndex = series.series[0].data.findIndex((item) => item.name.trim() === name);
      const selectedName = series.series[0].data[dataIndex]?.name ?? name;
      onMarkClick?.({ name: selectedName, dataIndex, value: 0, seriesName: '' });
    };
    return (
      <>
        <button type="button" onClick={() => select('Other spending')}>
          Select Other spending
        </button>
        <button type="button" onClick={() => select('Fixed')}>
          Select Fixed
        </button>
      </>
    );
  },
}));

vi.mock('@shared/ui/animated-number', () => ({
  AnimatedNumber: ({ value }: { value: number }) => <span>{value}</span>,
}));

vi.mock('../components/chart-utils', () => ({
  inkOnFill: () => '#ffffff',
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

function chartType(): string {
  const option = chartState.option as { series: { type: string }[] };
  return option.series[0].type;
}

describe('FlowReport', () => {
  it('toggles to categories and expands Other into a focused colored breakdown', () => {
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
    expect(chartType()).toBe('sankey');
    expect(destinationNames()).toContain('Category 1');
    expect(destinationNames()).toContain('Other spending');
    expect(destinationColor('Other spending')).toBe('#71717a');

    fireEvent.click(screen.getByRole('button', { name: 'Select Other spending' }));
    expect(chartType()).toBe('treemap');
    expect(destinationNames()).toContain('Category 10');
    expect(destinationNames()).not.toContain('Category 1');
    expect(destinationNames()).not.toContain('Other spending');
    expect(destinationColor('Category 10')).not.toBe('#71717a');
    expect(screen.getByRole('button', { name: '← Back to Money Map' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '← Back to Money Map' }));
    expect(chartType()).toBe('sankey');
    expect(destinationNames()).toContain('Other spending');
  });

  it('opens a group as a category treemap and returns to the Money Map', () => {
    const data: AnalyticsData = {
      budgetId: 1,
      isLoading: false,
      allTxns: [],
      txns: [
        {
          ...transaction(100),
          category: 'Salary',
          groupName: 'Income',
          inflow: 1_000_000,
          outflow: 0,
          isIncome: true,
        },
        { ...transaction(1), category: 'Housing', groupName: 'Fixed', outflow: 300_000 },
        { ...transaction(2), category: 'Energy', groupName: 'Fixed', outflow: 100_000 },
        { ...transaction(3), category: 'Groceries', groupName: 'Variable', outflow: 80_000 },
      ],
      accounts: [],
      onBudgetAccountIds: new Set([1]),
      categories: [],
      categoryGroups: [],
      labels: [],
      payees: [],
    };

    render(<FlowReport data={data} />);
    expect(chartType()).toBe('sankey');
    expect(destinationNames()).toContain('Fixed');

    fireEvent.click(screen.getByRole('button', { name: 'Select Fixed' }));
    expect(chartType()).toBe('treemap');
    expect(destinationNames()).toEqual(['Housing', 'Energy']);
    expect(destinationNames()).not.toContain('Groceries');
    expect(screen.getByText('Inside Fixed · 2 categories')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '← Back to Money Map' }));
    expect(chartType()).toBe('sankey');
    expect(destinationNames()).toContain('Fixed');
  });
});
