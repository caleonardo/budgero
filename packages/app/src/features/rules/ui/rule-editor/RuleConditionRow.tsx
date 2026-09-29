import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { CaseSensitive, X } from 'lucide-react';
import type { RuleConditionField, RuleConditionOperator, Account } from '@budgero/core/browser';
import { cn } from '@shared/lib/utils';
import {
  type RuleFormCondition,
  memoOperators,
  payeeOperators,
  amountOperators,
  accountOperators,
  getOperatorLabel,
} from './rule-editor.utils';
import { RuleAccountSelect } from './RuleAccountSelect';

interface RuleConditionRowProps {
  condition: RuleFormCondition;
  index: number;
  accounts: Account[];
  canRemove: boolean;
  onUpdate: (index: number, patch: Partial<RuleFormCondition>) => void;
  onRemove: (index: number) => void;
}

export const RuleConditionRow = React.memo(function RuleConditionRow({
  condition,
  index,
  accounts,
  canRemove,
  onUpdate,
  onRemove,
}: RuleConditionRowProps) {
  const { t } = useLingui();

  const operators =
    condition.field === 'memo'
      ? memoOperators
      : condition.field === 'payee'
        ? payeeOperators
        : condition.field === 'amount'
          ? amountOperators
          : accountOperators;
  const isText = condition.field === 'memo' || condition.field === 'payee';
  const caseSensitive = Boolean(condition.caseSensitive);
  const caseLabel = t`Case sensitive matching`;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card/40 p-2 sm:flex-nowrap">
      <Select
        value={condition.field}
        onValueChange={(value: RuleConditionField) => onUpdate(index, { field: value })}
      >
        <SelectTrigger size="sm" className="w-[calc(50%-0.25rem)] sm:w-28 sm:shrink-0">
          <SelectValue placeholder={t`Field`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="memo">
            <Trans>Memo</Trans>
          </SelectItem>
          <SelectItem value="payee">
            <Trans>Payee</Trans>
          </SelectItem>
          <SelectItem value="amount">
            <Trans>Amount</Trans>
          </SelectItem>
          <SelectItem value="account">
            <Trans>Account</Trans>
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={condition.operator}
        onValueChange={(value: RuleConditionOperator) => onUpdate(index, { operator: value })}
      >
        <SelectTrigger size="sm" className="w-[calc(50%-0.25rem)] sm:w-32 sm:shrink-0">
          <SelectValue placeholder={t`Operator`} />
        </SelectTrigger>
        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>
              {getOperatorLabel(operator)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {isText ? (
          <>
            <Input
              className="h-8"
              placeholder={
                condition.operator === 'regex' ? t`Regular expression` : t`Text to match`
              }
              value={condition.value}
              onChange={(event) => onUpdate(index, { value: event.target.value })}
            />
            <Button
              type="button"
              variant={caseSensitive ? 'secondary' : 'ghost'}
              size="icon"
              aria-pressed={caseSensitive}
              title={caseLabel}
              aria-label={caseLabel}
              onClick={() => onUpdate(index, { caseSensitive: !caseSensitive })}
              className={cn('size-8 shrink-0', !caseSensitive && 'text-muted-foreground')}
            >
              <CaseSensitive className="size-4" />
            </Button>
          </>
        ) : condition.field === 'amount' ? (
          <Input
            className="h-8"
            placeholder={t`Amount`}
            type="number"
            value={condition.value}
            onChange={(event) => onUpdate(index, { value: event.target.value })}
          />
        ) : (
          <RuleAccountSelect
            value={(condition.value ?? '').toString()}
            accounts={accounts}
            onChange={(value) => onUpdate(index, { value })}
          />
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={() => onRemove(index)}
        className="size-8 shrink-0 text-muted-foreground"
        title={t`Remove condition`}
        aria-label={t`Remove condition`}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
});
