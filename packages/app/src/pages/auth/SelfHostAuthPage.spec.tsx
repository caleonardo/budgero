import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SelfHostAuthPage } from './AuthPage';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@shared/hooks/useApiClient', () => ({
  useApiClient: () => api,
  ApiError: class extends Error {},
}));
vi.mock('@clerk/clerk-react', () => ({ SignIn: () => null, SignUp: () => null }));

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
}

function setup(url = '/auth?mode=signup&next=%2Fjoin%2Fexample') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <SelfHostAuthPage />
        <Location />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('self-host registration policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects disabled sign-ups to sign-in while preserving the destination', async () => {
    api.get.mockResolvedValue({ registration_enabled: false });
    setup();
    await screen.findByRole('button', { name: 'Sign in' });
    expect(screen.queryByText('Need an account?')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('mode=signin&next=%2Fjoin%2Fexample')
    );
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'existing' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    api.post.mockRejectedValue(new Error('test'));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/local/login', {
        username: 'existing',
        password: 'password123',
      })
    );
  });

  it('allows the signup form when registration is enabled', async () => {
    api.get.mockResolvedValue({ registration_enabled: true });
    setup();
    await screen.findByRole('button', { name: 'Create account' });
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('keeps sign-in available if loading the policy fails', async () => {
    api.get.mockRejectedValue(new Error('offline'));
    setup('/auth');
    await screen.findByRole('button', { name: 'Sign in' });
    expect(screen.queryByText('Need an account?')).not.toBeInTheDocument();
  });
});
