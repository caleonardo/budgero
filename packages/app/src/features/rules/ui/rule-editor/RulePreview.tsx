import { Trans } from '@lingui/react/macro';
import React from 'react';
import { Sparkles } from 'lucide-react';

export const RulePreview = React.memo(function RulePreview() {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">
          <Trans>Preview & Guidance</Trans>
        </h3>
        <p className="text-sm text-muted-foreground">
          <Trans>A quick reminder of how Budgero applies your automation.</Trans>
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
          <span>
            <Trans>
              Budgero evaluates your rule from top to bottom. If you ever need to rerun it, open the
              history drawer and trigger a retro run.
            </Trans>
          </span>
        </div>
      </div>
    </section>
  );
});
