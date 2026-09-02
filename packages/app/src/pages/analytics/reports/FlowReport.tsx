import { useMemo, useState } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { Layers3, Tags } from 'lucide-react';
import { trendTextClass } from '@shared/lib/amount-color';
import { EChart } from '@shared/ui/echart';
import { AnimatedNumber } from '@shared/ui/animated-number';
import { buildFlowGraph, type FlowSpendingDimension } from '../analytics-model';
import type { AnalyticsData } from '../useAnalyticsData';
import {
  inkOnFill,
  tooltipBase,
  tooltipHtml,
  useMoneyFormatters,
  usePalette,
} from '../components/chart-utils';
import { ModeToggle, ReportShell } from '../components/ReportShell';
import { PanelSectionTitle, ProportionRow, StatTile } from '../components/panels';

const MAX_DESTINATIONS = 8;

interface FlowReportProps {
  data: AnalyticsData;
}

export function FlowReport({ data }: FlowReportProps) {
  const [dimension, setDimension] = useState<FlowSpendingDimension>('group');
  const [otherExpanded, setOtherExpanded] = useState(false);
  const palette = usePalette();
  const money = useMoneyFormatters();

  const collapsedGraph = useMemo(
    () => buildFlowGraph(data.txns, data.onBudgetAccountIds, MAX_DESTINATIONS, dimension),
    [data.txns, data.onBudgetAccountIds, dimension]
  );
  const showingOther = otherExpanded && collapsedGraph.foldedDestinations.length > 0;
  const graph = collapsedGraph;

  const net = graph.totalIncome - graph.totalSpending;
  const savingsRate = graph.totalIncome > 0 ? (net / graph.totalIncome) * 100 : null;
  const isEmpty = graph.links.length === 0;
  const dimensionLabel = dimension === 'group' ? 'groups' : 'categories';

  // Node colors by role: income sources cycle the cool half of the palette,
  // spending groups the fixed slot order; results use the status pair.
  const nodeColors = useMemo(() => {
    const colors = new Map<string, string>();
    let incomeIndex = 0;
    let destinationIndex = 0;
    for (const node of graph.nodes) {
      switch (node.slot) {
        case 'hub':
          colors.set(node.name, palette.series[0]);
          break;
        case 'income':
          colors.set(
            node.name,
            node.name.trimEnd() === 'From savings'
              ? palette.flow.negative
              : palette.series[(incomeIndex++ % 4) + 4]
          );
          break;
        case 'group':
          colors.set(
            node.name,
            node.name.trim() === 'Other spending'
              ? palette.chrome.other
              : palette.series[destinationIndex++ % palette.series.length]
          );
          break;
        case 'result':
          colors.set(node.name, palette.flow.positive);
          break;
      }
    }
    return colors;
  }, [graph.nodes, palette]);

  const otherRows = useMemo(
    () =>
      collapsedGraph.foldedDestinations.map((destination, index) => ({
        ...destination,
        color: palette.series[index % palette.series.length],
      })),
    [collapsedGraph.foldedDestinations, palette.series]
  );

  const destinationRows = useMemo(() => {
    if (showingOther) return otherRows;

    return graph.links
      .filter((link) => link.source === 'Income')
      .map((link) => ({
        name: link.target.trim(),
        value: link.value,
        color: nodeColors.get(link.target) ?? palette.chrome.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [graph.links, nodeColors, otherRows, palette.chrome.other, showingOther]);

  const option = useMemo<EChartsCoreOption>(() => {
    const { chrome } = palette;
    if (showingOther) {
      const otherTotal = otherRows.reduce((sum, row) => sum + row.value, 0);
      return {
        tooltip: {
          ...tooltipBase(chrome),
          trigger: 'item' as const,
          formatter: (params: unknown) => {
            const item = params as {
              name: string;
              value: number;
              data: { itemStyle?: { color?: string } };
            };
            const value = Math.round(item.value * 1000);
            return tooltipHtml(`Inside Other · ${dimensionLabel}`, [
              {
                color: item.data.itemStyle?.color ?? chrome.other,
                name: item.name,
                value: `${money.amount(value)} · ${otherTotal > 0 ? `${((value / otherTotal) * 100).toFixed(1)}%` : '0%'}`,
              },
            ]);
          },
        },
        series: [
          {
            type: 'treemap',
            roam: false,
            nodeClick: false,
            breadcrumb: { show: false },
            top: 8,
            right: 8,
            bottom: 8,
            left: 8,
            itemStyle: {
              borderColor: chrome.surface,
              borderWidth: 2,
              gapWidth: 2,
            },
            label: {
              show: true,
              fontSize: 12,
              overflow: 'truncate',
              formatter: (params: { name: string }) => params.name,
            },
            data: otherRows.map((row) => ({
              name: row.name,
              value: row.value / 1000,
              itemStyle: { color: row.color },
              label: { color: inkOnFill(row.color) },
            })),
          },
        ],
      };
    }

    return {
      tooltip: {
        ...tooltipBase(chrome),
        trigger: 'item' as const,
        formatter: (params: unknown) => {
          const item = params as {
            dataType: string;
            name: string;
            value: number;
            data: { source?: string; target?: string };
          };
          if (item.dataType === 'edge') {
            return tooltipHtml('Flow', [
              {
                color: nodeColors.get(item.data.target ?? '') ?? chrome.other,
                name: `${(item.data.source ?? '').trim()} → ${(item.data.target ?? '').trim()}`,
                value: money.amount(Math.round(item.value * 1000)),
              },
            ]);
          }
          return tooltipHtml('Total', [
            {
              color: nodeColors.get(item.name) ?? chrome.other,
              name: item.name.trim(),
              value: money.amount(Math.round(item.value * 1000)),
            },
          ]);
        },
      },
      series: [
        {
          type: 'sankey',
          left: 8,
          right: 130,
          top: 12,
          bottom: 12,
          nodeWidth: 14,
          nodeGap: 14,
          draggable: false,
          emphasis: { focus: 'adjacency' as const },
          lineStyle: { color: 'gradient' as const, opacity: 0.25, curveness: 0.55 },
          itemStyle: { borderWidth: 0 },
          label: {
            color: chrome.inkPrimary,
            fontSize: 12,
            formatter: (params: { name: string }) => params.name.trim(),
          },
          data: graph.nodes.map((node) => ({
            name: node.name,
            itemStyle: { color: nodeColors.get(node.name) },
            cursor: node.name === 'Other spending' ? 'pointer' : 'default',
          })),
          links: graph.links.map((link) => ({
            source: link.source,
            target: link.target,
            value: link.value / 1000,
          })),
        },
      ],
    };
  }, [dimensionLabel, graph, money, nodeColors, otherRows, palette, showingOther]);

  const largest = destinationRows[0];

  return (
    <ReportShell
      title="Money Map"
      hero={
        <AnimatedNumber
          value={graph.totalIncome}
          formatter={(value) => money.amount(value)}
          rounding="integer"
        />
      }
      subtitle={
        showingOther
          ? `Inside Other spending · ${collapsedGraph.foldedDestinations.length} ${dimensionLabel}`
          : savingsRate === null
            ? `Every stream from income to ${dimensionLabel}`
            : `Income → ${dimensionLabel}; ${savingsRate >= 0 ? `${savingsRate.toFixed(0)}% saved` : `overspent by ${money.amount(-net)}`}`
      }
      controls={
        <ModeToggle
          value={dimension}
          onChange={(nextDimension) => {
            setDimension(nextDimension);
            setOtherExpanded(false);
          }}
          ariaLabel="Money Map spending detail"
          options={[
            { value: 'group', label: 'Groups', icon: Layers3 },
            { value: 'category', label: 'Categories', icon: Tags },
          ]}
        />
      }
      chart={
        <EChart
          option={option}
          ariaLabel={
            showingOther ? `Other spending ${dimensionLabel} breakdown` : 'Income to spending flow'
          }
          className="h-[440px]"
          onMarkClick={(mark) => {
            if (mark.name?.trim() === 'Other spending') {
              setOtherExpanded(true);
            }
          }}
        />
      }
      isLoading={data.isLoading}
      isEmpty={isEmpty}
      emptyText="No income or spending to map in this period."
      panel={
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Income" value={money.tile(graph.totalIncome)} />
            <StatTile
              label="Spending"
              value={money.tile(graph.totalSpending)}
              valueClassName={
                graph.totalSpending > 0 ? 'text-red-600 dark:text-red-300' : undefined
              }
            />
            <StatTile
              label={net >= 0 ? 'Saved' : 'Overspent'}
              value={money.tile(Math.abs(net))}
              valueClassName={trendTextClass(net)}
            />
            <StatTile
              label="Savings rate"
              value={savingsRate === null ? '—' : `${savingsRate.toFixed(0)}%`}
              valueClassName={savingsRate !== null ? trendTextClass(savingsRate) : undefined}
            />
          </div>
          {showingOther ? (
            <button
              type="button"
              onClick={() => setOtherExpanded(false)}
              className="mt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              ← Collapse Other
            </button>
          ) : null}
          <PanelSectionTitle>
            {showingOther
              ? `Inside Other · ${dimensionLabel}`
              : dimension === 'group'
                ? 'Destination groups'
                : 'Destination categories'}
          </PanelSectionTitle>
          <div className={showingOther ? 'max-h-[300px] overflow-y-auto pr-1' : undefined}>
            {destinationRows.map((row) => {
              const isOther = row.name === 'Other spending';
              return (
                <ProportionRow
                  key={row.name}
                  color={row.color}
                  name={
                    isOther
                      ? `Other spending (${collapsedGraph.foldedDestinations.length} ${dimensionLabel}) — inspect`
                      : row.name
                  }
                  value={money.amount(row.value)}
                  fraction={largest && largest.value > 0 ? row.value / largest.value : 0}
                  onClick={isOther ? () => setOtherExpanded(true) : undefined}
                  expanded={isOther ? false : undefined}
                />
              );
            })}
          </div>
        </>
      }
    />
  );
}
