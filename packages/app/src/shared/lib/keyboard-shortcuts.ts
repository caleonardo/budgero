/** Display labels only; shortcut handlers accept both Control and Command. */
export function getKeyboardShortcutLabels() {
  const platform = typeof navigator === 'undefined' ? '' : navigator.platform;
  // iPadOS can identify itself as MacIntel when requesting desktop websites.
  const isApple = /^(Mac|iPhone|iPad|iPod)/i.test(platform);

  if (isApple) {
    return { search: '⌘K', addTransaction: '⌥⌘T' };
  }

  if (!platform) {
    return { search: 'Ctrl/⌘ K', addTransaction: 'Ctrl/⌘ + Alt/⌥ + T' };
  }

  return { search: 'Ctrl+K', addTransaction: 'Ctrl+Alt+T' };
}
