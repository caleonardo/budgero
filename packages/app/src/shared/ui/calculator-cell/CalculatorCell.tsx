// Two boundary contracts over the same calculator internals:
// - CalculatorCell: `value`/`onCommit`/`onValueChange` speak integer
//   MilliUnits (like every stored amount) — 3 decimal places max.
// - CalculatorCellDecimal: plain decimal numbers, for dimensionless values
//   that need more precision (exchange rates, percentages).

import { useEffect, useMemo } from 'react';
import {
  fromDecimal,
  getCurrencyScale,
  MILLIS_PER_UNIT,
  toDecimal,
  type MilliUnits,
} from '@budgero/core/browser';
import { cn } from '@shared/lib/utils';
import { useCalculatorState } from './useCalculatorState';
import { CalculatorDisplay } from './CalculatorDisplay';
import { CalculatorInput } from './CalculatorInput';
import { CalculatorSheet, MobileTrigger } from './CalculatorSheet';

export interface CalculatorCellDecimalProps {
  value: number;
  onCommit: (value: number) => void;
  /** Formats a DECIMAL currency value (the cell converts from milliunits internally). */
  formatter?: (value: number) => string;
  localizer?: Intl.NumberFormat;
  inputAlign?: 'left' | 'center' | 'right';
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  displayFormatter?: (value: number) => string;
  shortcuts?: boolean;
  autoFocus?: boolean;
  editOnFocus?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Fires with the live evaluated value while the user types (null when empty/invalid or not editing). */
  onValueChange?: (value: number | null) => void;
  zeroAsEmpty?: boolean;
  focusSignal?: number;
  useFormatterForDisplay?: boolean;
  commitPrecision?: number;
  /** Fire onCommit on save even when the value equals the seeded one, so
   * parents can tell "user confirmed this value" apart from "never touched". */
  commitUnchanged?: boolean;
  'data-testid'?: string;
}

