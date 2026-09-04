'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createYnabSupportBundle,
  YnabSupportClient,
  type YnabPlanSummary,
} from '@/lib/ynab-support';

type Phase = 'idle' | 'connecting' | 'connected' | 'generating' | 'complete';

interface ExportResult {
  filename: string;
  fileSize: string;
  months: number;
  transactions: number;
  mismatches: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJson(contents: string, filename: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function YnabSupportExporter() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [plans, setPlans] = useState<YnabPlanSummary[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExportResult | null>(null);

  const busy = phase === 'connecting' || phase === 'generating';
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId]
  );

  const resetConnection = () => {
    setPlans([]);
    setSelectedPlanId('');
    setPhase('idle');
    setResult(null);
    setError('');
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    if (plans.length > 0 || result) resetConnection();
  };

  const connect = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!token.trim()) {
      setError('Enter a YNAB personal access token to continue.');
      return;
    }

    setPhase('connecting');
    try {
      const availablePlans = await new YnabSupportClient(token).listPlans();
      if (availablePlans.length === 0) throw new Error('No YNAB plans were found for this token.');
      setPlans(availablePlans);
      setSelectedPlanId(availablePlans[0].id);
      setPhase('connected');
    } catch (caught) {
      setPhase('idle');
      setError(caught instanceof Error ? caught.message : 'Could not connect to YNAB.');
    }
  };

  const generate = async () => {
    if (!selectedPlanId) return;
    setError('');
    setResult(null);
    setPhase('generating');

    try {
      const snapshot = await new YnabSupportClient(token).getPlan(selectedPlanId);
      const bundle = createYnabSupportBundle(snapshot);
      const contents = JSON.stringify(bundle, null, 2);
      const day = new Date().toISOString().slice(0, 10);
      const filename = `budgero-ynab-diagnostic-${day}.json`;
      downloadJson(contents, filename);

      setResult({
        filename,
        fileSize: formatBytes(new Blob([contents]).size),
        months: bundle._support.verification.counts.months,
        transactions: bundle._support.verification.counts.transactions,
        mismatches: bundle._support.verification.moneyMovementAssignments.mismatches.length,
      });
      setPhase('complete');
    } catch (caught) {
      setPhase('connected');
      setError(caught instanceof Error ? caught.message : 'Could not create the diagnostic file.');
    }
  };

  const clearEverything = () => {
    setToken('');
    setShowToken(false);
    resetConnection();
  };

  return (
    <main className="min-h-[70vh] border-t border-border/70 bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">YNAB support export</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Enter your YNAB personal access token to download an anonymized JSON copy of your plan
            for Budgero support.
          </p>
        </header>

        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
            <CardTitle className="text-lg">Generate diagnostic file</CardTitle>
            <CardDescription className="leading-6">
              The token is used only for direct requests from your browser to YNAB. Budgero does not
              receive or store it.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-5 py-6 sm:px-6">
            <form onSubmit={connect} className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="ynab-token">YNAB personal access token</Label>
                  {plans.length > 0 && (
                    <button
                      type="button"
                      onClick={clearEverything}
                      className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Clear connection
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="ynab-token"
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(event) => handleTokenChange(event.target.value)}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-1p-ignore
                    disabled={busy}
                    placeholder="Paste your token"
                    className="h-11 w-full rounded-md border border-input bg-card py-2 pl-10 pr-12 text-base text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((visible) => !visible)}
                    className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Kept in memory only and never included in the downloaded file.
                </p>
              </div>

              {plans.length === 0 && (
                <Button type="submit" disabled={busy || !token.trim()} className="h-10 w-full">
                  {phase === 'connecting' ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Connecting securely…
                    </>
                  ) : (
                    <>
                      <ShieldCheck /> Connect to YNAB
                    </>
                  )}
                </Button>
              )}
            </form>

            {plans.length > 0 && (
              <div className="space-y-5 border-t border-border/70 pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="size-4" /> Connected directly to YNAB
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="ynab-plan">Plan to export</Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={busy}>
                    <SelectTrigger id="ynab-plan" className="h-11 w-full bg-card px-3.5 text-base">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan && (
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.first_month && selectedPlan.last_month
                        ? `${selectedPlan.first_month.slice(0, 7)} to ${selectedPlan.last_month.slice(0, 7)}`
                        : 'The complete plan history will be included.'}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={generate}
                  disabled={busy || !selectedPlanId}
                  className="h-10 w-full"
                >
                  {phase === 'generating' ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Reading &amp; anonymizing…
                    </>
                  ) : phase === 'complete' ? (
                    <>
                      <RefreshCcw /> Generate again
                    </>
                  ) : (
                    <>
                      <Download /> Generate JSON file
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div aria-live="polite">
              {result && (
                <div className="rounded-lg border border-emerald-700/20 bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                      <Check className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">Diagnostic downloaded</p>
                      <p className="mt-1 truncate text-sm opacity-75">{result.filename}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {[
                      ['Size', result.fileSize],
                      ['Months', result.months],
                      ['Transactions', result.transactions],
                      ['Checks flagged', result.mismatches],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-md bg-white/70 px-3 py-2 dark:bg-black/20"
                      >
                        <dt className="opacity-65">{label}</dt>
                        <dd className="mt-1 font-bold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3 rounded-xl border border-border/70 bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Anonymized:</strong> plan, account, category,
            category group and payee names; notes, memos, import IDs and record IDs.
          </p>
          <p>
            <strong className="text-foreground">Preserved:</strong> amounts, dates, account types,
            monthly Ready to Assign, category assigned/activity/available values, balances and Money
            Movements.
          </p>
          <p className="flex items-start gap-2 border-t border-border/70 pt-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-1 size-4 shrink-0" />
            Amounts and dates remain sensitive. Review the JSON file before sending it to support.
          </p>
        </div>
      </div>
    </main>
  );
}
