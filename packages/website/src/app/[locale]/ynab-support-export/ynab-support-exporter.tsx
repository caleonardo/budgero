'use client';
import { useTranslations } from 'next-intl';

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
  const copy = useTranslations('updates');
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {copy('u_d77625c771ac')}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {' '}
            {copy('u_3ec010e1c21d')}{' '}
          </p>
        </header>

        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b border-border/70 px-5 py-5 sm:px-6">
            <CardTitle className="text-lg">{copy('u_3d54fce1b49c')}</CardTitle>
            <CardDescription className="leading-6"> {copy('u_49a9a5f2dc4b')} </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-5 py-6 sm:px-6">
            <form onSubmit={connect} className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="ynab-token">{copy('u_80c50b7f13a3')}</Label>
                  {plans.length > 0 && (
                    <button
                      type="button"
                      onClick={clearEverything}
                      className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {' '}
                      {copy('u_558710c2a4c1')}{' '}
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
                    placeholder={copy('u_9547fcece571')}
                    className="h-11 w-full rounded-md border border-input bg-card py-2 pl-10 pr-12 text-base text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((visible) => !visible)}
                    className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showToken ? copy('u_ae132305cb4b') : copy('u_2faef0ba40dc')}
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {' '}
                  {copy('u_e0cab8cb5927')}{' '}
                </p>
              </div>

              {plans.length === 0 && (
                <Button type="submit" disabled={busy || !token.trim()} className="h-10 w-full">
                  {phase === 'connecting' ? (
                    <>
                      <LoaderCircle className="animate-spin" /> {copy('u_2dfdb3e04b01')}{' '}
                    </>
                  ) : (
                    <>
                      <ShieldCheck /> {copy('u_a1a74d259ecc')}{' '}
                    </>
                  )}
                </Button>
              )}
            </form>

            {plans.length > 0 && (
              <div className="space-y-5 border-t border-border/70 pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="size-4" /> {copy('u_badbb58af199')}{' '}
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="ynab-plan">{copy('u_946453084ac2')}</Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={busy}>
                    <SelectTrigger id="ynab-plan" className="h-11 w-full bg-card px-3.5 text-base">
                      <SelectValue placeholder={copy('u_4c6fab7d6595')} />
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
                        ? copy('u_db67227395e1', {
                            p0: selectedPlan.first_month.slice(0, 7),
                            p1: selectedPlan.last_month.slice(0, 7),
                          })
                        : copy('u_012a275fcedd')}
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
                      <LoaderCircle className="animate-spin" /> {copy('u_80748e5ad638')}{' '}
                    </>
                  ) : phase === 'complete' ? (
                    <>
                      <RefreshCcw /> {copy('u_b93b72246a76')}{' '}
                    </>
                  ) : (
                    <>
                      <Download /> {copy('u_5ab55155eefa')}{' '}
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
                      <p className="font-semibold">{copy('u_6ae9126c314a')}</p>
                      <p className="mt-1 truncate text-sm opacity-75">{result.filename}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {[
                      [copy('u_1af851907331'), result.fileSize],
                      [copy('u_09ca7551b3e9'), result.months],
                      [copy('u_3e5136fd4b11'), result.transactions],
                      [copy('u_dac4cad50a87'), result.mismatches],
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

        <div className="mt-6 rounded-xl border border-border/70 bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
          <p className="font-semibold text-foreground">{copy('u_b3a8e0a0d1a0')}</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li> {copy('u_709ee7bb38e3')} </li>
            <li> {copy('u_d8cca33812c9')} </li>
            <li> {copy('u_f2ebc16dce0a')} </li>
            <li> {copy('u_11b2fd33897f')} </li>
            <li>{copy('u_6bf32bfaef7c')}</li>
          </ul>
          <p className="mt-4 flex items-start gap-2 border-t border-border/70 pt-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-1 size-4 shrink-0" /> {copy('u_491bb20a76b8')}{' '}
          </p>
        </div>
      </div>
    </main>
  );
}
