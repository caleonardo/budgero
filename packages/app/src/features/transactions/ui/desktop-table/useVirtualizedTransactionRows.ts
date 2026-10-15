import React from 'react';

export const TRANSACTION_ROW_HEIGHT = 64;
export const COMPACT_TRANSACTION_ROW_HEIGHT = 40;
const OVERSCAN_ROWS = 8;
const DEFAULT_VIEWPORT_HEIGHT = 640;

export function useVirtualizedTransactionRows<T>(items: T[], rowHeight = TRANSACTION_ROW_HEIGHT) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(DEFAULT_VIEWPORT_HEIGHT);
  const hasItems = items.length > 0;

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateHeight = () => setViewportHeight(viewport.clientHeight || DEFAULT_VIEWPORT_HEIGHT);
    const observer = new ResizeObserver(updateHeight);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [hasItems]);

  React.useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  const handleScroll = React.useCallback<React.UIEventHandler<HTMLDivElement>>((event) => {
    const nextScrollTop = event.currentTarget.scrollTop;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setScrollTop(nextScrollTop);
      animationFrameRef.current = null;
    });
  }, []);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      const nextScrollTop = Math.max(0, index * rowHeight);
      if (viewportRef.current) {
        viewportRef.current.scrollTop = nextScrollTop;
      }
      setScrollTop(nextScrollTop);
    },
    [rowHeight]
  );

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
  const visibleRowCount = Math.ceil(viewportHeight / rowHeight) + OVERSCAN_ROWS * 2;
  const endIndex = Math.min(items.length, startIndex + visibleRowCount);

  return {
    viewportRef,
    handleScroll,
    scrollToIndex,
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    topSpacerHeight: startIndex * rowHeight,
    bottomSpacerHeight: Math.max(0, (items.length - endIndex) * rowHeight),
    endIndex,
  };
}
