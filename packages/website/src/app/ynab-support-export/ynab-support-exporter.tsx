'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  FileJson2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <main className="relative isolate overflow-hidden border-t border-[#9e9e9e]/50 bg-[#eef3f2] text-[#13211d]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(19,33,29,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(19,33,29,.045) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div className="pointer-events-none absolute -right-28 top-12 -z-10 h-96 w-96 rounded-full bg-[#8ee0bd]/35 blur-3xl" />

      <section className="container mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-14 lg:pb-24 lg:pt-16">
        <div className="lg:sticky lg:top-8">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1b604b]/20 bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#1b604b] shadow-sm backdrop-blur">
            <ShieldCheck className="size-4" />
            Budgero support export
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[3.75rem]">
            Share the evidence,
            <span className="block text-[#1b604b]">not your identity.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#40534c] sm:text-lg">
            Create a diagnostic copy of your YNAB plan for Budgero support. It keeps the numbers
            needed to reproduce an import problem and replaces the personal details around them.
          </p>

          <div className="mt-9 space-y-5 border-l border-[#1b604b]/20 pl-5">
            {[
              ['1', 'Connect', 'Your token is used only for direct requests from this browser to YNAB.'],
              ['2', 'Anonymize', 'Names, IDs, notes, memos, and import references are replaced locally.'],
              ['3', 'Download', 'You decide whether to inspect or send the generated JSON file.'],
            ].map(([number, title, copy]) => (
              <div key={number} className="relative grid grid-cols-[2rem_1fr] gap-3">
                <span className="-ml-[2.55rem] flex size-8 items-center justify-center rounded-full border border-[#1b604b]/25 bg-[#eef3f2] text-xs font-bold text-[#1b604b]">
                  {number}
                </span>
                <div className="-ml-8">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#53665f]">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex items-start gap-3 rounded-2xl border border-[#d19624]/30 bg-[#fff4d7] p-4 text-sm leading-6 text-[#604a1d]">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#a06a00]" />
            <p>
              Amounts and dates stay unchanged because they are needed for verification. Treat the
              downloaded file as sensitive and review it before sharing.
            </p>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-solid border-[#193a30]/15 bg-white/95 py-0 shadow-[0_28px_80px_-36px_rgba(17,48,39,.45)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-[#193a30]/10 bg-[#153b31] px-5 py-4 text-white sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#a7f3d0] text-[#153b31]">
                <FileJson2 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Diagnostic builder</p>
                <p className="text-xs text-white/65">Runs locally in this tab</p>
              </div>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/80 sm:inline-flex">
              <LockKeyhole className="size-3.5" /> No upload
            </span>
          </div>

          <CardContent className="space-y-7 px-5 py-6 sm:px-7 sm:py-8">
            <form onSubmit={connect} className="space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="ynab-token" className="text-[#203b33]">
                    YNAB personal access token
                  </Label>
                  {plans.length > 0 && (
                    <button
                      type="button"
                      onClick={clearEverything}
                      className="text-xs font-semibold text-[#4e665e] underline-offset-4 hover:text-[#153b31] hover:underline"
                    >
                      Clear connection
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#688078]" />
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
                    className="h-12 w-full rounded-xl border border-[#24463b]/20 bg-[#f7faf9] py-2 pl-10 pr-12 text-base text-[#13211d] shadow-inner outline-none transition placeholder:text-[#81928c] focus:border-[#1b604b]/50 focus:ring-4 focus:ring-[#65c9a1]/15 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((visible) => !visible)}
                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#5c7069] hover:bg-[#e9f0ed] hover:text-[#153b31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b604b]"
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs leading-5 text-[#687b74]">
                  Kept in memory only. It is never saved in this site or included in the download.
                </p>
              </div>

              {plans.length === 0 && (
                <Button
                  type="submit"
                  disabled={busy || !token.trim()}
                  className="h-11 w-full rounded-xl border-[#153b31] bg-[#153b31] text-white hover:bg-[#205545]"
                >
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
              <div className="space-y-5 border-t border-[#193a30]/10 pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1b604b]">
                  <CheckCircle2 className="size-4" /> Connected directly to YNAB
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="ynab-plan" className="text-[#203b33]">
                    Plan to export
                  </Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={busy}>
                    <SelectTrigger
                      id="ynab-plan"
                      className="h-12 w-full rounded-xl border-[#24463b]/20 bg-[#f7faf9] px-3.5 text-base focus:ring-[#65c9a1]/20"
                    >
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent className="border-[#24463b]/20 bg-white text-[#13211d]">
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan && (
                    <p className="text-xs text-[#687b74]">
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
                  className="h-12 w-full rounded-xl border-[#153b31] bg-[#153b31] text-white hover:bg-[#205545]"
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
                className="flex items-start gap-3 rounded-xl border border-[#b94438]/25 bg-[#fff0ed] p-4 text-sm leading-6 text-[#792c24]"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div aria-live="polite">
              {result && (
                <div className="rounded-2xl border border-[#278264]/20 bg-[#eafaf3] p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1b604b] text-white">
                      <Check className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#153b31]">Your diagnostic is ready</p>
                      <p className="mt-1 truncate text-sm text-[#53665f]">{result.filename}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {[
                      ['Size', result.fileSize],
                      ['Months', result.months],
                      ['Transactions', result.transactions],
                      ['Checks flagged', result.mismatches],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-white/70 px-3 py-2.5">
                        <dt className="text-[#6b7c76]">{label}</dt>
                        <dd className="mt-1 font-bold text-[#173f34]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-[#193a30]/10 bg-white/60">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:gap-12">
          <div>
            <div className="mb-4 flex items-center gap-2 font-semibold text-[#153b31]">
              <ShieldCheck className="size-5 text-[#1b604b]" /> Replaced before download
            </div>
            <ul className="grid gap-3 text-sm leading-6 text-[#50635c] sm:grid-cols-2">
              {['Plan, account & payee names', 'Category & group names', 'Memos, notes & import IDs', 'Record and relationship IDs'].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 size-4 shrink-0 text-[#278264]" /> {item}
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2 font-semibold text-[#153b31]">
              <Database className="size-5 text-[#1b604b]" /> Preserved for verification
            </div>
            <ul className="grid gap-3 text-sm leading-6 text-[#50635c] sm:grid-cols-2">
              {['Amounts, dates & account types', 'Monthly Ready to Assign', 'Assigned, activity & available', 'Money Movements & balances'].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 size-4 shrink-0 text-[#278264]" /> {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

