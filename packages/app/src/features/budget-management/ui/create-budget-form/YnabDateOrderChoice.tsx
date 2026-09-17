import { Trans } from '@lingui/react/macro';
import { useId } from 'react';
import type { YNABImportConfig } from '@budgero/core/browser';

type DateOrder = NonNullable<YNABImportConfig['dateOrder']>;

export function YnabDateOrderChoice({
  value,
  onChange,
  disabled = false,
}: {
  value: DateOrder | undefined;
  onChange: (value: DateOrder) => void;
  disabled?: boolean;
}) {
  const name = useId();

  return (
    <fieldset className="space-y-2 rounded-md border p-3 text-xs" disabled={disabled}>
      <legend className="px-1 font-medium">
        <Trans>Dates in this export</Trans>
      </legend>
      <p>
        <Trans>These dates can be read two ways. Select the date format used in YNAB.</Trans>
      </p>
      <label htmlFor={`${name}-month`} className="flex cursor-pointer items-center gap-2">
        <Trans>
          <input
            id={`${name}-month`}
            type="radio"
            name={name}
            checked={value === 'month-first'}
            onChange={() => onChange('month-first')}
          />
          Month first (MM/DD/YYYY): 09/01 is September 1
        </Trans>
      </label>
      <label htmlFor={`${name}-day`} className="flex cursor-pointer items-center gap-2">
        <Trans>
          <input
            id={`${name}-day`}
            type="radio"
            name={name}
            checked={value === 'day-first'}
            onChange={() => onChange('day-first')}
          />
          Day first (DD/MM/YYYY): 09/01 is January 9
        </Trans>
      </label>
    </fieldset>
  );
}
