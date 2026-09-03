import type {
  YNABImportProgressUpdate,
  YNABImportStage,
  YNABImportSummary,
  YNABReconciliationReport,
} from '@budgero/core/browser';
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Progress } from '@shared/ui/progress';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';

interface YnabImportStatusProps {
  sourceMode: 'api' | 'zip';
  updates: YNABImportProgressUpdate[];
  error: string | null;
  summary: YNABImportSummary | null;
  verification: YNABReconciliationReport | null;
  currency: string;
  isFinalizing: boolean;
  onBack: () => void;
  onContinue: () => void;
  onAcceptWarnings: () => void;
  onCancelPending: () => void;
}

interface ImportStep {
  stage: YNABImportStage;
  label: string;
}

const baseSteps: ImportStep[] = [
  { stage: 'source-verification', label: 'Verify YNAB source data' },
  { stage: 'preparing', label: 'Create the Budgero budget' },
  { stage: 'categories', label: 'Import categories' },
  { stage: 'accounts', label: 'Import accounts' },
  { stage: 'assignments', label: 'Import assignments' },
  { stage: 'transactions', label: 'Import transactions and splits' },
];

const verificationSteps: ImportStep[] = [
  { stage: 'account-verification', label: 'Verify account balances' },
  { stage: 'category-verification', label: 'Verify category history' },
  { stage: 'rta-verification', label: 'Verify Ready to Assign by month' },
];

type StepStatus = 'pending' | 'running' | 'passed' | 'warning' | 'failed';

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />;
  }
  if (status === 'passed') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />;
  }
  if (status === 'warning') {
    return <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />;
  }
  if (status === 'failed') {
    return <XCircle className="h-4 w-4 text-destructive" aria-hidden />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground/50" aria-hidden />;
}

function formatMilli(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(amount / 1000);
  } catch {
    return `${(amount / 1000).toFixed(3)} ${currency}`;
  }
}

