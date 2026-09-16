import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateRangePicker from './date-range-picker';

describe('DateRangePicker', () => {
  it('renders start and end fields and switches between day and month view', () => {
    const onChange = vi.fn();
    const value = {
      from: new Date(2026, 2, 20), // Mar 20, 2026
      to: new Date(2026, 8, 16), // Sep 16, 2026
    };

    render(<DateRangePicker value={value} onChange={onChange} />);

    // Check Start and End buttons
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();

    // Default view shows DayPicker with month caption button
    const captionBtn = screen.getByRole('button', { name: /Change month and year/i });
    expect(captionBtn).toBeInTheDocument();
    expect(captionBtn).toHaveTextContent(/September 2026/i);

    // Clicking caption opens MonthPickerPopover-style grid
    fireEvent.click(captionBtn);

    // Year stepper should show 2026
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous year' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next year' })).toBeInTheDocument();

    // Month grid shows short month names
    expect(screen.getByRole('button', { name: 'Jan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dec' })).toBeInTheDocument();

    // Navigate to previous year
    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByText('2025')).toBeInTheDocument();

    // Click May 2025 - should switch back to "Choose a day" view with May 2025 in caption
    fireEvent.click(screen.getByRole('button', { name: 'May' }));

    const updatedCaption = screen.getByRole('button', { name: /Change month and year/i });
    expect(updatedCaption).toHaveTextContent(/May 2025/i);
  });

  it('supports "Choose a day" and "Jump to today" in month view', () => {
    const value = {
      from: new Date(2026, 2, 20),
      to: new Date(2026, 8, 16),
    };

    render(<DateRangePicker value={value} />);

    const captionBtn = screen.getByRole('button', { name: /Change month and year/i });
    fireEvent.click(captionBtn);

    // Click Day picker
    const backBtn = screen.getByRole('button', { name: /Day picker/i });
    fireEvent.click(backBtn);
    expect(screen.getByRole('button', { name: /Change month and year/i })).toBeInTheDocument();

    // Re-open month view and test Jump to today
    fireEvent.click(screen.getByRole('button', { name: /Change month and year/i }));
    const jumpBtn = screen.getByRole('button', { name: /Jump to today/i });
    fireEvent.click(jumpBtn);
    expect(screen.getByRole('button', { name: /Change month and year/i })).toBeInTheDocument();
  });

  it('allows fast selection of a date several years in the past and picking a day', () => {
    const onChange = vi.fn();
    const value = {
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 16),
    };

    render(<DateRangePicker value={value} onChange={onChange} />);

    // Click Start field to arm 'from'
    fireEvent.click(screen.getByText('Start'));

    // Click caption to open MonthPicker
    fireEvent.click(screen.getByRole('button', { name: /Change month and year/i }));

    // Click previous year 5 times (2026 -> 2021)
    const prevYearBtn = screen.getByRole('button', { name: 'Previous year' });
    for (let i = 0; i < 5; i++) {
      fireEvent.click(prevYearBtn);
    }
    expect(screen.getByText('2021')).toBeInTheDocument();

    // Select Jan
    fireEvent.click(screen.getByRole('button', { name: 'Jan' }));

    // Now in day view of January 2021
    const caption = screen.getByRole('button', { name: /Change month and year/i });
    expect(caption).toHaveTextContent(/January 2021/i);

    // Pick day 15
    const day15Btn = screen.getByText('15');
    fireEvent.click(day15Btn);

    // Verify onChange was called with from: Jan 15, 2021
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        from: new Date(2021, 0, 15),
      })
    );
  });
});
