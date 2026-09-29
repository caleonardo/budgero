import React from 'react';
import { Button } from '@shared/ui/button';
import { Plus } from 'lucide-react';

interface RuleEditorSectionProps {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}

export function RuleEditorSection({
  title,
  description,
  addLabel,
  onAdd,
  children,
}: RuleEditorSectionProps) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">{children}</div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-full justify-start border border-dashed text-muted-foreground hover:text-foreground"
        onClick={onAdd}
      >
        <Plus className="mr-1 h-4 w-4" />
        {addLabel}
      </Button>
    </section>
  );
}
