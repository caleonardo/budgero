import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useQuickFilterShortcuts } from './useQuickFilterShortcuts';

const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = window) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));

describe('useQuickFilterShortcuts', () => {
  it('toggles the uncleared and uncategorized filters with Shift+C / Shift+U', () => {
    const uncleared = vi.fn();
    const uncategorized = vi.fn();
    renderHook(() => useQuickFilterShortcuts(true, uncleared, uncategorized));
    press('C', { shiftKey: true });
    press('U', { shiftKey: true });
    press('c');
    press('C', { shiftKey: true, metaKey: true });
    expect(uncleared).toHaveBeenCalledOnce();
    expect(uncategorized).toHaveBeenCalledOnce();
  });

  it('ignores keys typed into fields and does nothing when disabled', () => {
    const uncleared = vi.fn();
    const input = document.body.appendChild(document.createElement('input'));
    const { rerender } = renderHook(({ on }) => useQuickFilterShortcuts(on, uncleared, vi.fn()), {
      initialProps: { on: true },
    });
    press('C', { shiftKey: true }, input);
    rerender({ on: false });
    press('C', { shiftKey: true });
    expect(uncleared).not.toHaveBeenCalled();
    input.remove();
  });
});
