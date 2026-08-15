import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { Input } from '@shared/ui/input';
import { Textarea } from '@shared/ui/textarea';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { Switch } from '@shared/ui/switch';
import { Separator } from '@shared/ui/separator';
import { Field } from '@shared/ui/field';

interface RuleMetadataFormProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  modeValue: 'continuous' | 'one_time' | 'autofill';
  onModeChange: (value: 'continuous' | 'one_time' | 'autofill') => void;
  runOrder: number;
  onRunOrderChange: (value: number) => void;
}

export const RuleMetadataForm = React.memo(function RuleMetadataForm({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  enabled,
  onEnabledChange,
  modeValue,
  onModeChange,
  runOrder,
  onRunOrderChange,
}: RuleMetadataFormProps) {
  const { t } = useLingui();

  const modeHelperText =
    modeValue === 'continuous'
      ? t`Run for every new matching transaction.`
      : modeValue === 'one_time'
        ? t`Mark complete after the first retroactive run.`
        : t`Suggest values while typing in the transaction form.`;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label={t`Rule name`} htmlFor="rule-name">
          <Input
            id="rule-name"
            placeholder={t`e.g. Categorise grocery deliveries`}
            value={name}
            maxLength={80}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </Field>
        <Field label={t`Description`} htmlFor="rule-description">
          <Textarea
            id="rule-description"
            placeholder={t`Optional context for your future self`}
            value={description}
            maxLength={240}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </Field>
      </div>
      <div className="space-y-4 rounded-lg border bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label>
              <Trans>Activation</Trans>
            </Label>
            <p className="text-sm text-muted-foreground">
              <Trans>Toggle to pause the rule without deleting it.</Trans>
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
        <Separator />
        <div className="grid gap-3">
          <Field label={t`Mode`} className="space-y-1" hint={modeHelperText}>
            <Select value={modeValue} onValueChange={onModeChange}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder={t`Select mode`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="continuous">
                  <Trans>Continuous</Trans>
                </SelectItem>
                <SelectItem value="one_time">
                  <Trans>One time</Trans>
                </SelectItem>
                <SelectItem value="autofill">
                  <Trans>Autofill</Trans>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={t`Run order`}
            htmlFor="run-order"
            className="space-y-1"
            hint="Lower numbers run first when multiple rules match the same transaction."
          >
            <Input
              id="run-order"
              type="number"
              min={0}
              value={runOrder}
              onChange={(event) => onRunOrderChange(Number(event.target.value) || 0)}
            />
          </Field>
        </div>
      </div>
    </section>
  );
});
