import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalculatorInput } from './CalculatorInput';

function setup(onSave = vi.fn()) {
  render(
    <CalculatorInput
      inputRef={{ current: null }}
      inputText="12"
      setInputText={vi.fn()}
      evaluatedValue={null}
      hasError={false}
      isEditing
      value={0}
      placeholder="amount"
      autoFocus={false}
      shortcuts={false}
      formatter={String}
      groupSep={undefined}
      decimalSep={undefined}
      normalizeForEvalWithLocalizer={(text) => text}
      onSave={onSave}
      onCancel={vi.fn()}
    />
  );
  return { input: screen.getByPlaceholderText('amount'), onSave };
}

describe('CalculatorInput blur', () => {
  it('saves right away when focus leaves by click', () => {
    const { input, onSave } = setup();
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('saves after focus has moved when leaving with Tab', () => {
    vi.useFakeTimers();
    const { input, onSave } = setup();
    fireEvent.keyDown(input, { key: 'Tab' });
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onSave).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
