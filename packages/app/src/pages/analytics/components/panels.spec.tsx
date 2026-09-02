import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProportionRow } from './panels';

describe('ProportionRow', () => {
  it('becomes an accessible disclosure control when a drill-down is available', () => {
    const onClick = vi.fn();

    render(
      <ProportionRow
        color="#64748b"
        name="Other spending (3 groups) — inspect"
        value="$120.00"
        fraction={0.5}
        onClick={onClick}
        expanded={false}
      />
    );

    const control = screen.getByRole('button', { name: /Other spending/ });
    expect(control).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(control);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
