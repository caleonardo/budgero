import { Trans, useLingui } from '@lingui/react/macro';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface AINotConfiguredWarningProps {
  description?: ReactNode;
}

export function AINotConfiguredWarning({ description }: AINotConfiguredWarningProps) {
  const { t } = useLingui();

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            <Trans>AI not configured</Trans>
          </p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            {description ??
              t`Go to Settings → AI Assistant to configure your local LLM connection.`}
          </p>
        </div>
      </div>
    </div>
  );
}
