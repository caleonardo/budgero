import { useEffect } from 'react';
import { isTypingTarget } from './useClearedShortcut';

/** With rows selected: this key opens the category picker. */
export const CATEGORIZE_SHORTCUT_KEY = 'G';
/** With rows selected: this key opens the move-to-account picker. */
export const MOVE_SHORTCUT_KEY = 'M';

/**
 * G / M while the batch toolbar is showing. `open` returns false when the
 * action isn't available (e.g. only one account), leaving the key alone.
 */
export function useBatchEditShortcuts(open: (target: 'category' | 'account') => boolean) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.repeat) return;
      if (isTypingTarget(event.target)) return;
      const key = event.key.toUpperCase();
      const target =
        key === CATEGORIZE_SHORTCUT_KEY ? 'category' : key === MOVE_SHORTCUT_KEY ? 'account' : null;
      if (target && open(target)) event.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);
}
