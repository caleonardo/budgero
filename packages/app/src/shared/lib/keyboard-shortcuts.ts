/** Display labels only; shortcut handlers accept both Control and Command. */
export function getKeyboardShortcutLabels() {
  const platform = typeof navigator === 'undefined' ? '' : navigator.platform;
  // iPadOS can identify itself as MacIntel when requesting desktop websites.
  const isApple = /^(Mac|iPhone|iPad|iPod)/i.test(platform);

  if (isApple) {
    return {
      search: '⌘K',
      addTransaction: '⌥⌘T',
      mod: (key: string) => `⌘${key}`,
      redo: '⇧⌘Z',
    };
  }

  if (!platform) {
    return {
      search: 'Ctrl/⌘ K',
      addTransaction: 'Ctrl/⌘ + Alt/⌥ + T',
      mod: (key: string) => `Ctrl/⌘ ${key}`,
      redo: 'Ctrl/⌘ + Shift + Z',
    };
  }

  return {
    search: 'Ctrl+K',
    addTransaction: 'Ctrl+Alt+T',
    mod: (key: string) => `Ctrl+${key}`,
    redo: 'Ctrl+Y',
  };
}
