import { Trans } from '@lingui/react/macro';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trans>
            <History className="h-5 w-5" />
            Category memory
          </Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Remember how you file each payee, without writing a rule for it.</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="suggest-category-from-payee" className="font-medium">
              <Trans>Fill the category from the payee's last transaction</Trans>
            </Label>
            <p className="max-w-xl text-sm text-muted-foreground">
              <Trans>
                When you add a transaction for a payee you've used before, the category pre-fills
                with whatever you chose last time, marked with an amber ring. An autofill rule
                always wins over this, and it never touches imports or a category you've already
                picked.
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
      </CardContent>
    </Card>
  );
}
