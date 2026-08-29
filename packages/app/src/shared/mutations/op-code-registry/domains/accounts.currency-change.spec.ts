import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeMutationOp } from '@shared/mutations/op-code-registry';

const accountMocks = vi.hoisted(() => ({ updateAccount: vi.fn() }));

vi.mock('@shared/runtime/global', () => ({
  getRuntime: () => ({ services: () => ({ accounts: accountMocks }) }),
}));

const payload = {
  id: 42,
  name: 'Travel',
  type: 'checking',
  currency: 'EUR',
  metadata: undefined,
  onBudget: true,
};

describe('accounts.update currency change mode', () => {
  beforeEach(() => accountMocks.updateAccount.mockReset());

  it('forwards reinterpret mode and defaults older payloads to conversion', async () => {
    await executeMutationOp('accounts.update', {
      ...payload,
      currencyChangeMode: 'reinterpret',
    });
    expect(accountMocks.updateAccount).toHaveBeenLastCalledWith(
      42,
      'Travel',
      'checking',
      'EUR',
      undefined,
      true,
      'reinterpret'
    );

    await executeMutationOp('accounts.update', payload);
    expect(accountMocks.updateAccount).toHaveBeenLastCalledWith(
      42,
      'Travel',
      'checking',
      'EUR',
      undefined,
      true,
      'convert'
    );
  });
});
