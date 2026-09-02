import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TransactionLabelBadge } from './TransactionLabelBadge';

describe('TransactionLabelBadge', () => {
  it('renders the label color as a tinted pill and color dot', () => {
    render(<TransactionLabelBadge label="Family" color="#ff00aa" />);

    const badge = screen.getByLabelText('Label: Family');
    expect(badge).toHaveStyle({
      backgroundColor: 'rgba(255, 0, 170, 0.12)',
      borderColor: 'rgba(255, 0, 170, 0.4)',
    });
    expect(badge.querySelector('[aria-hidden="true"]')).toHaveStyle({
      backgroundColor: '#ff00aa',
    });
  });

  it('uses the neutral fallback when an older row has no label color', () => {
    render(<TransactionLabelBadge label="Imported" color={null} />);

    expect(screen.getByLabelText('Label: Imported')).toHaveStyle({
      backgroundColor: 'rgba(156, 163, 175, 0.12)',
      borderColor: 'rgba(156, 163, 175, 0.4)',
    });
  });
});
