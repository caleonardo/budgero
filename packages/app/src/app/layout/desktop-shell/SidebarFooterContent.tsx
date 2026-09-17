import { useLingui, Trans } from '@lingui/react/macro';
import React from 'react';
import { Heart, LogOut } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarSeparator } from '@shared/ui/sidebar';
import { Button } from '@shared/ui/button';
import { IS_SELF_HOSTABLE_BUILD } from '@shared/lib/env';

interface SidebarFooterContentProps {
  logout: {
    isPending: boolean;
    mutate: () => void;
  };
}

export const SidebarFooterContent = React.memo(function SidebarFooterContent({
  logout,
}: SidebarFooterContentProps) {
  const { t } = useLingui();

  return (
    <>
      <SidebarSeparator />
      <SidebarMenu>
        {IS_SELF_HOSTABLE_BUILD && (
          <SidebarMenuItem className="flex justify-center">
            <Button asChild variant="ghost" className="text-sm text-muted-foreground gap-2">
              <a
                href="https://budgero.app/donate?utm_source=selfhost-app&utm_medium=sidebar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans>
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Donate to Budgero
                  <span className="sr-only">
                    <Trans>(opens in a new tab)</Trans>
                  </span>
                </Trans>
              </a>
            </Button>
          </SidebarMenuItem>
        )}
        {/* Plain Button, not SidebarMenuButton: wrapping one in the other
            nests <button> inside <button>, which React (and HTML) forbids. */}
        <SidebarMenuItem className="flex justify-center">
          <Button
            variant="ghost"
            className="text-sm text-destructive hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/40 focus-visible:ring-offset-background flex items-center gap-2"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? t`Signing out...` : t`Sign out`}
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
});
