import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  useTransferRateDetails,
  useUpdateTransferRate,
} from '@entities/transaction/api/useTransactions';
import { formatNativeAmount } from '@entities/currency/lib/currency-utils';
import {
  formatExchangeRate,
  isUnusualExchangeRateChange,
  validateExchangeRateConversions,
} from '@entities/currency/lib/exchange-rate-format';
import { Button } from '@shared/ui/button';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Spinner } from '@shared/ui/spinner';

interface TransferRateDialogProps {
  transferId: string;
  compact?: boolean;
}

export function TransferRateDialog({ transferId, compact = false }: TransferRateDialogProps) {
  const { t } = useLingui();

  const [open, setOpen] = React.useState(false);
  const [rateText, setRateText] = React.useState('');
  const [rateDirty, setRateDirty] = React.useState(false);
  const initializedTransfer = React.useRef<string | null>(null);
  const { data: details, isLoading } = useTransferRateDetails(open ? transferId : null);
  const updateRate = useUpdateTransferRate();

  React.useEffect(() => {
    if (!open) {
      initializedTransfer.current = null;
      setRateText('');
      setRateDirty(false);
    } else if (details && (initializedTransfer.current !== details.transferId || !rateDirty)) {
      initializedTransfer.current = details.transferId;
      setRateText(String(details.rate));
    }
  }, [details, open, rateDirty]);

  const parsedRate = Number.parseFloat(rateText.replace(',', '.'));
  const rateSafetyError =
    details && Number.isFinite(parsedRate) && parsedRate > 0
      ? validateExchangeRateConversions(parsedRate, [
          {
            amount: details.source.amount,
            fromCurrency: details.source.currency,
            toCurrency: details.destination.currency,
          },
        ])
      : null;
  const validRate = Number.isFinite(parsedRate) && parsedRate > 0 && !rateSafetyError;
  const unusualRate =
    Boolean(details) && validRate && isUnusualExchangeRateChange(details?.rate ?? 0, parsedRate);
  const isCrossCurrency =
    Boolean(details) && details?.source.currency !== details?.destination.currency;

  const handleConfirm = async () => {
    if (!details || !validRate) return;
    await updateRate.mutateAsync({ transferId, rate: parsedRate });
    toast.success(t`Transfer rate updated`, {
      description: `1 ${details.source.currency} = ${formatExchangeRate(parsedRate)} ${details.destination.currency}`,
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={compact ? 'h-7 px-2 text-xs shrink-0' : 'h-8 px-2.5 text-xs'}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <Trans>
          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
          Transfer rate
        </Trans>
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t`Transfer rate`}
        description={t`Inspect or edit the direct rate between the two accounts. Budget rates are shown separately below.`}
        confirmText={t`Save rate`}
        loadingText="Saving..."
        isLoading={updateRate.isPending}
        confirmDisabled={!details || !isCrossCurrency || !validRate || isLoading}
        onConfirm={handleConfirm}
      >
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : details ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border bg-muted/20 p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  <Trans>Sent from {details.source.accountName}</Trans>
                </p>
                <p className="font-mono font-medium">
                  {formatNativeAmount(details.source.amount, details.source.currency)}{' '}
                  {details.source.currency}
                </p>
              </div>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  <Trans>Received in {details.destination.accountName}</Trans>
                </p>
                <p className="font-mono font-medium">
                  {formatNativeAmount(details.destination.amount, details.destination.currency)}{' '}
                  {details.destination.currency}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`transfer-rate-${transferId}`}>
                <Trans>1 {details.source.currency} equals</Trans>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`transfer-rate-${transferId}`}
                  type="text"
                  inputMode="decimal"
                  value={rateText}
                  onChange={(event) => {
                    setRateDirty(true);
                    setRateText(event.target.value);
                  }}
                  className="font-mono"
                  aria-invalid={!validRate}
                  disabled={!isCrossCurrency}
                />
                <span className="text-sm font-medium">{details.destination.currency}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isCrossCurrency
                  ? t`The sent amount stays fixed. Saving recalculates the received amount and both budget valuations atomically.`
                  : t`Both accounts use the same currency, so this transfer has no conversion rate.`}
              </p>
              {rateSafetyError && <p className="text-xs text-destructive">{rateSafetyError}</p>}
              {unusualRate && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <Trans>
                    This is over 1,000× different from the current rate. Check the decimal point
                    before confirming.
                  </Trans>
                </p>
              )}
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                <Trans>Budget valuation</Trans>
              </p>
              <p>
                1 {details.source.currency} ={' '}
                {details.source.budgetRate == null
                  ? '1'
                  : formatExchangeRate(details.source.budgetRate)}{' '}
                {details.budgetCurrency}
              </p>
              <p>
                1 {details.destination.currency} ={' '}
                {details.destination.budgetRate == null
                  ? '1'
                  : formatExchangeRate(details.destination.budgetRate)}{' '}
                {details.budgetCurrency}
              </p>
              {details.transferRateOverride && (
                <p className="pt-1 text-primary">
                  <Trans>The direct transfer rate is manually overridden.</Trans>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Trans>
              This transfer does not have exactly two linked legs, so its direct rate cannot be
              edited.
            </Trans>
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
