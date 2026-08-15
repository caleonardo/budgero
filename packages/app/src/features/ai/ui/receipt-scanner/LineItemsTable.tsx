import { Trans } from '@lingui/react/macro';
import { Badge } from '@shared/ui/badge';
import { Checkbox } from '@shared/ui/checkbox';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { ScrollArea } from '@shared/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { DatePickerCell } from '@features/transactions/ui/cells/DatePickerCell';
import { SearchableCategorySelect } from '@features/category-management/ui/SearchableCategorySelect';
import type { ExtractedTransaction } from './receipt-scanner.utils';

interface LineItemsTableProps {
  budgetId: number;
  transactions: ExtractedTransaction[];
  confidence: number;
  onToggleSelect: (id: string) => void;
  onUpdateTransaction: (id: string, field: string, value: string | number | boolean | null) => void;
}

export function LineItemsTable({
  budgetId,
  transactions,
  confidence,
  onToggleSelect,
  onUpdateTransaction,
}: LineItemsTableProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          <Trans>
            Found {transactions.length}transactions
            <Badge variant="outline" className="ml-2">
              {Math.round(confidence * 100)}% confidence
            </Badge>
          </Trans>
        </div>
      </div>

      <ScrollArea className="flex-1 border rounded-lg">
        <div className="p-2 space-y-3">
          {transactions.map((t) => (
            <LineItem
              key={t.id}
              budgetId={budgetId}
              transaction={t}
              onToggleSelect={onToggleSelect}
              onUpdateTransaction={onUpdateTransaction}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface LineItemProps {
  budgetId: number;
  transaction: ExtractedTransaction;
  onToggleSelect: (id: string) => void;
  onUpdateTransaction: (id: string, field: string, value: string | number | boolean | null) => void;
}

function LineItem({
  budgetId,
  transaction: t,
  onToggleSelect,
  onUpdateTransaction,
}: LineItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        t.selected ? 'border-primary/50 bg-primary/5' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={t.selected}
          onCheckedChange={() => onToggleSelect(t.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">
                <Trans>Date</Trans>
              </Label>
              <DatePickerCell
                value={t.date}
                onCommit={(newDate) => onUpdateTransaction(t.id, 'date', newDate)}
              />
            </div>
            <div>
              <Label className="text-xs">
                <Trans>Type</Trans>
              </Label>
              <Select
                value={t.isExpense ? 'outflow' : 'inflow'}
                onValueChange={(v) => onUpdateTransaction(t.id, 'isExpense', v === 'outflow')}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outflow">
                    <Trans>Outflow</Trans>
                  </SelectItem>
                  <SelectItem value="inflow">
                    <Trans>Inflow</Trans>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">
              <Trans>Amount</Trans>
            </Label>
            <Input
              type="number"
              step="0.01"
              value={t.amount}
              onChange={(e) => onUpdateTransaction(t.id, 'amount', parseFloat(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">
                <Trans>Payee</Trans>
              </Label>
              <Input
                value={t.payee}
                onChange={(e) => onUpdateTransaction(t.id, 'payee', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">
                <Trans>Category</Trans>
              </Label>
              <SearchableCategorySelect
                budgetId={budgetId}
                selectedCategoryId={t.categoryId}
                onCategorySelect={(id) => onUpdateTransaction(t.id, 'categoryId', id)}
                triggerClassName="h-8 text-sm"
              />
              {t.suggestedCategoryName && !t.categoryId && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Trans>
                    AI suggested: <span className="italic">{t.suggestedCategoryName}</span>
                  </Trans>
                </p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-xs">
              <Trans>Memo</Trans>
            </Label>
            <Input
              value={t.memo}
              onChange={(e) => onUpdateTransaction(t.id, 'memo', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
