import { Wallet, type LucideIcon } from 'lucide-react';
import { isCryptoCurrency } from '@budgero/core/browser';
import { CryptoIcon } from '@entities/currency/ui/CryptoIcon';
import { getAccountTypeDefinition } from '@entities/account/model/accountTypes';

/**
 * Account identity icon: crypto-denominated accounts show their coin,
 * everything else shows the account-type icon. One component so every
 * surface (sidebar, lists, pickers, headers) agrees.
 */
export function AccountGlyph({
  type,
  currency,
  className,
  fallback: Fallback = Wallet,
}: {
  type: string | undefined;
  currency: string | undefined;
  className?: string;
  fallback?: LucideIcon;
}) {
  if (currency && isCryptoCurrency(currency)) {
    return <CryptoIcon code={currency} className={className} />;
  }
  const Icon = (type ? getAccountTypeDefinition(type)?.icon : undefined) || Fallback;
  return <Icon className={className} />;
}
