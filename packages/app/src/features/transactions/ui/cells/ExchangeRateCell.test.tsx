import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ExchangeRateCell } from './ExchangeRateCell';

describe('ExchangeRateCell', () => {
  it('does not commit a rounded rate when the editor is opened and closed unchanged', async () => {
    const onCommit = vi.fn();
    const user = userEvent.setup();

    render(<ExchangeRateCell value={0.0098792619} onCommit={onCommit} />);

    await user.click(screen.getByRole('button', { name: '0.0098792619' }));
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('0.0098792619');

    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('preserves precise fractional input on commit', async () => {
    const onCommit = vi.fn();
    const user = userEvent.setup();

    render(<ExchangeRateCell value={1} onCommit={onCommit} />);
    await user.click(screen.getByRole('button', { name: '1.00' }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '0.01500386752667713{Enter}');

    expect(onCommit).toHaveBeenCalledWith(0.01500386752667713);
  });

  it('keeps editing and explains when conversion validation rejects the rate', async () => {
    const onCommit = vi.fn();
    const user = userEvent.setup();

    render(
      <ExchangeRateCell
        value={1}
        onCommit={onCommit}
        validateRate={(rate) => (rate > 10 ? 'Check the decimal point.' : null)}
      />
    );
    await user.click(screen.getByRole('button', { name: '1.00' }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '1500{Enter}');

    expect(screen.getByText('Check the decimal point.')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('requires explicit confirmation for an extreme change', async () => {
    const onCommit = vi.fn();
    const user = userEvent.setup();

    render(<ExchangeRateCell value={1} onCommit={onCommit} />);
    await user.click(screen.getByRole('button', { name: '1.00' }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '1000{Enter}');

    expect(onCommit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Use anyway' }));
    expect(onCommit).toHaveBeenCalledWith(1000);
  });
});
