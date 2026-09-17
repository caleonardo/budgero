import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';
import { MinusCircle, Regex } from 'lucide-react';
import type { RuleActionType, Category, Account } from '@budgero/core/browser';
import { PayeeCombobox } from '@features/payees/ui/PayeeCombobox';
import type { RuleFormAction } from './rule-editor.utils';

interface RuleActionRowProps {
  action: RuleFormAction;
  index: number;
  categories: Category[];
  accounts: Account[];
  budgetId: number;
  canRemove: boolean;
  onUpdate: (index: number, patch: Partial<RuleFormAction>) => void;
  onRemove: (index: number) => void;
}

export const RuleActionRow = React.memo(function RuleActionRow({
  action,
  index,
  categories,
  accounts,
  budgetId,
  canRemove,
  onUpdate,
  onRemove,
}: RuleActionRowProps) {
  const { t } = useLingui();

  const handlePayloadChange = (payload: Record<string, string | number | undefined>) => {
    onUpdate(index, { payload });
  };

  return (
    <div className="rounded-lg border bg-card/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={action.type}
          onValueChange={(value: RuleActionType) => onUpdate(index, { type: value })}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={t`Select action`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Trans>Memo</Trans>
              </SelectLabel>
              <SelectItem value="memo.set">
                <Trans>Set memo</Trans>
              </SelectItem>
              <SelectItem value="memo.remove_regex">
                <Trans>Remove pattern from memo</Trans>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>
                <Trans>Category</Trans>
              </SelectLabel>
              <SelectItem value="category.set">
                <Trans>Set category</Trans>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>
                <Trans>Payee</Trans>
              </SelectLabel>
              <SelectItem value="payee.set">
                <Trans>Set payee</Trans>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>
                <Trans>Amount</Trans>
              </SelectLabel>
              <SelectItem value="amount.set">
                <Trans>Set amount</Trans>
              </SelectItem>
              <SelectItem value="amount.adjust_value">
                <Trans>Adjust by value</Trans>
              </SelectItem>
              <SelectItem value="amount.adjust_percent">
                <Trans>Adjust by %</Trans>
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>
                <Trans>Account</Trans>
              </SelectLabel>
              <SelectItem value="account.set">
                <Trans>Set account</Trans>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canRemove}
          onClick={() => onRemove(index)}
          className="self-start"
        >
          <MinusCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <ActionPayloadEditor
        action={action}
        onChange={handlePayloadChange}
        categories={categories}
        accounts={accounts}
        budgetId={budgetId}
      />
    </div>
  );
});

interface ActionPayloadEditorProps {
  action: RuleFormAction;
  onChange: (payload: Record<string, string | number | undefined>) => void;
  categories: Category[];
  accounts: Account[];
  budgetId: number;
}

const ActionPayloadEditor = React.memo(function ActionPayloadEditor({
  action,
  onChange,
  categories,
  accounts,
  budgetId,
}: ActionPayloadEditorProps) {
  const { t } = useLingui();

  switch (action.type) {
    case 'memo.remove_regex': {
      return (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>
              <Trans>Pattern</Trans>
            </Label>
            <Input
              placeholder="e.g. (#\d{4})"
              value={action.payload.pattern ?? ''}
              onChange={(event) => onChange({ ...action.payload, pattern: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1">
              <Trans>
                Flags
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Regex className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      <Trans>
                        Accepts standard JavaScript regex flags, e.g. <code>gi</code>for global,
                        case-insensitive matches.
                      </Trans>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Trans>
            </Label>
            <Input
              placeholder="gi"
              value={action.payload.flags ?? 'gi'}
              onChange={(event) =>
                onChange({ ...action.payload, flags: event.target.value || 'gi' })
              }
            />
          </div>
        </div>
      );
    }
    case 'memo.set': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Memo</Trans>
          </Label>
          <Input
            placeholder={t`e.g. Groceries at Walmart`}
            value={action.payload.memo ?? ''}
            onChange={(event) => onChange({ memo: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            <Trans>The memo text to set for matching transactions.</Trans>
          </p>
        </div>
      );
    }
    case 'category.set': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Category</Trans>
          </Label>
          <Select
            value={(action.payload.categoryId ?? '').toString()}
            onValueChange={(value) => onChange({ categoryId: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t`Select category`} />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <SelectItem value="">
                  <Trans>No categories</Trans>
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.ID} value={category.ID.toString()}>
                    {category.Name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    case 'payee.set': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Payee</Trans>
          </Label>
          <PayeeCombobox
            budgetId={budgetId}
            value={String(action.payload.payee ?? '')}
            onChange={(value) => onChange({ payee: value })}
            allowClear
          />
          <p className="text-xs text-muted-foreground">
            <Trans>Choose an existing payee or create a new one. Leave blank to clear it.</Trans>
          </p>
        </div>
      );
    }
    case 'account.set': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Account</Trans>
          </Label>
          <Select
            value={(action.payload.accountId ?? '').toString()}
            onValueChange={(value) => onChange({ accountId: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t`Select account`} />
            </SelectTrigger>
            <SelectContent>
              {accounts.length === 0 ? (
                <SelectItem value="">
                  <Trans>No accounts</Trans>
                </SelectItem>
              ) : (
                accounts.map((account) => (
                  <SelectItem key={account.ID} value={account.ID.toString()}>
                    {account.Name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    case 'amount.set': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>New amount</Trans>
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={action.payload.amount ?? ''}
            onChange={(event) => onChange({ amount: event.target.value })}
          />
        </div>
      );
    }
    case 'amount.adjust_value': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Difference</Trans>
          </Label>
          <Input
            type="number"
            placeholder="e.g. -12.50"
            value={action.payload.delta ?? ''}
            onChange={(event) => onChange({ delta: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            <Trans>Positive numbers increase, negatives decrease the amount.</Trans>
          </p>
        </div>
      );
    }
    case 'amount.adjust_percent': {
      return (
        <div className="mt-4 space-y-1">
          <Label>
            <Trans>Percent</Trans>
          </Label>
          <Input
            type="number"
            placeholder="e.g. -10"
            value={action.payload.percent ?? ''}
            onChange={(event) => onChange({ percent: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            <Trans>Use positive/negative percentages to scale the amount.</Trans>
          </p>
        </div>
      );
    }
    default:
      return null;
  }
});
