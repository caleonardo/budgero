import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useWeekStartsOnPreference } from '@shared/hooks/useUserPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

export function CalendarSettingsCard() {
  const { weekStartsOn, updateWeekStartsOn, isLoading, isError, isUpdating } =
    useWeekStartsOnPreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendar
        </CardTitle>
        <CardDescription>
          Choose the first day of the week for calendars, weekly reports, and “this week” and “last
          week” searches in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="week-starts-on">First day of the week</Label>
        <Select
          value={String(weekStartsOn)}
          disabled={isLoading || isError || isUpdating}
          onValueChange={(value) => {
            if (value !== '0' && value !== '1') return;
            updateWeekStartsOn(value === '1' ? 1 : 0, {
              onError: () => toast.error('Could not save the first day of the week'),
            });
          }}
        >
          <SelectTrigger id="week-starts-on" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
          </SelectContent>
        </Select>
        {isError && (
          <p role="alert" className="text-sm text-destructive">
            Could not load calendar settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
