import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useExecuteRule,
  useUndoRuleRun,
} from '@entities/rule/api/useRules';
import { useUiStore } from '@shared/store/useUiStore';
import { Button } from '@shared/ui/button';
import { toast } from 'sonner';
import { RuleEditorDialog, type RuleFormValues } from '@features/rules/ui/rule-editor';
import { RuleHistoryDrawer } from '@features/rules/ui/RuleHistoryDrawer';
import { PayeeCategoryMemoryCard } from '@features/rules/ui/PayeeCategoryMemoryCard';
import { RuleRunOverlay, type RuleRunPhase } from '@features/rules/ui/RuleRunOverlay';
import type {
  TransactionRule,
  RuleTrigger,
  RuleExecutionResult,
  RuleRunUndoResult,
} from '@budgero/core/browser';
import { useAccounts } from '@entities/account/api/useAccounts';
import { useCategories } from '@entities/category/api/useCategories';
import { Plus } from 'lucide-react';
import { getErrorMessage, toastError } from '@shared/lib/errors';
import { RuleRow } from './automation-rules/RuleRow';

export default function AutomationRulesPage() {
  const { t } = useLingui();

  const selectedBudget = useUiStore((state) => state.selectedBudget);
  const budgetId = selectedBudget?.ID ?? 0;

  const { data: rules = [], isLoading } = useRules(budgetId);
  const { data: categories = [] } = useCategories(budgetId);
  const { data: accounts = [] } = useAccounts(budgetId);
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();
  const executeRule = useExecuteRule();
  const undoRuleRun = useUndoRuleRun();
  const queryClient = useQueryClient();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingRule, setEditingRule] = useState<TransactionRule | null>(null);
  const [historyRule, setHistoryRule] = useState<TransactionRule | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [executingRuleId, setExecutingRuleId] = useState<number | null>(null);
  const [executingTrigger, setExecutingTrigger] = useState<RuleTrigger>('manual');
  const [runOverlay, setRunOverlay] = useState<{
    open: boolean;
    mode: 'execute' | 'undo';
    phase: RuleRunPhase;
    trigger: RuleTrigger | 'undo';
    executionResult: RuleExecutionResult | null;
    undoResult: RuleRunUndoResult | null;
    error: string | null;
  }>({
    open: false,
    mode: 'execute',
    phase: 'idle',
    trigger: 'manual',
    executionResult: null,
    undoResult: null,
    error: null,
  });
  const [undoingRunId, setUndoingRunId] = useState<number | null>(null);

  const refreshAllQueries = async () => {
    await queryClient.cancelQueries();
    await queryClient.invalidateQueries({ predicate: () => true });
    await queryClient.refetchQueries({ predicate: () => true, type: 'active' });
  };

  const waitForNextFrame = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

  const openCreateDialog = () => {
    setEditorMode('create');
    setEditingRule(null);
    setEditorOpen(true);
  };

  const openEditDialog = (rule: TransactionRule) => {
    setEditorMode('edit');
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const handleSaveRule = async (values: RuleFormValues) => {
    if (!budgetId) return;

    try {
      if (editorMode === 'create') {
        await createRule.mutateAsync({
          budgetId,
          name: values.name,
          description: values.description,
          conditions: values.conditions,
          actions: values.actions,
          mode: values.mode,
          enabled: values.enabled,
          runOrder: values.runOrder,
        });
        toast.success(t`Rule created`, { description: t`Your automation rule is ready to run.` });
      } else if (editingRule) {
        await updateRule.mutateAsync({
          id: editingRule.id,
          budgetId,
          patch: {
            name: values.name,
            description: values.description,
            conditions: values.conditions,
            actions: values.actions,
            mode: values.mode,
            enabled: values.enabled,
            runOrder: values.runOrder,
          },
        });
        toast.success(t`Rule updated`, { description: t`Changes saved successfully.` });
      }

      setEditorOpen(false);
    } catch (error) {
      toastError('Something went wrong', error, 'Unable to save rule.');
    }
  };

  const handleToggleEnabled = async (rule: TransactionRule, nextEnabled: boolean) => {
    if (!budgetId) return;
    try {
      await updateRule.mutateAsync({
        id: rule.id,
        budgetId,
        patch: { enabled: nextEnabled },
      });
      toast.success(nextEnabled ? t`Rule enabled` : t`Rule paused`, {
        description: nextEnabled
          ? t`New matching transactions will run through this rule.`
          : t`Automation paused until you re-enable it.`,
      });
    } catch (error) {
      toastError('Unable to update rule', error, 'Toggle failed. Try again.');
    }
  };

  const handleExecute = async (rule: TransactionRule, trigger: RuleTrigger) => {
    if (!budgetId) return;
    setExecutingRuleId(rule.id);
    setExecutingTrigger(trigger);
    setRunOverlay({
      open: true,
      mode: 'execute',
      phase: 'running',
      trigger,
      executionResult: null,
      undoResult: null,
      error: null,
    });
    await waitForNextFrame();
    try {
      const result = await executeRule.mutateAsync({
        ruleId: rule.id,
        budgetId,
        options: { trigger },
      });
      setRunOverlay((prev) => ({ ...prev, phase: 'refreshing', executionResult: result }));
      try {
        await refreshAllQueries();
      } catch (refreshError) {
        console.warn('[AutomationRules] Failed to refresh queries after rule run', refreshError);
      }
      setRunOverlay((prev) => ({ ...prev, phase: 'done' }));
    } catch (error) {
      const message = getErrorMessage(error, t`Unable to run the rule.`);
      setRunOverlay((prev) => ({ ...prev, phase: 'error', error: message }));
      toast.error(t`Execution failed`, {
        description: message,
      });
    } finally {
      setExecutingRuleId(null);
    }
  };

  const handleDelete = async (rule: TransactionRule) => {
    if (!budgetId) return;
    try {
      await deleteRule.mutateAsync({ id: rule.id, budgetId });
      toast.success(t`Rule deleted`, { description: t`Automation removed successfully.` });
    } catch (error) {
      toastError('Unable to delete rule', error, 'Please try again.');
    }
  };

  const openHistoryForRule = (rule: TransactionRule) => {
    setHistoryRule(rule);
    setHistoryOpen(true);
  };

  const isBusy = createRule.isPending || updateRule.isPending;
  const executingCurrent = executeRule.isPending ? executingRuleId : null;

  const orderedRules = useMemo(() => {
    return [...rules].sort((a, b) => a.runOrder - b.runOrder || a.id - b.id);
  }, [rules]);

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.ID, category.Name])),
    [categories]
  );
  const accountNames = useMemo(
    () => new Map(accounts.map((account) => [account.ID, account.Name])),
    [accounts]
  );

  const closeRunOverlay = () =>
    setRunOverlay({
      open: false,
      mode: 'execute',
      phase: 'idle',
      trigger: 'manual',
      executionResult: null,
      undoResult: null,
      error: null,
    });

  const handleUndoRun = async ({
    runId,
    ruleId,
    budgetId,
  }: {
    runId: number;
    ruleId: number;
    budgetId: number;
  }) => {
    if (!budgetId) return;
    setUndoingRunId(runId);
    setRunOverlay({
      open: true,
      mode: 'undo',
      phase: 'running',
      trigger: 'undo',
      executionResult: null,
      undoResult: null,
      error: null,
    });
    await waitForNextFrame();
    try {
      const result = await undoRuleRun.mutateAsync({ runId, ruleId, budgetId });
      setRunOverlay((prev) => ({ ...prev, phase: 'refreshing', undoResult: result }));
      try {
        await refreshAllQueries();
      } catch (refreshError) {
        console.warn('[AutomationRules] Failed to refresh queries after undoing run', refreshError);
      }
      setRunOverlay((prev) => ({ ...prev, phase: 'done', undoResult: result }));
      toast.success(t`Run undone`, {
        description: t`Transactions were restored to their previous values.`,
      });
    } catch (error) {
      const message = getErrorMessage(error, t`Unable to undo run.`);
      setRunOverlay((prev) => ({ ...prev, phase: 'error', error: message }));
      toast.error(t`Unable to undo run`, {
        description: message,
      });
    } finally {
      setUndoingRunId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            <Trans>Automation rules</Trans>
          </h1>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Create powerful rules that categorise, clean up, and reroute transactions the moment
              they appear.
            </Trans>
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="w-full shrink-0 sm:w-auto">
          <Trans>
            <Plus className="mr-1 h-4 w-4" />
            New rule
          </Trans>
        </Button>
      </div>

      <PayeeCategoryMemoryCard />

      {!budgetId ? (
        <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
          <Trans>Select or create a budget to configure automation rules.</Trans>
        </p>
      ) : isLoading ? (
        <div className="divide-y overflow-hidden rounded-lg border">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-1.5 px-3 py-2.5">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-64 max-w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : orderedRules.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <Trans>
              No rules yet. Create your first automation to categorise subscriptions, split income,
              or tidy up imported descriptions.
            </Trans>
          </p>
          <Button onClick={openCreateDialog} variant="outline" size="sm" className="shrink-0">
            <Trans>
              <Plus className="mr-1 h-4 w-4" />
              Design a rule
            </Trans>
          </Button>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-lg border bg-card">
          {orderedRules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              categoryNames={categoryNames}
              accountNames={accountNames}
              runningTrigger={executingCurrent === rule.id ? executingTrigger : null}
              runDisabled={!!executingCurrent && executingCurrent !== rule.id}
              isTogglePending={updateRule.isPending}
              isDeletePending={deleteRule.isPending}
              onToggleEnabled={(checked) => handleToggleEnabled(rule, checked)}
              onRun={(trigger) => handleExecute(rule, trigger)}
              onHistory={() => openHistoryForRule(rule)}
              onEdit={() => openEditDialog(rule)}
              onDelete={() => handleDelete(rule)}
            />
          ))}
        </div>
      )}

      <RuleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        budgetId={budgetId}
        mode={editorMode}
        initialRule={editingRule}
        isSubmitting={isBusy}
        onSubmit={handleSaveRule}
      />

      <RuleHistoryDrawer
        rule={historyRule}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onUndoRun={handleUndoRun}
        undoingRunId={undoingRunId}
      />

      <RuleRunOverlay
        open={runOverlay.open}
        mode={runOverlay.mode}
        phase={runOverlay.phase}
        trigger={runOverlay.trigger}
        executionResult={runOverlay.executionResult}
        undoResult={runOverlay.undoResult}
        error={runOverlay.error}
        onClose={closeRunOverlay}
      />
    </div>
  );
}
