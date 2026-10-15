'use client';

import { useSyncExternalStore } from 'react';

const MAC_KEYS: Record<string, string> = { Ctrl: '⌘', Alt: '⌥', Shift: '⇧', Delete: '⌫' };
// macOS lists modifiers in this order: ⌥⌘T, ⇧⌘Z.
const MAC_ORDER = ['⌥', '⇧', '⌘'];

const subscribe = () => () => {};
// Same check as the app's shortcut labels; iPadOS can report MacIntel.
const isApple = () => /^(Mac|iPhone|iPad|iPod)/i.test(navigator.platform);

/** A shortcut like `Ctrl+Alt+T`, shown as ⌥⌘T on Apple devices. */
export function Keys({ children }: { children: string }) {
  const apple = useSyncExternalStore(subscribe, isApple, () => false);
  const keys = children.split('+');

  if (apple) {
    const mapped = keys.map((key) => MAC_KEYS[key] ?? key);
    const rank = (key: string) => {
      const i = MAC_ORDER.indexOf(key);
      return i === -1 ? MAC_ORDER.length : i;
    };
    return <kbd>{mapped.sort((a, b) => rank(a) - rank(b)).join('')}</kbd>;
  }

  return (
    <>
      {keys.map((key, i) => (
        <span key={key}>
          {i > 0 && '+'}
          <kbd>{key}</kbd>
        </span>
      ))}
    </>
  );
}
