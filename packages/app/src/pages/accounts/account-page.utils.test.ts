import { describe, expect, it } from 'vitest';
import type { Account } from '@budgero/core/browser';
import { shouldSyncSelectedAccount } from './account-page.utils';

const account = {
  ID: 42,
  Name: 'Travel',
  Type: 'checking',
  Currency: 'USD',
  BudgetID: 7,
} as Account;

describe('shouldSyncSelectedAccount', () => {
  it('syncs a refreshed object even when the account ID is unchanged', () => {
    const refreshed = { ...account, Currency: 'EUR' };

    expect(shouldSyncSelectedAccount(refreshed, account)).toBe(true);
  });

  it('does not write the same query object back into the store', () => {
    expect(shouldSyncSelectedAccount(account, account)).toBe(false);
    expect(shouldSyncSelectedAccount(null, account)).toBe(false);
  });
});
