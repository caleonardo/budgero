import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { TransactionSelectionCheckbox } from '@features/transactions/ui/TransactionSelectionCheckbox';
import { ResizeHandle } from './ResizeHandle';
import type { ColumnWidths } from './useColumnResize';

interface TransactionTableHeaderProps {
  hideAccountColumn?: boolean;
  showBalanceColumn?: boolean;
  showLabelColumn?: boolean;
  showExchangeRateColumn?: boolean;
  allPageRowsSelected: boolean;
  somePageRowsSelected: boolean;
  onToggleSelectPage: (checked: boolean) => void;
  columnWidths: ColumnWidths;
  onResize: (column: keyof ColumnWidths, delta: number) => void;
}

export const TransactionTableHeader = React.memo(function TransactionTableHeader({
  hideAccountColumn = false,
  showBalanceColumn = false,
  showLabelColumn = true,
  showExchangeRateColumn = false,
  allPageRowsSelected,
  somePageRowsSelected,
  onToggleSelectPage,
  columnWidths,
  onResize,
}: TransactionTableHeaderProps) {
  const { t } = useLingui();

  return (
    <TableHeader className="sticky top-0 z-20 bg-background shadow-[0_1px_0_hsl(var(--border))]">
      <TableRow>
        <TableHead
          style={{ width: columnWidths.checkbox }}
          className="relative group px-0 select-none"
        >
          <div className="flex items-center justify-center">
            <TransactionSelectionCheckbox
              fillCell
              checked={somePageRowsSelected ? 'indeterminate' : allPageRowsSelected}
              onCheckedChange={(checked) => onToggleSelectPage(checked === true)}
              aria-label={t`Select all transactions on this page`}
            />
          </div>
          <ResizeHandle column="checkbox" onResize={onResize} />
        </TableHead>
        <TableHead style={{ width: columnWidths.date }} className="relative group">
          <Trans>
            Date
            <ResizeHandle column="date" onResize={onResize} />
          </Trans>
        </TableHead>
        <TableHead style={{ width: columnWidths.memo }} className="relative group">
          <Trans>
            Memo
            <ResizeHandle column="memo" onResize={onResize} />
          </Trans>
        </TableHead>
        {!hideAccountColumn && (
          <TableHead style={{ width: columnWidths.account }} className="relative group">
            <Trans>
              Account
              <ResizeHandle column="account" onResize={onResize} />
            </Trans>
          </TableHead>
        )}
        <TableHead style={{ width: columnWidths.payee }} className="relative group">
          <Trans>
            Payee
            <ResizeHandle column="payee" onResize={onResize} />
          </Trans>
        </TableHead>
        {showLabelColumn && (
          <TableHead style={{ width: columnWidths.label }} className="relative group">
            <Trans>
              Label
              <ResizeHandle column="label" onResize={onResize} />
            </Trans>
          </TableHead>
        )}
        <TableHead style={{ width: columnWidths.category }} className="relative group">
          <Trans>
            Category
            <ResizeHandle column="category" onResize={onResize} />
          </Trans>
        </TableHead>
        <TableHead style={{ width: columnWidths.inflow }} className="text-right relative group">
          <Trans>
            Inflow
            <ResizeHandle column="inflow" onResize={onResize} />
          </Trans>
        </TableHead>
        <TableHead style={{ width: columnWidths.outflow }} className="text-right relative group">
          <Trans>
            Outflow
            <ResizeHandle column="outflow" onResize={onResize} />
          </Trans>
        </TableHead>
        {showExchangeRateColumn && (
          <TableHead
            style={{ width: columnWidths.exchangeRate }}
            className="text-right relative group"
          >
            <Trans>
              Budget rate
              <ResizeHandle column="exchangeRate" onResize={onResize} />
            </Trans>
          </TableHead>
        )}
        {showBalanceColumn && (
          <TableHead style={{ width: columnWidths.balance }} className="text-right relative group">
            <Trans>
              Balance
              <ResizeHandle column="balance" onResize={onResize} />
            </Trans>
          </TableHead>
        )}
        <TableHead style={{ width: columnWidths.status }} className="text-center">
          <Trans>Status</Trans>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
});
