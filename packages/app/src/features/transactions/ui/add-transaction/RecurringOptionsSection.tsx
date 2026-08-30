import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, BellRing, Repeat2 } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Field } from '@shared/ui/field';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { MonthYearCalendar } from '@shared/ui/MonthYearCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { Switch } from '@shared/ui/switch';
import {
  frequencyOptionsFor,
  type RecurringEndMode,
  type RecurringFormSettings,
} from './recurring-form';

interface RecurringOptionsSectionProps {
  firstOccurrence: Date | null;
  settings: RecurringFormSettings;
  onChange: (settings: RecurringFormSettings) => void;
}

export const RecurringOptionsSection = React.memo(function RecurringOptionsSection({
  firstOccurrence,
  settings,
  onChange,
}: RecurringOptionsSectionProps) {
  const [endDateOpen, setEndDateOpen] = React.useState(false);
  const frequencyOptions = React.useMemo(
    () => frequencyOptionsFor(settings.frequency),
    [settings.frequency]
  );
  const selectedEndDate = React.useMemo(() => {
    if (!settings.endDate) return null;
    const [year, month, day] = settings.endDate.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
  }, [settings.endDate]);
  const minEndDate = firstOccurrence ?? new Date();

  const update = <K extends keyof RecurringFormSettings>(key: K, value: RecurringFormSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <section
      className="mt-4 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4"
      data-testid="recurring-options"
    >
      <div className="flex items-start gap-3">
        <Repeat2 className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium">Recurring schedule</p>
          <p className="text-xs text-muted-foreground">
            The transaction date above is the first occurrence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cadence" className="space-y-2">
          <Select value={settings.frequency} onValueChange={(value) => update('frequency', value)}>
            <SelectTrigger data-testid="recurring-frequency-select">
              <SelectValue placeholder="Select cadence" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Ends" className="space-y-2">
          <Select
            value={settings.endMode}
            onValueChange={(value) => update('endMode', value as RecurringEndMode)}
          >
            <SelectTrigger data-testid="recurring-end-mode-select">
              <SelectValue placeholder="Never" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="date">On a date</SelectItem>
              <SelectItem value="count">After N occurrences</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {settings.endMode === 'date' && (
        <Field label="Last occurrence on or before" className="space-y-2">
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start gap-2">
                <CalendarIcon className="h-4 w-4 opacity-70" />
                {selectedEndDate ? format(selectedEndDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" modal>
              <MonthYearCalendar
                selected={selectedEndDate ?? undefined}
                onSelect={(date) => {
                  if (!date) return;
                  update('endDate', format(date, 'yyyy-MM-dd'));
                  setEndDateOpen(false);
                }}
                defaultMonth={selectedEndDate ?? minEndDate}
                disabled={{ before: minEndDate }}
              />
            </PopoverContent>
          </Popover>
        </Field>
      )}

      {settings.endMode === 'count' && (
        <Field
          label="Number of occurrences"
          hint="Includes occurrences already posted or skipped."
          className="space-y-2"
        >
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={settings.occurrenceCount}
            onChange={(event) => update('occurrenceCount', event.target.value)}
            placeholder="e.g. 12"
            data-testid="recurring-occurrence-count-input"
          />
        </Field>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Notify me"
          hint="Days before the due date; use 0 for the same day."
          className="space-y-2"
        >
          <div className="relative">
            <BellRing className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              value={settings.notifyDaysBefore}
              onChange={(event) => update('notifyDaysBefore', event.target.value)}
              className="pl-9"
              data-testid="recurring-notify-days-input"
            />
          </div>
        </Field>

        <div className="space-y-2">
          <Label htmlFor="recurring-active">Status</Label>
          <div className="flex h-10 items-center gap-2 rounded-md border border-input px-3">
            <Switch
              id="recurring-active"
              checked={settings.active}
              onCheckedChange={(checked) => update('active', checked)}
            />
            <span className="text-sm text-muted-foreground">
              {settings.active ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});
