import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Checkbox } from '@shared/ui/checkbox';
import { Label } from '@shared/ui/label';
import { getRuntime } from '@shared/runtime/global';
import { getTodayISO } from '@shared/lib/date-utils';

export function ManualRatePrompt({
  from,
  to,
  budgetId,
  rateDate,
  onConfirm,
  onCancel,
}: {
  from: string;
  to: string;
  /** Enables closest-cached-rate prefill and the resync opt-in. */
  budgetId?: number;
  /** Date the rate is for; defaults to today. */
  rateDate?: string;
  onConfirm: (rate: number, from: string, to: string) => void;
  onCancel: () => void;
}) {
  const [base, setBase] = useState(from);
  const [quote, setQuote] = useState(to);
  // Prefill with the closest cached rate (any age) — best-effort, offline-safe.
  const [suggested] = useState<number | null>(() => {
    if (!budgetId) return null;
    try {
      const services = getRuntime()?.services();
      return (
        services?.currency.getClosestCachedRate(from, to, rateDate ?? getTodayISO(), budgetId) ??
        null
      );
    } catch {
      return null;
    }
  });
  const [rateText, setRateText] = useState<string>(suggested ? String(suggested) : '');
  const [resync, setResync] = useState<boolean>(() => {
    try {
      return getRuntime()?.services()?.userMeta.getResyncRatesOnReconnect() ?? true;
    } catch {
      return true;
    }
  });
  const prefilled = suggested !== null;

  const swap = () => {
    setBase(quote);
    setQuote(base);
    const val = parseFloat(rateText);
    if (!isNaN(val) && val > 0) setRateText((1 / val).toString());
  };

  const submit = () => {
    const val = parseFloat(rateText);
    if (isNaN(val) || val <= 0) return;
    const services = getRuntime()?.services();
    if (services && services.userMeta.getResyncRatesOnReconnect() !== resync) {
      services.userMeta.setResyncRatesOnReconnect(resync);
    }
    onConfirm(val, base, quote);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Enter Exchange Rate</CardTitle>
          <CardDescription>
            {prefilled
              ? 'No fresh rate available. Prefilled with the closest cached rate — adjust if needed.'
              : 'No cached rate found. Provide a temporary rate for offline use.'}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-2 space-y-3">
          <div className="text-sm">
            {base} → {quote}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="e.g. 1.5"
              value={rateText}
              onChange={(e) => setRateText(e.target.value)}
            />
            <Button variant="outline" onClick={swap}>
              Swap
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rate-resync-optin"
              checked={resync}
              onCheckedChange={(v) => setResync(v === true)}
            />
            <Label htmlFor="rate-resync-optin" className="text-sm font-normal cursor-pointer">
              Update to the official rate when back online
            </Label>
          </div>
        </div>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
