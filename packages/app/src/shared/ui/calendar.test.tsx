import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WeekStartsOnProvider } from '@shared/contexts/WeekStartsOnContext';
import { Calendar } from './calendar';

describe('calendar week preference', () => {
  it('reorders weekdays when changed while preserving the selected date', () => {
    const selected = new Date(2026, 8, 13);
    const onSelect = vi.fn();
    const calendar = (weekStartsOn: 0 | 1) => (
      <WeekStartsOnProvider value={weekStartsOn}>
        <Calendar mode="single" defaultMonth={selected} selected={selected} onSelect={onSelect} />
      </WeekStartsOnProvider>
    );
    const { rerender, container } = render(calendar(0));
    expect(container.querySelectorAll('thead th')[0]).toHaveTextContent('Su');
    expect(container.querySelector('[data-selected]')).toHaveTextContent('13');

    rerender(calendar(1));
    expect(container.querySelectorAll('thead th')[0]).toHaveTextContent('Mo');
    expect(container.querySelectorAll('thead th')[6]).toHaveTextContent('Su');
    expect(container.querySelector('[data-selected]')).toHaveTextContent('13');
    fireEvent.click(screen.getByRole('button', { name: /Monday, September 14/ }));
    expect(onSelect.mock.calls[0][0]).toEqual(new Date(2026, 8, 14));
  });
});
