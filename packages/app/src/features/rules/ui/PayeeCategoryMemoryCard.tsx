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
          <History className="h-5 w-5" />
          Category memory
        </CardTitle>
        <CardDescription>
          Remember how you file each payee, without writing a rule for it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="suggest-category-from-payee" className="font-medium">
              Fill the category from the payee&apos;s last transaction
            </Label>
            <p className="max-w-xl text-sm text-muted-foreground">
              When you add a transaction for a payee you&apos;ve used before, the category pre-fills
              with whatever you chose last time, marked with an amber ring. An autofill rule always
              wins over this, and it never touches imports or a category you&apos;ve already picked.
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
