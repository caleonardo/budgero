import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAdminApi } from '@features/admin/api/useAdminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Switch } from '@shared/ui/switch';
import { Label } from '@shared/ui/label';
import { Button } from '@shared/ui/button';

const queryKey = ['admin', 'self-host-registration'];

export function RegistrationSettings() {
  const api = useAdminApi();
  const client = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    queryFn: api.getSelfHostRegistration,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const update = useMutation({
    mutationFn: api.updateSelfHostRegistration,
    onSuccess: (settings) => {
      client.setQueryData(queryKey, settings);
      void client.invalidateQueries({ queryKey: ['self-host-auth-config'] });
      toast.success(
        settings.registrationEnabled ? 'Public sign-ups enabled' : 'Public sign-ups disabled'
      );
    },
    onError: () => {
      toast.error('Unable to update sign-up settings. Please try again.');
      void refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>Control who can create an account on this instance.</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading registration settings…</p>
        ) : isError ? (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-sm">
              Unable to load registration settings.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          data && (
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="public-signups">Allow public sign-ups</Label>
                <p id="public-signups-description" className="text-sm text-muted-foreground">
                  When off, sign-up links open sign-in. Existing users can still sign in, and admins
                  can create accounts.
                </p>
                {data.environmentLocked && (
                  <p className="text-sm text-muted-foreground">
                    Disabled by DISABLE_REGISTRATION. Remove this environment flag and restart the
                    server to enable sign-ups here.
                  </p>
                )}
              </div>
              <Switch
                id="public-signups"
                aria-describedby="public-signups-description"
                checked={data.registrationEnabled}
                disabled={data.environmentLocked || update.isPending}
                onCheckedChange={(enabled) => update.mutate(enabled)}
              />
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