export function YnabImportStatus({
  sourceMode,
  updates,
  error,
  summary,
  verification,
  currency,
  isFinalizing,
  onBack,
  onContinue,
  onAcceptWarnings,
  onCancelPending,
}: YnabImportStatusProps) {
  const steps = [
    ...baseSteps.filter((step) => sourceMode === 'api' || step.stage !== 'source-verification'),
    ...(sourceMode === 'api' ? verificationSteps : []),
    { stage: 'complete' as const, label: 'Save imported budget' },
  ];
  const latestByStage = new Map<YNABImportStage, YNABImportProgressUpdate>();
  for (const update of updates) latestByStage.set(update.stage, update);
  const lastUpdate = updates.at(-1);
  const hasWarning = verification?.status === 'warning';
  const isSaved = latestByStage.get('complete')?.status === 'passed';
  const isPendingReview = Boolean(summary && hasWarning && !isSaved && !error);
  const progress = isSaved ? 100 : (lastUpdate?.progress ?? 0);

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {isPendingReview
            ? 'Review YNAB differences'
            : isSaved
              ? hasWarning
                ? 'YNAB import saved with warnings'
                : 'YNAB import verified'
              : error
                ? 'YNAB import stopped'
                : 'Importing from YNAB'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isPendingReview
            ? 'Source rows and account balances reconcile. Review the reporting differences before deciding whether to keep this budget.'
            : isSaved
              ? hasWarning
                ? 'You accepted the differences below. They are saved in Import History for later review.'
                : 'Budgero finished the import and passed every available integrity check.'
              : error
                ? 'Review the failed check below before trying again.'
                : 'You can follow each import and verification stage here.'}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lastUpdate?.label ?? 'Waiting to start'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <ol className="divide-y rounded-md border bg-muted/15 px-3">
        {steps.map((step) => {
          const update = latestByStage.get(step.stage);
          const failed = Boolean(error && lastUpdate?.stage === step.stage);
          const status: StepStatus = failed
            ? 'failed'
            : update?.status === 'running'
              ? 'running'
              : update?.status === 'warning'
                ? 'warning'
                : update?.status === 'passed'
                  ? 'passed'
                  : 'pending';

          return (
            <li key={step.stage} className="flex items-start gap-2.5 py-2.5">
              <span className="mt-0.5">
                <StepIcon status={status} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium">{step.label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {status}
                  </span>
                </div>
                {update?.detail && (
                  <p className="mt-0.5 break-words text-[11px] text-muted-foreground">
                    {update.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Integrity check failed</AlertTitle>
          <AlertDescription className="break-words text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {verification && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Source</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {verification.source.registerRows.toLocaleString()} rows exact
            </p>
          </div>
          <div className="rounded-md border bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Accounts</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {verification.accounts.matched} of {verification.accounts.checked} exact
            </p>
          </div>
          <div
            className={`rounded-md border p-3 ${
              verification.categories.matched === verification.categories.checked
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20'
                : 'bg-amber-50/70 dark:bg-amber-950/20'
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Categories</p>
            <p className="mt-1 text-sm font-semibold">
              {verification.categories.matched} of {verification.categories.checked} values exact
            </p>
          </div>
          <div
            className={`rounded-md border p-3 ${
              verification.readyToAssign.matched === verification.readyToAssign.checked
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20'
                : 'bg-amber-50/70 dark:bg-amber-950/20'
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Ready to Assign
            </p>
            <p className="mt-1 text-sm font-semibold">
              {verification.readyToAssign.matched} of {verification.readyToAssign.checked} months
              exact
            </p>
          </div>
        </div>
      )}

      {verification && verification.accounts.debtBalanceAdjustments.length > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle>YNAB-managed debt interest preserved</AlertTitle>
          <AlertDescription className="space-y-1 text-xs">
            <p>
              YNAB applies loan interest to balances without exporting a separate transaction.
              Budgero added visible ledger adjustments so these balances remain exact.
            </p>
            {verification.accounts.debtBalanceAdjustments.map((adjustment) => (
              <p key={`${adjustment.accountName}-${adjustment.date}`}>
                {adjustment.accountName}: {formatMilli(adjustment.amount, currency)} on{' '}
                {adjustment.date}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {verification && verification.readyToAssign.mismatches.length > 0 && (
        <div className="space-y-2 rounded-md border border-amber-500/50 bg-amber-50/60 p-3 dark:bg-amber-950/20">
          <div>
            <p className="text-xs font-semibold">Ready to Assign differences</p>
            <p className="text-[11px] text-muted-foreground">
              Budgero did not alter the ledger to force these values to match.
            </p>
          </div>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {verification.readyToAssign.mismatches.map((mismatch) => (
              <div key={mismatch.month} className="rounded border bg-background/80 p-2 text-[11px]">
                <div className="flex flex-wrap justify-between gap-2 font-medium">
                  <span>{mismatch.month}</span>
                  <span className="text-amber-700 dark:text-amber-400">
                    Δ {formatMilli(mismatch.difference, currency)}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  YNAB {formatMilli(mismatch.expectedReadyToAssign, currency)} · Budgero{' '}
                  {formatMilli(mismatch.computedReadyToAssign, currency)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Income {formatMilli(mismatch.breakdown.income, currency)} · Assigned{' '}
                  {formatMilli(mismatch.breakdown.assignments, currency)} · Off-budget{' '}
                  {formatMilli(mismatch.breakdown.offBudgetTransfers, currency)} · Prior cash
                  overspend {formatMilli(mismatch.breakdown.priorCashOverspend, currency)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {verification && verification.categories.mismatches.length > 0 && (
        <div className="space-y-2 rounded-md border border-amber-500/50 bg-amber-50/60 p-3 dark:bg-amber-950/20">
          <p className="text-xs font-semibold">Category-history differences</p>
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {verification.categories.mismatches.slice(0, 20).map((mismatch, index) => (
              <div
                key={`${mismatch.month}-${mismatch.categoryGroup}-${mismatch.category}-${mismatch.field}-${index}`}
                className="grid grid-cols-[1fr_auto] gap-2 rounded border bg-background/80 p-2 text-[11px]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {mismatch.categoryGroup} › {mismatch.category}
                  </p>
                  <p className="text-muted-foreground">
                    {mismatch.month} · {mismatch.field} · YNAB{' '}
                    {formatMilli(mismatch.expectedAmount, currency)} · Budgero{' '}
                    {formatMilli(mismatch.computedAmount, currency)}
                  </p>
                </div>
                <span className="text-amber-700 dark:text-amber-400">
                  Δ {formatMilli(mismatch.difference, currency)}
                </span>
              </div>
            ))}
          </div>
          {verification.categories.checked - verification.categories.matched > 20 && (
            <p className="text-[11px] text-muted-foreground">
              Showing 20 of {verification.categories.checked - verification.categories.matched}{' '}
              differences.
            </p>
          )}
        </div>
      )}

      {error && (
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          <RotateCcw className="h-4 w-4" />
          Back to import
        </Button>
      )}

      {isPendingReview && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" disabled={isFinalizing} onClick={onCancelPending}>
            <Trash2 className="h-4 w-4" />
            Cancel and remove
          </Button>
          <Button type="button" disabled={isFinalizing} onClick={onAcceptWarnings}>
            {isFinalizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            Import anyway
          </Button>
        </div>
      )}

      {summary && !isPendingReview && isSaved && (
        <Button type="button" className="w-full" onClick={onContinue}>
          <CheckCircle2 className="h-4 w-4" />
          Open imported budget
        </Button>
      )}
    </div>
  );
}
