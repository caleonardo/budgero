import { useMemo, useState } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { Layers3, Tags } from 'lucide-react';
import { trendTextClass } from '@shared/lib/amount-color';
import { EChart } from '@shared/ui/echart';
import { AnimatedNumber } from '@shared/ui/animated-number';
import {
  buildDimensionTotals,
  buildFlowGraph,
  type FlowSpendingDimension,
} from '../analytics-model';
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

type FlowDrilldown = { kind: 'other' } | { kind: 'group'; name: string };

interface FlowReportProps {
  data: AnalyticsData;
}

export function FlowReport({ data }: FlowReportProps) {
  const [dimension, setDimension] = useState<FlowSpendingDimension>('group');
  const [drilldown, setDrilldown] = useState<FlowDrilldown | null>(null);
  const palette = usePalette();
  const money = useMoneyFormatters();

  const collapsedGraph = useMemo(
    () => buildFlowGraph(data.txns, data.onBudgetAccountIds, MAX_DESTINATIONS, dimension),
    [data.txns, data.onBudgetAccountIds, dimension]
  );
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
        key: `other:${destination.name}:${index}`,
        color: palette.series[index % palette.series.length],
      })),
    [collapsedGraph.foldedDestinations, palette.series]
  );

  const groupCategoryRows = useMemo(() => {
    if (drilldown?.kind !== 'group') return [];
    return buildDimensionTotals(
      data.txns.filter((txn) => txn.groupName === drilldown.name),
      'category',
      data.onBudgetAccountIds
    ).map((category, index) => ({
      key: category.key,
      name: category.name,
      value: category.total,
      color: palette.series[index % palette.series.length],
    }));
  }, [data.onBudgetAccountIds, data.txns, drilldown, palette.series]);

  const drilldownRows = drilldown?.kind === 'group' ? groupCategoryRows : otherRows;
  const showingDrilldown = drilldown !== null && drilldownRows.length > 0;
  const drilldownTitle = drilldown?.kind === 'group' ? drilldown.name : 'Other spending';
  const drilldownItemLabel = drilldown?.kind === 'group' ? 'categories' : dimensionLabel;

  const drillableGroupNames = useMemo(
    () =>
      new Set(
        graph.nodes
          .filter((node) => node.slot === 'group' && node.name.trim() !== 'Other spending')
          .map((node) => node.name.trim())
      ),
    [graph.nodes]
  );

  const destinationRows = useMemo(() => {
    if (showingDrilldown) return drilldownRows;

    return graph.links
      .filter((link) => link.source === 'Income')
      .map((link) => ({
        key: `destination:${link.target}`,
        name: link.target.trim(),
        value: link.value,
        color: nodeColors.get(link.target) ?? palette.chrome.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [drilldownRows, graph.links, nodeColors, palette.chrome.other, showingDrilldown]);

  const option = useMemo<EChartsCoreOption>(() => {
    const { chrome } = palette;
    if (showingDrilldown) {
      const drilldownTotal = drilldownRows.reduce((sum, row) => sum + row.value, 0);
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
            return tooltipHtml(`Inside ${drilldownTitle} · ${drilldownItemLabel}`, [
              {
                color: item.data.itemStyle?.color ?? chrome.other,
                name: item.name,
                value: `${money.amount(value)} · ${drilldownTotal > 0 ? `${((value / drilldownTotal) * 100).toFixed(1)}%` : '0%'}`,
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
            data: drilldownRows.map((row) => ({
              name: row.name,
              value: row.value / 1000,
              itemStyle: { color: row.color },
              label: { color: inkOnFill(row.color) },
              cursor: drilldown?.kind === 'other' && dimension === 'group' ? 'pointer' : 'default',
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
            cursor:
              node.slot === 'group' &&
              (dimension === 'group' || node.name.trim() === 'Other spending')
                ? 'pointer'
                : 'default',
          })),
          links: graph.links.map((link) => ({
            source: link.source,
            target: link.target,
            value: link.value / 1000,
          })),
        },
      ],
    };
  }, [
    dimension,
    drilldown,
    drilldownItemLabel,
    drilldownRows,
    drilldownTitle,
    graph,
    money,
    nodeColors,
    palette,
    showingDrilldown,
  ]);

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
        showingDrilldown
          ? `Inside ${drilldownTitle} · ${drilldownRows.length} ${drilldownItemLabel}`
          : savingsRate === null
            ? `Every stream from income to ${dimensionLabel}`
            : `Income → ${dimensionLabel}; ${savingsRate >= 0 ? `${savingsRate.toFixed(0)}% saved` : `overspent by ${money.amount(-net)}`}`
      }
      controls={
        <ModeToggle
          value={dimension}
          onChange={(nextDimension) => {
            setDimension(nextDimension);
            setDrilldown(null);
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
            showingDrilldown
              ? `${drilldownTitle} ${drilldownItemLabel} breakdown`
              : 'Income to spending flow'
          }
          className="h-[440px]"
          onMarkClick={(mark) => {
            const selectedName = mark.name?.trim();
            if (!selectedName) return;

            if (drilldown?.kind === 'other' && dimension === 'group') {
              if (otherRows.some((row) => row.name === selectedName)) {
                setDrilldown({ kind: 'group', name: selectedName });
              }
              return;
            }

            const selectedNode = graph.nodes[mark.dataIndex];
            if (!selectedNode || selectedNode.slot !== 'group' || selectedNode.name !== mark.name) {
              return;
            }
            if (selectedName === 'Other spending') {
              setDrilldown({ kind: 'other' });
            } else if (dimension === 'group') {
              setDrilldown({ kind: 'group', name: selectedName });
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
          {showingDrilldown ? (
            <button
              type="button"
              onClick={() => setDrilldown(null)}
              className="mt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              ← Back to Money Map
            </button>
          ) : null}
          <PanelSectionTitle>
            {showingDrilldown
              ? `Inside ${drilldownTitle} · ${drilldownItemLabel}`
              : dimension === 'group'
                ? 'Destination groups'
                : 'Destination categories'}
          </PanelSectionTitle>
          <div className={showingDrilldown ? 'max-h-[300px] overflow-y-auto pr-1' : undefined}>
            {destinationRows.map((row) => {
              const isOther = !showingDrilldown && row.name === 'Other spending';
              const isDrillableGroup =
                dimension === 'group' &&
                (showingDrilldown
                  ? drilldown?.kind === 'other'
                  : drillableGroupNames.has(row.name));
              return (
                <ProportionRow
                  key={row.key}
                  color={row.color}
                  name={
                    isOther
                      ? `Other spending (${collapsedGraph.foldedDestinations.length} ${dimensionLabel}) — inspect`
                      : isDrillableGroup
                        ? `${row.name} — inspect`
                        : row.name
                  }
                  value={money.amount(row.value)}
                  fraction={largest && largest.value > 0 ? row.value / largest.value : 0}
                  onClick={
                    isOther
                      ? () => setDrilldown({ kind: 'other' })
                      : isDrillableGroup
                        ? () => setDrilldown({ kind: 'group', name: row.name })
                        : undefined
                  }
                  expanded={isOther || isDrillableGroup ? false : undefined}
                />
              );
            })}
          </div>
        </>
      }
    />
  );
}
