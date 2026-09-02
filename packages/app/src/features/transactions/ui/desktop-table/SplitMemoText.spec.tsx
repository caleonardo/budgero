import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SplitMemoText } from './SplitMemoText';

describe('SplitMemoText', () => {
  it('wraps long memo text instead of widening the split-details table', () => {
    const memo = 'A-very-long-memo-without-any-natural-space'.repeat(5);
    render(<SplitMemoText memo={memo} />);

    expect(screen.getByText(memo)).toHaveClass(
      'min-w-0',
      'whitespace-normal',
      'break-words',
      '[overflow-wrap:anywhere]'
    );
  });
});
