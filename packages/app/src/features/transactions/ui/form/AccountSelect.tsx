/**
 * Account Select Components
 *
 * From/To account selectors for transactions and transfers.
 */

import * as React from 'react';
import { Check, ChevronsUpDown, CreditCard } from 'lucide-react';
import { Button } from '@shared/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { AutofillIndicator } from '@shared/ui/autofill-indicator';
import { cn } from '@shared/lib/utils';

import type { TransactionType } from './TransactionTypeSelector';

interface Account {
  ID: number;
  Name?: string;
  Currency?: string;
}

interface AccountComboboxProps {
  value: string;
  onChange: (value: string) => void;
  accounts: Account[];
  disabled: boolean;
  placeholder: string;
  testId: string;
}

function AccountCombobox({
  value,
  onChange,
  accounts,
  disabled,
  placeholder,
  testId,
}: AccountComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedAccount = accounts.find((account) => account.ID.toString() === value);

  const handleSelect = (accountId: string) => {
    onChange(accountId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-8 w-full justify-between text-left font-normal sm:h-10',
            !selectedAccount && 'text-muted-foreground'
          )}
          data-testid={testId}
        >
          <span className="truncate">{selectedAccount?.Name || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
        align="start"
      >
        <Command loop>
          <CommandInput placeholder="Search accounts…" />
          <CommandList className="max-h-[44dvh] overscroll-contain">
            <CommandEmpty>No matching accounts.</CommandEmpty>
            <CommandGroup heading="Accounts">
              {accounts.map((account) => {
                const accountId = account.ID.toString();
                const accountName = account.Name || 'Unnamed account';
                return (
                  <CommandItem
                    key={account.ID}
                    value={`${accountName} ${accountId}`}
                    onSelect={() => handleSelect(accountId)}
                  >
                    <Check
                      className={cn('h-4 w-4', value === accountId ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{accountName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface FromAccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  accounts: Account[];
  isLoading: boolean;
  transactionType: TransactionType;
  showAutofillIndicator?: boolean;
}

export function FromAccountSelect({
  value,
  onChange,
  accounts,
  isLoading,
  transactionType,
  showAutofillIndicator = false,
}: FromAccountSelectProps) {
  return (
    <div className="space-y-1.5 sm:space-y-2 w-full">
      <div className="flex items-center gap-2">
        {transactionType === 'transfer' ? (
          <span className="text-destructive font-semibold text-lg leading-none">−</span>
        ) : (
          <div className="relative">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <AutofillIndicator
              show={showAutofillIndicator}
              className="absolute -top-0.5 -right-0.5"
            />
          </div>
        )}
        <div className="flex-1">
          <AccountCombobox
            value={value}
            onChange={onChange}
            accounts={accounts}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'Loading accounts...'
                : transactionType === 'transfer'
                  ? 'Select from account'
                  : 'Select account'
            }
            testId="transaction-from-account-select"
          />
        </div>
      </div>
    </div>
  );
}

interface ToAccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  accounts: Account[];
  excludeAccountId: string;
  isLoading: boolean;
}

export function ToAccountSelect({
  value,
  onChange,
  accounts,
  excludeAccountId,
  isLoading,
}: ToAccountSelectProps) {
  const filteredAccounts = accounts.filter((account) => account.ID.toString() !== excludeAccountId);

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <span className="text-success font-semibold text-lg leading-none">+</span>
        <div className="flex-1">
          <AccountCombobox
            value={value}
            onChange={onChange}
            accounts={filteredAccounts}
            disabled={isLoading}
            placeholder={isLoading ? 'Loading accounts...' : 'Select to account'}
            testId="transaction-to-account-select"
          />
        </div>
      </div>
    </div>
  );
}
