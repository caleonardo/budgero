import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GetTransactionsByAccountRow } from '@budgero/core/browser';
import { useRegisterKeyboard } from './useRegisterKeyboard';

const rows = [1, 2, 3, 4].map((ID) => ({ ID }) as GetTransactionsByAccountRow);
const press = (key: string, init: KeyboardEventInit = {}) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
  });

function setup(rowSelection: Record<string, boolean> = {}) {
  const handlers = {
    onSelectionChange: vi.fn(),
    onSelectAll: vi.fn(),
    onClearSelection: vi.fn(),
    scrollToRow: vi.fn(),
  };
  const hook = renderHook(() =>
    useRegisterKeyboard({ enabled: true, transactions: rows, rowSelection, ...handlers })
  );
  return { hook, ...handlers };
}

describe('useRegisterKeyboard', () => {
  it('moves the cursor with arrows and toggles the row with Space', () => {
    const { hook, onSelectionChange, scrollToRow } = setup();
    press('ArrowDown');
    press('ArrowDown');
    expect(hook.result.current.cursorId).toBe(2);
    expect(scrollToRow).toHaveBeenLastCalledWith(1);
    press(' ');
    expect(onSelectionChange).toHaveBeenCalledWith('2', true);
  });

  it('extends the selection from the starting row with Shift+arrows', () => {
    const { onSelectionChange } = setup();
    press('ArrowDown');
    press('ArrowDown', { shiftKey: true });
    press('ArrowDown', { shiftKey: true });
    expect(onSelectionChange).toHaveBeenLastCalledWith('1', true, ['1', '2', '3'], true);
  });

  it('selects all with Ctrl+A and clears with Esc', () => {
    const { onSelectAll, onClearSelection } = setup({ '1': true });
    press('a', { ctrlKey: true });
    expect(onSelectAll).toHaveBeenCalled();
    press('Escape');
    expect(onClearSelection).toHaveBeenCalled();
  });
});
