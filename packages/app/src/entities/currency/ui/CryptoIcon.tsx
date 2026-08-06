import { useState } from 'react';
import { Bitcoin } from 'lucide-react';
import { cn } from '@shared/lib/utils';

/**
 * Per-coin icon served from our own origin (`public/crypto-icons`, no CDN —
 * same policy as country flags). Falls back to a generic coin glyph for
 * codes without a bundled icon.
 */
export function CryptoIcon({ code, className }: { code: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <Bitcoin className={cn('text-muted-foreground', className)} />;
  }
  return (
    <img
      src={`/crypto-icons/${code.toLowerCase()}.svg`}
      alt=""
      aria-hidden
      className={cn('rounded-full', className)}
      onError={() => setFailed(true)}
    />
  );
}
