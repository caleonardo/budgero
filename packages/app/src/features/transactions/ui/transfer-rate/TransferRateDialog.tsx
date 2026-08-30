import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  useTransferRateDetails,
  useUpdateTransferRate,
} from '@entities/transaction/api/useTransactions';
import { formatNativeAmount } from '@entities/currency/lib/currency-utils';
import { formatExchangeRate } from '@entities/currency/lib/exchange-rate-format';
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
  const [open, setOpen] = React.useState(false);
  const [rateText, setRateText] = React.useState('');
  const initializedTransfer = React.useRef<string | null>(null);
  const { data: details, isLoading } = useTransferRateDetails(open ? transferId : null);
  const updateRate = useUpdateTransferRate();

  React.useEffect(() => {
    if (!open) {
      initializedTransfer.current = null;
      setRateText('');
    } else if (details && initializedTransfer.current !== details.transferId) {
      initializedTransfer.current = details.transferId;
      setRateText(String(details.rate));
    }
  }, [details, open]);

  const parsedRate = Number.parseFloat(rateText.replace(',', '.'));
  const validRate = Number.isFinite(parsedRate) && parsedRate > 0;
  const isCrossCurrency =
    Boolean(details) && details?.source.currency !== details?.destination.currency;

  const handleConfirm = async () => {
    if (!details || !validRate) return;
    await updateRate.mutateAsync({ transferId, rate: parsedRate });
    toast.success('Transfer rate updated', {
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
        <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
        Transfer rate
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Transfer rate"
        description="Inspect or edit the direct rate between the two accounts. Budget rates are shown separately below."
        confirmText="Save rate"
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
                  Sent from {details.source.accountName}
                </p>
                <p className="font-mono font-medium">
                  {formatNativeAmount(details.source.amount, details.source.currency)}{' '}
                  {details.source.currency}
                </p>
              </div>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Received in {details.destination.accountName}
                </p>
                <p className="font-mono font-medium">
                  {formatNativeAmount(details.destination.amount, details.destination.currency)}{' '}
                  {details.destination.currency}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`transfer-rate-${transferId}`}>
                1 {details.source.currency} equals
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`transfer-rate-${transferId}`}
                  type="text"
                  inputMode="decimal"
                  value={rateText}
                  onChange={(event) => setRateText(event.target.value)}
                  className="font-mono"
                  aria-invalid={!validRate}
                  disabled={!isCrossCurrency}
                />
                <span className="text-sm font-medium">{details.destination.currency}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isCrossCurrency
                  ? 'The sent amount stays fixed. Saving recalculates the received amount and both budget valuations atomically.'
                  : 'Both accounts use the same currency, so this transfer has no conversion rate.'}
              </p>
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Budget valuation</p>
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
                  The direct transfer rate is manually overridden.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This transfer does not have exactly two linked legs, so its direct rate cannot be
            edited.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
