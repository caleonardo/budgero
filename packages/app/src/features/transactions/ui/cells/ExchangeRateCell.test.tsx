import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ExchangeRateCell } from './ExchangeRateCell';

describe('ExchangeRateCell', () => {
  it('does not commit a rounded rate when the editor is opened and closed unchanged', async () => {
    const onCommit = vi.fn();
    const user = userEvent.setup();

    render(<ExchangeRateCell value={0.0098792619} onCommit={onCommit} />);

    await user.click(screen.getByRole('button', { name: '0.009879' }));
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('0.0098792619');

    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
  });
});
