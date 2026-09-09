import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationSettings } from './RegistrationSettings';

const api = vi.hoisted(() => ({
  getSelfHostRegistration: vi.fn(),
  updateSelfHostRegistration: vi.fn(),
}));
vi.mock('@features/admin/api/useAdminApi', () => ({ useAdminApi: () => api }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <RegistrationSettings />
    </QueryClientProvider>
  );
}

describe('registration settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('saves the toggle and displays the server result', async () => {
    api.getSelfHostRegistration.mockResolvedValue({
      registrationEnabled: true,
      environmentLocked: false,
    });
    api.updateSelfHostRegistration.mockResolvedValue({
      registrationEnabled: false,
      environmentLocked: false,
    });
    setup();
    const toggle = await screen.findByRole('switch', { name: 'Allow public sign-ups' });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(api.updateSelfHostRegistration).toHaveBeenCalledWith(false, expect.anything())
    );
    await waitFor(() => expect(toggle).not.toBeChecked());
  });
  it('locks the toggle when the environment disables registration', async () => {
    api.getSelfHostRegistration.mockResolvedValue({
      registrationEnabled: false,
      environmentLocked: true,
    });
    setup();
    expect(await screen.findByRole('switch')).toBeDisabled();
    expect(screen.getByText(/Disabled by DISABLE_REGISTRATION/)).toBeInTheDocument();
  });
  it('shows a retry action instead of an editable default if loading fails', async () => {
    api.getSelfHostRegistration.mockRejectedValue(new Error('offline'));
    setup();
    await screen.findByRole('alert');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
