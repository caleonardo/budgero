import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBatchEditShortcuts } from './useBatchEditShortcuts';

const press = (key: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key }));

describe('useBatchEditShortcuts', () => {
  it('opens the category picker with G and the account picker with M', () => {
    const open = vi.fn(() => true);
    renderHook(() => useBatchEditShortcuts(open));
    press('g');
    press('M');
    press('x');
    expect(open.mock.calls).toEqual([['category'], ['account']]);
  });
});
