import type {
  YNABImportProgressUpdate,
  YNABImportStage,
  YNABImportSummary,
} from '@budgero/core/browser';
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Progress } from '@shared/ui/progress';
import { CheckCircle2, Circle, Loader2, RotateCcw, XCircle } from 'lucide-react';

interface YnabImportStatusProps {
  sourceMode: 'api' | 'zip';
  updates: YNABImportProgressUpdate[];
  error: string | null;
  summary: YNABImportSummary | null;
  onBack: () => void;
  onContinue: () => void;
}

interface ImportStep {
  stage: YNABImportStage;
  label: string;
}

const baseSteps: ImportStep[] = [
  { stage: 'preparing', label: 'Create the Budgero budget' },
  { stage: 'categories', label: 'Import categories' },
  { stage: 'accounts', label: 'Import accounts' },
  { stage: 'assignments', label: 'Import assignments' },
  { stage: 'transactions', label: 'Import transactions and splits' },
];

const verificationSteps: ImportStep[] = [
  { stage: 'account-verification', label: 'Verify account balances' },
  { stage: 'rta-verification', label: 'Verify Ready to Assign by month' },
];

function StepIcon({ status }: { status: 'pending' | 'running' | 'passed' | 'failed' }) {
  if (status === 'running') {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />;
  }
  if (status === 'passed') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />;
  }
  if (status === 'failed') {
    return <XCircle className="h-4 w-4 text-destructive" aria-hidden />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground/50" aria-hidden />;
}

export function YnabImportStatus({
  sourceMode,
  updates,
  error,
  summary,
  onBack,
  onContinue,
}: YnabImportStatusProps) {
  const steps = [
    ...baseSteps,
    ...(sourceMode === 'api' ? verificationSteps : []),
    { stage: 'complete' as const, label: 'Save imported budget' },
  ];
  const latestByStage = new Map<YNABImportStage, YNABImportProgressUpdate>();
  for (const update of updates) latestByStage.set(update.stage, update);
  const lastUpdate = updates.at(-1);
  const progress = summary ? 100 : (lastUpdate?.progress ?? 0);

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {summary ? 'YNAB import verified' : error ? 'YNAB import stopped' : 'Importing from YNAB'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {summary
            ? 'Budgero finished the import and passed every available integrity check.'
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
          const status = failed
            ? 'failed'
            : update?.status === 'running'
              ? 'running'
              : update?.status === 'passed' || summary
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
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription className="break-words text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {summary && sourceMode === 'api' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Accounts</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {summary.accountBalancesVerified ?? 0} verified
            </p>
          </div>
          <div className="rounded-md border bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Ready to Assign
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {summary.readyToAssignMonthsVerified ?? 0} months verified
            </p>
          </div>
        </div>
      )}

      {error && (
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          <RotateCcw className="h-4 w-4" />
          Back to import
        </Button>
      )}
      {summary && (
        <Button type="button" className="w-full" onClick={onContinue}>
          <CheckCircle2 className="h-4 w-4" />
          Open imported budget
        </Button>
      )}
    </div>
  );
}
