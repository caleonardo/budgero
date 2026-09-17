import { Trans, useLingui } from '@lingui/react/macro';
import { CircleHelp, ExternalLink } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { cn } from '@shared/lib/utils';

interface YnabPatHelpPopoverProps {
  className?: string;
}

export function YnabPatHelpPopover({ className }: YnabPatHelpPopoverProps) {
  const { t } = useLingui();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-5 rounded-full text-muted-foreground', className)}
          aria-label={t`How to create a YNAB personal access token`}
        >
          <CircleHelp className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] space-y-3 text-xs">
        <p className="font-medium text-foreground">Create a YNAB personal access token</p>
        <ol className="list-decimal space-y-1.5 pl-4 text-muted-foreground">
          <li>
            <Trans>Sign in to the YNAB web app and open Account Settings.</Trans>
          </li>
          <li>
            <Trans>Open Developer Settings, then find Personal Access Tokens.</Trans>
          </li>
          <li>Select New Token, enter your password, and choose Generate.</li>
          <li>
            <Trans>Copy the token when it appears and paste it here.</Trans>
          </li>
        </ol>
        <p className="text-[11px] text-muted-foreground">
          <Trans>
            YNAB shows the full token only once. Treat it like a password; you can revoke it later
            from the same screen.
          </Trans>
        </p>
        <a
          href="https://app.ynab.com/settings/developer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2"
        >
          <Trans>
            Open YNAB Developer Settings
            <ExternalLink className="size-3" />
          </Trans>
        </a>
      </PopoverContent>
    </Popover>
  );
}
