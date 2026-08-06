import { Wallet, type LucideIcon } from 'lucide-react';
import { isCryptoCurrency } from '@budgero/core/browser';
import { cn } from '@shared/lib/utils';
import { CryptoIcon } from '@entities/currency/ui/CryptoIcon';
import { getAccountTypeDefinition } from '@entities/account/model/accountTypes';

/**
 * Account identity icon: crypto-denominated accounts show their coin,
 * everything else shows the account-type icon in its type color. One
 * component so every surface (sidebar, lists, pickers, headers) agrees.
 *
 * `variant="chip"` wraps the type icon in a soft tinted circle so fiat
 * accounts carry the same visual weight as the colored coin icons.
 */
export function AccountGlyph({
  type,
  currency,
  className,
  variant = 'plain',
  fallback: Fallback = Wallet,
}: {
  type: string | undefined;
  currency: string | undefined;
  className?: string;
  variant?: 'plain' | 'chip';
  fallback?: LucideIcon;
}) {
  if (currency && isCryptoCurrency(currency)) {
    return <CryptoIcon code={currency} className={className} />;
  }
  const def = type ? getAccountTypeDefinition(type) : null;
  const Icon = def?.icon || Fallback;
  const color = def?.color;

  if (variant === 'chip') {
    return (
      <span
        aria-hidden
        className={cn('inline-flex items-center justify-center rounded-full shrink-0', className)}
        style={{
          color,
          backgroundColor: color ? `color-mix(in srgb, ${color} 18%, transparent)` : undefined,
        }}
      >
        <Icon className="h-[68%] w-[68%]" />
      </span>
    );
  }

  return <Icon className={className} style={color ? { color } : undefined} />;
}
