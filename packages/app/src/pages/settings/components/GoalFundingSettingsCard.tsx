import { Trans, useLingui } from '@lingui/react/macro';
import {
  useGoalFundingSettings,
  useUpdateGoalFundingSettings,
} from '@entities/budget/api/useGoalFundingSettings';
import { useUiStore } from '@shared/store/useUiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Label } from '@shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@shared/ui/radio-group';
import { Switch } from '@shared/ui/switch';
import { toast } from 'sonner';
import type { GoalFundingSettings } from '@budgero/core/browser';

export function GoalFundingSettingsCard() {
  const { t } = useLingui();

  const budgetId = useUiStore((state) => state.selectedBudget?.ID ?? 0);
  const settings = useGoalFundingSettings(budgetId);
  const mutation = useUpdateGoalFundingSettings();
  const disabled = !settings.isReady || mutation.isPending;
  const save = (patch: Partial<GoalFundingSettings>) =>
    mutation.mutate(
      { budgetId, settings: patch },
      {
        onError: () => toast.error(t`Could not update goal funding settings`),
      }
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Goal funding</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Choose how this budget funds goals. These settings sync across devices.</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">
            <Trans>Priority choices</Trans>
          </legend>
          <RadioGroup
            value={settings.CategoryPriorityMode}
            disabled={disabled}
            onValueChange={(value) =>
              save({ CategoryPriorityMode: value as GoalFundingSettings['CategoryPriorityMode'] })
            }
          >
            <div className="flex gap-2 items-center">
              <RadioGroupItem id="priority-five" value="five-levels" />
              <Label htmlFor="priority-five">
                <Trans>Five levels (default)</Trans>
              </Label>
            </div>
            <div className="flex gap-2 items-center">
              <RadioGroupItem id="priority-numeric" value="numeric" />
              <Label htmlFor="priority-numeric">
                <Trans>Any positive whole number</Trans>
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            <Trans>
              1 is highest. New categories start at 3 — Normal. Switching to five levels sets
              priorities above 5 to 5; you can undo this change.
            </Trans>
          </p>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">
            <Trans>Sharing within a priority</Trans>
          </legend>
          <RadioGroup
            value={settings.GoalFundingDistribution}
            disabled={disabled}
            onValueChange={(value) =>
              save({
                GoalFundingDistribution: value as GoalFundingSettings['GoalFundingDistribution'],
              })
            }
          >
            <div className="flex gap-2 items-center">
              <RadioGroupItem id="fund-proportional" value="proportional-shortfall" />
              <Label htmlFor="fund-proportional">
                <Trans>Proportional shortfalls (default)</Trans>
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              <Trans>Cover the same fraction of each goal’s remaining need.</Trans>
            </p>
            <div className="flex gap-2 items-center">
              <RadioGroupItem id="fund-equal" value="equal-completion" />
              <Label htmlFor="fund-equal">
                <Trans>Equal completion percentage</Trans>
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Help the least-funded goals catch up toward the same percentage of this month’s
                target.
              </Trans>
            </p>
          </RadioGroup>
        </fieldset>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="show-priorities">
              <Trans>Show priority badges</Trans>
            </Label>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Show a small badge for categories with a priority other than 3. Funding is
                unaffected.
              </Trans>
            </p>
          </div>
          <Switch
            id="show-priorities"
            checked={settings.ShowCategoryPriorities}
            disabled={disabled}
            onCheckedChange={(ShowCategoryPriorities) => save({ ShowCategoryPriorities })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