export function CalculatorCellDecimal({
  value,
  onCommit,
  formatter = (val) => val.toString(),
  localizer,
  inputAlign,
  placeholder = '100 + 50 or 1000 * 0.3',
  className,
  displayClassName,
  inputClassName,
  displayFormatter,
  shortcuts = true,
  autoFocus = false,
  editOnFocus = true,
  onEditingChange,
  onValueChange,
  zeroAsEmpty = false,
  focusSignal = 0,
  useFormatterForDisplay = false,
  commitPrecision = 2,
  commitUnchanged = false,
  'data-testid': testId,
}: CalculatorCellDecimalProps) {
  const displayFormatterFn = displayFormatter ?? formatter;

  const decimalValue = value;

  const state = useCalculatorState({
    value: decimalValue,
    onCommit,
    localizer,
    zeroAsEmpty,
    useFormatterForDisplay,
    displayFormatter: displayFormatterFn,
    autoFocus,
    onEditingChange,
    focusSignal,
    commitPrecision,
    commitUnchanged,
  });

  const { isEditing } = state;
  const { isMobile } = state;

  // Surface the live evaluated value to the parent as the user types.
  useEffect(() => {
    onValueChange?.(isEditing && state.evaluatedValue != null ? state.evaluatedValue : null);
  }, [onValueChange, isEditing, state.evaluatedValue]);

  if (isMobile) {
    return (
      <div className={cn('w-full', className)} data-testid={testId}>
        <MobileTrigger
          value={decimalValue}
          inputText={state.inputText}
          mobileText={state.mobileText}
          zeroAsEmpty={zeroAsEmpty}
          placeholder={placeholder}
          useFormatterForDisplay={useFormatterForDisplay}
          isEditing={isEditing}
          displayFormatter={displayFormatterFn}
          displayClassName={displayClassName}
          inputClassName={inputClassName}
          formatValueForInput={state.formatValueForInput}
          localizer={localizer}
          setMobileText={state.setMobileText}
          setInputText={state.setInputText}
          setMobileOpen={(open) => {
            // This is handled by startEditing which sets mobileOpen internally
            if (open) state.startEditing();
          }}
          onEditingChange={onEditingChange}
        />
        <CalculatorSheet
          open={state.mobileOpen}
          onOpenChange={(open) => {
            if (!open) state.closeMobile();
          }}
          mobileText={state.mobileText}
          setMobileText={state.setMobileText}
          setInputText={state.setInputText}
          mobileError={state.mobileError}
          setMobileError={state.setMobileError}
          hasError={state.hasError}
          evaluatedValue={state.evaluatedValue}
          formatter={formatter}
          decimalSep={state.decimalSep || '.'}
          onCommit={state.commitValue}
          onClose={state.closeMobile}
        />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div data-testid={testId}>
        <CalculatorDisplay
          value={decimalValue}
          displayFormatter={displayFormatterFn}
          placeholder={placeholder}
          zeroAsEmpty={zeroAsEmpty}
          shortcuts={shortcuts}
          className={className}
          displayClassName={displayClassName}
          onStartEditing={state.startEditing}
          editOnFocus={editOnFocus}
        />
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <CalculatorInput
        inputRef={state.inputRef}
        inputText={state.inputText}
        setInputText={state.setInputText}
        evaluatedValue={state.evaluatedValue}
        hasError={state.hasError}
        isEditing={isEditing}
        value={decimalValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        shortcuts={shortcuts}
        inputAlign={inputAlign}
        inputClassName={inputClassName}
        className={className}
        formatter={formatter}
        localizer={localizer}
        groupSep={state.groupSep}
        decimalSep={state.decimalSep}
        normalizeForEvalWithLocalizer={state.normalizeForEvalWithLocalizer}
        onSave={state.saveChanges}
        onCancel={state.cancelEditing}
      />
    </div>
  );
}

export interface CalculatorCellProps
  extends Omit<CalculatorCellDecimalProps, 'value' | 'onCommit' | 'onValueChange'> {
  value: MilliUnits;
  onCommit: (value: MilliUnits) => void;
  onValueChange?: (value: MilliUnits | null) => void;
  /** Currency of the stored amount. Crypto codes store at sat scale (1e8)
   * instead of milliunits, so decimal↔stored conversion follows the
   * registry scale. Omit for budget-currency (milliunit) amounts. */
  currencyCode?: string;
}

/** The scaled-integer-contract cell every stored amount uses. */
export function CalculatorCell({
  value,
  onCommit,
  onValueChange,
  currencyCode,
  commitPrecision,
  formatter,
  localizer,
  displayFormatter,
  ...rest
}: CalculatorCellProps) {
  const scale = currencyCode ? getCurrencyScale(currencyCode) : MILLIS_PER_UNIT;
  const isMilli = scale === MILLIS_PER_UNIT;

  // Crypto cells format their own true-decimal display: store-level localizers
  // follow the milliunit convention and would double-scale here.
  const cryptoDisplay = useMemo(() => {
    if (isMilli || !currencyCode) return null;
    const base = new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 });
    const code = currencyCode.toUpperCase();
    const format = (v: number) => `${base.format(v)} ${code}`;
    return {
      formatter: format,
      localizer: {
        format,
        resolvedOptions: () => base.resolvedOptions(),
        formatToParts: (v?: number) => base.formatToParts(v ?? 0),
      } as Intl.NumberFormat,
    };
  }, [isMilli, currencyCode]);
  const commitScaled = useMemo(
    () =>
      isMilli
        ? (decimal: number) => onCommit(fromDecimal(decimal))
        : (decimal: number) => onCommit(Math.round(decimal * scale) as MilliUnits),
    [onCommit, isMilli, scale]
  );
  const liveScaled = useMemo(
    () =>
      onValueChange
        ? (decimal: number | null) =>
            onValueChange(
              decimal == null
                ? null
                : isMilli
                  ? fromDecimal(decimal)
                  : (Math.round(decimal * scale) as MilliUnits)
            )
        : undefined,
    [onValueChange, isMilli, scale]
  );
  return (
    <CalculatorCellDecimal
      value={isMilli ? toDecimal(value) : value / scale}
      onCommit={commitScaled}
      onValueChange={liveScaled}
      commitPrecision={commitPrecision ?? (isMilli ? undefined : 8)}
      formatter={cryptoDisplay?.formatter ?? formatter}
      localizer={cryptoDisplay?.localizer ?? localizer}
      displayFormatter={cryptoDisplay?.formatter ?? displayFormatter}
      {...rest}
    />
  );
}
