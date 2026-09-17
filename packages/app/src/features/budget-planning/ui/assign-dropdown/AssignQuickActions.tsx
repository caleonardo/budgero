import { plural } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { DropdownMenuItem, DropdownMenuSeparator } from '@shared/ui/dropdown-menu';
import { Target, AlertTriangle, TrendingDown, RotateCcw, RefreshCw } from 'lucide-react';
import type { GetMonthlyBudgetRow } from '@budgero/core/browser';
import { asMilli, formatMilli, type MilliUnits } from '@shared/lib/currency/milli';
import {
  getResetAvailableCounts,
  getResetAssignedCounts,
  type UnderfundedGoal,
  type OverspentCategory,
  type OverfundedCategory,
} from './assign-dropdown.utils';

interface AssignQuickActionsProps {
  /** Ready-to-assign amount in integer milliunits. */
  readyToAssign: number;
  isAssigning: boolean;
  fundingReady: boolean;
  underfundedGoals: UnderfundedGoal[];
  overspentCategories: OverspentCategory[];
  overfundedCategories: OverfundedCategory[];
  totalUnderfunded: MilliUnits;
  totalOverspent: MilliUnits;
  totalSafeReduction: MilliUnits;
  budgetData: GetMonthlyBudgetRow[];
  globalLocalizer: Intl.NumberFormat;
  allowOverAssignment?: boolean;
  onAutoAssignUnderfunded: () => void;
  onCoverOverspending: () => void;
  onReduceOverfunding: () => void;
  onResetAvailable: () => void;
  onResetAssigned: () => void;
}

export function AssignQuickActions({
  readyToAssign,
  isAssigning,
  fundingReady,
  underfundedGoals,
  overspentCategories,
  overfundedCategories,
  totalUnderfunded,
  totalOverspent,
  totalSafeReduction,
  budgetData,
  globalLocalizer,
  allowOverAssignment = false,
  onAutoAssignUnderfunded,
  onCoverOverspending,
  onReduceOverfunding,
  onResetAvailable,
  onResetAssigned,
}: AssignQuickActionsProps) {
  const { t } = useLingui();

  const { nonZeroCount, overspentCount, overfundedCount } = getResetAvailableCounts(budgetData);
  const { count: resetAssignedCount, totalAbs: resetAssignedTotal } =
    getResetAssignedCounts(budgetData);

  return (
    <>
      <DropdownMenuItem
        onClick={onAutoAssignUnderfunded}
        disabled={
          !fundingReady ||
          underfundedGoals.length === 0 ||
          (readyToAssign <= 0 && !allowOverAssignment) ||
          isAssigning
        }
        className="flex items-center gap-2"
      >
        <Target className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">
            <Trans>Fund Goals</Trans>
          </div>
          <div className="text-xs text-muted-foreground">
            {underfundedGoals.length === 0
              ? t`All goals funded`
              : `${underfundedGoals.length} goal${underfundedGoals.length === 1 ? '' : 's'} need ${formatMilli(globalLocalizer, asMilli(allowOverAssignment ? totalUnderfunded : Math.min(totalUnderfunded, Math.max(0, readyToAssign))))}`}
          </div>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={onCoverOverspending}
        disabled={
          overspentCategories.length === 0 ||
          (readyToAssign <= 0 && !allowOverAssignment) ||
          isAssigning
        }
        className="flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">
            <Trans>Cover Overspending</Trans>
          </div>
          <div className="text-xs text-muted-foreground">
            {overspentCategories.length === 0
              ? t`No overspending`
              : plural(overspentCategories.length, {
                  one: `# category needs ${formatMilli(globalLocalizer, asMilli(Math.min(totalOverspent, readyToAssign)))}`,
                  other: `# categories need ${formatMilli(globalLocalizer, asMilli(Math.min(totalOverspent, readyToAssign)))}`,
                })}
          </div>
        </div>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={onReduceOverfunding}
        disabled={overfundedCategories.length === 0 || isAssigning}
        className="flex items-center gap-2"
      >
        <TrendingDown className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">
            <Trans>Reduce Overfunding</Trans>
          </div>
          <div className="text-xs text-muted-foreground">
            {overfundedCategories.length === 0
              ? t`No overfunding`
              : plural(overfundedCategories.length, {
                  one: `Free up ${formatMilli(globalLocalizer, totalSafeReduction)} from # category`,
                  other: `Free up ${formatMilli(globalLocalizer, totalSafeReduction)} from # categories`,
                })}
          </div>
        </div>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={onResetAvailable}
        disabled={isAssigning}
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">
            <Trans>Reset Available to Zero</Trans>
          </div>
          <div className="text-xs text-muted-foreground">
            {(() => {
              if (nonZeroCount === 0) {
                return t`All categories already at zero`;
              }
              const parts = [];
              if (overspentCount > 0) parts.push(`${overspentCount} overspent`);
              if (overfundedCount > 0) parts.push(`${overfundedCount} with surplus`);
              return plural(nonZeroCount, {
                one: `Adjust # category (${parts.join(', ')})`,
                other: `Adjust # categories (${parts.join(', ')})`,
              });
            })()}
          </div>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={onResetAssigned}
        disabled={resetAssignedCount === 0 || isAssigning}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        <div className="flex-1">
          <div className="font-medium">
            <Trans>Reset Assigned Amounts</Trans>
          </div>
          <div className="text-xs text-muted-foreground">
            {resetAssignedCount === 0
              ? t`All assignments already zero`
              : plural(resetAssignedCount, {
                  one: `Reset ${formatMilli(globalLocalizer, resetAssignedTotal)} across # category`,
                  other: `Reset ${formatMilli(globalLocalizer, resetAssignedTotal)} across # categories`,
                })}
          </div>
        </div>
      </DropdownMenuItem>
    </>
  );
}
