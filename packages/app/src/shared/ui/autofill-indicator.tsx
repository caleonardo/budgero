import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';
import { cn } from '@shared/lib/utils';

/**
 * `rule` — an explicit autofill rule filled this field (solid primary dot).
 * `payee-memory` — the value came from the payee's last transaction, a much
 * softer signal, so it reads as a hollow amber ring rather than a solid dot.
 */
export type AutofillIndicatorVariant = 'rule' | 'payee-memory';

interface AutofillIndicatorProps {
  show: boolean;
  className?: string;
  variant?: AutofillIndicatorVariant;
  /** Overrides the default tooltip/aria text (e.g. to name the payee). */
  label?: string;
}

const VARIANT_STYLES: Record<AutofillIndicatorVariant, string> = {
  rule: 'bg-primary/80',
  'payee-memory': 'border-[1.5px] border-amber-500 bg-amber-500/20',
};

const VARIANT_LABELS: Record<AutofillIndicatorVariant, string> = {
  rule: 'Auto-filled by rule',
  'payee-memory': "From this payee's last transaction",
};

export function AutofillIndicator({
  show,
  className,
  variant = 'rule',
  label,
}: AutofillIndicatorProps) {
  if (!show) return null;

  const text = label ?? VARIANT_LABELS[variant];

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex h-2 w-2 rounded-full animate-in fade-in-0 zoom-in-50 duration-200',
              VARIANT_STYLES[variant],
              className
            )}
            aria-label={text}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
