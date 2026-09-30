import { Trans } from '@lingui/react/macro';
import { Switch } from '@shared/ui/switch';
import { Label } from '@shared/ui/label';
import { History } from 'lucide-react';
import { useSuggestCategoryFromPayeePreference } from '@shared/hooks/useUserPreferences';

/**
 * Settings toggle for the payee category memory. Lives beside the autofill
 * rules because it is the fallback those rules override.
 */
export function PayeeCategoryMemoryCard() {
  const { suggestCategoryFromPayee, isLoading, updateSuggestCategoryFromPayee, isUpdating } =
    useSuggestCategoryFromPayeePreference();

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-card px-3 py-2.5">
      <div className="min-w-0 space-y-0.5">
        <Label
          htmlFor="suggest-category-from-payee"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <History className="h-3.5 w-3.5 text-muted-foreground" />
          <Trans>Fill the category from the payee's last transaction</Trans>
        </Label>
        <p className="text-xs text-muted-foreground">
          <Trans>
            When you add a transaction for a payee you've used before, the category pre-fills with
            whatever you chose last time, marked with an amber ring. An autofill rule always wins
            over this, and it never touches imports or a category you've already picked.
          </Trans>
        </p>
      </div>
      <Switch
        id="suggest-category-from-payee"
        checked={suggestCategoryFromPayee}
        onCheckedChange={(checked) => updateSuggestCategoryFromPayee(checked)}
        disabled={isLoading || isUpdating}
      />
    </div>
  );
}
