import { Trans } from '@lingui/react/macro';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { RECOMMENDED_TEXT_MODELS, RECOMMENDED_VISION_MODELS } from './ai-settings.constants';

export function RecommendedModelsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Recommended Models</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Suggested models for best performance with budget tasks</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">
              <Trans>Text Models (for categorization)</Trans>
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {RECOMMENDED_TEXT_MODELS.map((model) => (
                <li key={model.name}>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{model.name}</code> -{' '}
                  {model.description}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">
              <Trans>Vision Models (for receipt scanning)</Trans>
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {RECOMMENDED_VISION_MODELS.map((model) => (
                <li key={model.name}>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{model.name}</code> -{' '}
                  {model.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
