import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateHintSettingsCard } from './DuplicateHintSettingsCard';

const updateSettings = vi.fn();
const preference = {
  settings: { enabled: true, toleranceBps: 100, dayWindow: 7 },
  updateSettings,
  isLoading: false,
  isError: false,
  isUpdating: false,
};
vi.mock('@shared/hooks/useUserPreferences', () => ({
  useDuplicateHintSettingsPreference: () => preference,
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  cleanup();
  updateSettings.mockReset();
  preference.settings = { enabled: true, toleranceBps: 100, dayWindow: 7 };
});

describe('DuplicateHintSettingsCard', () => {
  it('shows the saved tolerance and date range', () => {
    render(<DuplicateHintSettingsCard />);
    expect(screen.getByRole('switch', { name: 'Warn about possible duplicates' })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Amount' })).toHaveTextContent('Within 1%');
    expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveTextContent('±7 days');
  });

  it('saves the toggle and disables the ranges while off', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DuplicateHintSettingsCard />);

    await user.click(screen.getByRole('switch', { name: 'Warn about possible duplicates' }));
    expect(updateSettings).toHaveBeenCalledWith({ enabled: false }, expect.any(Object));

    preference.settings = { ...preference.settings, enabled: false };
    rerender(<DuplicateHintSettingsCard />);
    expect(screen.getByRole('combobox', { name: 'Amount' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Date range' })).toBeDisabled();
  });

  it('labels zero tolerance as exact and keeps non-preset saved values visible', () => {
    preference.settings = { enabled: true, toleranceBps: 0, dayWindow: 10 };
    render(<DuplicateHintSettingsCard />);
    expect(screen.getByRole('combobox', { name: 'Amount' })).toHaveTextContent('Exact (±0.01)');
    expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveTextContent('±10 days');
  });
});
