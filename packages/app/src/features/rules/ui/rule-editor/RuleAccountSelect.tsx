import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { Account } from '@budgero/core/browser';
import { Button } from '@shared/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { cn } from '@shared/lib/utils';

interface RuleAccountSelectProps {
  value: string;
  accounts: Account[];
  onChange: (accountId: string) => void;
  className?: string;
}

export function RuleAccountSelect({
  value,
  accounts,
  onChange,
  className,
}: RuleAccountSelectProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const selected = accounts.find((account) => account.ID.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t`Select account`}
          className={cn(
            'h-8 w-full justify-between px-3 font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{selected?.Name ?? t`Select account`}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
        align="start"
      >
        <Command loop>
          <CommandInput placeholder={t`Search accounts…`} />
          <CommandList className="max-h-[44dvh] overscroll-contain">
            <CommandEmpty>
              <Trans>No matching accounts.</Trans>
            </CommandEmpty>
            {accounts.map((account) => {
              const accountId = account.ID.toString();
              return (
                <CommandItem
                  key={account.ID}
                  value={`${account.Name} ${accountId}`}
                  onSelect={() => {
                    onChange(accountId);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('size-4', value === accountId ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{account.Name}</span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
