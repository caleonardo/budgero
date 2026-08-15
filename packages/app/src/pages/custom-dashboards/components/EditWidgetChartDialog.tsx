import { Trans } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import type { ChartConfiguration } from '@budgero/core/browser';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import type { QueryResult } from '@shared/lib/sql/report-query-executor';
import type { ExtendedChartType } from '@shared/lib/analytics/visualization-labels';
import { useAsyncDialogAction } from '@shared/hooks/useAsyncDialogAction';

interface ChartFormData {
  chartType: ExtendedChartType;
  title: string;
  xAxisColumn: string;
  yAxisColumn: string;
  groupByColumn: string;
  aggregateFunction: ChartConfiguration['aggregateFunction'];
}

interface EditWidgetChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialChart: ChartConfiguration | null;
  queryResult: QueryResult | null;
  reportName?: string;
  onSave: (chart: ChartConfiguration) => Promise<void>;
}

const DEFAULT_FORM: ChartFormData = {
  chartType: 'bar',
  title: '',
  xAxisColumn: '',
  yAxisColumn: '',
  groupByColumn: '__none__',
  aggregateFunction: 'SUM',
};

export function EditWidgetChartDialog({
  open,
  onOpenChange,
  initialChart,
  queryResult,
  reportName,
  onSave,
}: EditWidgetChartDialogProps) {
  const [form, setForm] = useState<ChartFormData>(DEFAULT_FORM);
  const { isRunning: isSaving, run: runSave } = useAsyncDialogAction({
    errorMessage: 'Failed to update chart',
    onSuccess: () => onOpenChange(false),
  });

  useEffect(() => {
    if (!open || !initialChart) return;
    // Pre-existing reset-on-open pattern; intentional dialog-state reset.
    // eslint-disable-next-line react-compiler/react-compiler
    setForm({
      chartType: initialChart.chartType,
      title: initialChart.title ?? '',
      xAxisColumn: initialChart.xAxisColumn,
      yAxisColumn: initialChart.yAxisColumn,
      groupByColumn: initialChart.groupByColumn ?? '__none__',
      aggregateFunction: initialChart.aggregateFunction,
    });
  }, [open, initialChart]);

  const requiredColumnsSelected =
    form.chartType === 'stat'
      ? Boolean(form.yAxisColumn)
      : Boolean(form.xAxisColumn && form.yAxisColumn);

  const handleSave = async () => {
    if (!initialChart) return;
    if (!queryResult || queryResult.columns.length === 0) {
      toast.error('Run the report query first, then edit this chart.');
      return;
    }
    if (!requiredColumnsSelected) {
      toast.error(
        form.chartType === 'stat'
          ? 'Please select a metric column.'
          : 'Please select both X and Y axis columns.'
      );
      return;
    }

    await runSave(() =>
      onSave({
        ...initialChart,
        chartType: form.chartType,
        title: form.title.trim() || undefined,
        xAxisColumn: form.chartType === 'stat' ? form.yAxisColumn : form.xAxisColumn,
        yAxisColumn: form.yAxisColumn,
        groupByColumn: form.groupByColumn === '__none__' ? undefined : form.groupByColumn,
        aggregateFunction: form.aggregateFunction,
      })
    );
  };

  const columns = queryResult?.columns ?? [];

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSaving && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit Chart</Trans>
          </DialogTitle>
          <DialogDescription>
            Update the selected chart widget configuration{reportName ? ` for ${reportName}` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                <Trans>Chart Type</Trans>
              </Label>
              <Select
                value={form.chartType}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    chartType: value as ExtendedChartType,
                    groupByColumn:
                      value === 'pie' || value === 'stat' ? '__none__' : prev.groupByColumn,
                    xAxisColumn:
                      value === 'stat' ? prev.yAxisColumn || prev.xAxisColumn : prev.xAxisColumn,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <Trans>Bar Chart</Trans>
                  </SelectItem>
                  <SelectItem value="line">
                    <Trans>Line Chart</Trans>
                  </SelectItem>
                  <SelectItem value="area">
                    <Trans>Area Chart</Trans>
                  </SelectItem>
                  <SelectItem value="pie">
                    <Trans>Pie Chart</Trans>
                  </SelectItem>
                  <SelectItem value="scatter">
                    <Trans>Scatter Plot</Trans>
                  </SelectItem>
                  <SelectItem value="table">
                    <Trans>Table</Trans>
                  </SelectItem>
                  <SelectItem value="stat">
                    <Trans>Stat</Trans>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                <Trans>Title (Optional)</Trans>
              </Label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Chart title..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.chartType !== 'stat' && (
              <div className="space-y-2">
                <Label>{form.chartType === 'pie' ? 'Labels' : 'X-Axis'} *</Label>
                <Select
                  value={form.xAxisColumn}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, xAxisColumn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={form.chartType === 'stat' ? 'sm:col-span-2 space-y-2' : 'space-y-2'}>
              <Label>
                {form.chartType === 'pie'
                  ? 'Values'
                  : form.chartType === 'stat'
                    ? 'Metric Column'
                    : 'Y-Axis'}{' '}
                *
              </Label>
              <Select
                value={form.yAxisColumn}
                onValueChange={(value) => setForm((prev) => ({ ...prev, yAxisColumn: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!['pie', 'stat'].includes(form.chartType) && (
              <div className="space-y-2">
                <Label>
                  <Trans>Group By</Trans>
                </Label>
                <Select
                  value={form.groupByColumn}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, groupByColumn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <Trans>None</Trans>
                    </SelectItem>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div
              className={
                ['pie', 'stat'].includes(form.chartType) ? 'sm:col-span-2 space-y-2' : 'space-y-2'
              }
            >
              <Label>
                <Trans>Aggregate Function</Trans>
              </Label>
              <Select
                value={form.aggregateFunction}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    aggregateFunction: value as ChartConfiguration['aggregateFunction'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUM">
                    <Trans>Sum</Trans>
                  </SelectItem>
                  <SelectItem value="COUNT">
                    <Trans>Count</Trans>
                  </SelectItem>
                  <SelectItem value="AVG">
                    <Trans>Average</Trans>
                  </SelectItem>
                  <SelectItem value="MAX">
                    <Trans>Maximum</Trans>
                  </SelectItem>
                  <SelectItem value="MIN">
                    <Trans>Minimum</Trans>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={() => void handleSave()} disabled={isSaving || !requiredColumnsSelected}>
            {isSaving ? 'Saving...' : 'Update Chart'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
