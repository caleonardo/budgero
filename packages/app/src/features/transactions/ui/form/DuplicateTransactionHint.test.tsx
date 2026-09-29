import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateTransactionHint } from './DuplicateTransactionHint';

const useSimilarTransactions = vi.fn();
vi.mock('@entities/transaction/api/queries', () => ({
  useSimilarTransactions: (...args: unknown[]) => useSimilarTransactions(...args),
}));

const settings = { enabled: true, toleranceBps: 100, dayWindow: 7 };
vi.mock('@shared/hooks/useUserPreferences', () => ({
  useDuplicateHintSettingsPreference: () => ({ settings }),
}));
const options = { enabled: true, toleranceBps: 100, dayWindow: 7 };

const match = { ID: 7, Date: '2026-09-25', Payee: 'Coffee Shop', Memo: '', AmountNative: -12_450 };

const renderHint = (props: Partial<React.ComponentProps<typeof DuplicateTransactionHint>> = {}) =>
  render(
    <DuplicateTransactionHint
      accountId={3}
      date={new Date(2026, 8, 26)}
      amount={12_400}
      isInflow={false}
      currencyCode="USD"
      enabled
      {...props}
    />
  );

afterEach(() => {
  cleanup();
  useSimilarTransactions.mockReset();
  Object.assign(settings, { enabled: true, toleranceBps: 100, dayWindow: 7 });
});

describe('DuplicateTransactionHint', () => {
  it('queries by account, ISO date, and signed amount, and lists matches', () => {
    useSimilarTransactions.mockReturnValue({ data: [match] });
    renderHint();

    expect(useSimilarTransactions).toHaveBeenCalledWith(3, '2026-09-26', -12_400, options);
    expect(screen.getByText('Possible duplicate')).toBeInTheDocument();
    expect(screen.getByText(/Coffee Shop/)).toBeInTheDocument();
    expect(screen.getByText('12.45 USD')).toBeInTheDocument();
  });

  it('keeps the explanation in an info popover', async () => {
    const user = userEvent.setup();
    useSimilarTransactions.mockReturnValue({ data: [match] });
    renderHint();

    expect(screen.queryByText(/pending charge/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Why is this flagged?' }));
    expect(await screen.findByText(/within 1%\) up to 7 days apart/)).toBeInTheDocument();
  });

  it('follows the saved settings and can be turned off', () => {
    Object.assign(settings, { toleranceBps: 0, dayWindow: 3 });
    useSimilarTransactions.mockReturnValue({ data: [match] });
    const { unmount } = renderHint();
    expect(useSimilarTransactions).toHaveBeenCalledWith(3, '2026-09-26', -12_400, {
      enabled: true,
      toleranceBps: 0,
      dayWindow: 3,
    });
    unmount();

    settings.enabled = false;
    const { container } = renderHint();
    expect(useSimilarTransactions).toHaveBeenLastCalledWith(
      3,
      '2026-09-26',
      -12_400,
      expect.objectContaining({ enabled: false })
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('signs inflows positively', () => {
    useSimilarTransactions.mockReturnValue({ data: [] });
    renderHint({ isInflow: true });
    expect(useSimilarTransactions).toHaveBeenCalledWith(3, '2026-09-26', 12_400, options);
  });

  it('renders nothing without matches or when disabled', () => {
    useSimilarTransactions.mockReturnValue({ data: [] });
    const { container, rerender } = renderHint();
    expect(container).toBeEmptyDOMElement();

    useSimilarTransactions.mockReturnValue({ data: [match] });
    rerender(
      <DuplicateTransactionHint
        accountId={3}
        date={new Date(2026, 8, 26)}
        amount={12_400}
        isInflow={false}
        currencyCode="USD"
        enabled={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('stays dismissed for the same entry and returns when the amount changes', async () => {
    const user = userEvent.setup();
    useSimilarTransactions.mockReturnValue({ data: [match] });
    const { rerender } = renderHint();

    await user.click(screen.getByRole('button', { name: 'Not a duplicate' }));
    expect(screen.queryByTestId('duplicate-transaction-hint')).not.toBeInTheDocument();

    rerender(
      <DuplicateTransactionHint
        accountId={3}
        date={new Date(2026, 8, 26)}
        amount={12_450}
        isInflow={false}
        currencyCode="USD"
        enabled
      />
    );
    expect(screen.getByTestId('duplicate-transaction-hint')).toBeInTheDocument();
  });
});
