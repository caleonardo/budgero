'use client';

import { Trans } from '@lingui/react/macro';

import React from 'react';
import CreateBudgetForm from '@features/budget-management/ui/CreateBudgetForm';

interface BudgetWizardProps {
  onCreated?: (budgetId: number) => void;
  onModeChange?: (mode: 'manual' | 'core' | 'import') => void;
  onWideLayoutChange?: (wide: boolean) => void;
  defaultTab?: 'manual' | 'core' | 'import';
  hideHeader?: boolean;
}

const BudgetWizard: React.FC<BudgetWizardProps> = ({
  onCreated,
  onModeChange,
  onWideLayoutChange,
  defaultTab,
  hideHeader,
}) => {
  if (hideHeader) {
    return (
      <CreateBudgetForm
        onCreated={onCreated}
        onModeChange={onModeChange}
        onWideLayoutChange={onWideLayoutChange}
        defaultTab={defaultTab}
      />
    );
  }

  return (
    <div className="rounded-xl p-2 sm:p-4">
      <h2 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
        <Trans>Start a New Budget</Trans>
      </h2>
      <CreateBudgetForm
        onCreated={onCreated}
        onModeChange={onModeChange}
        onWideLayoutChange={onWideLayoutChange}
        defaultTab={defaultTab}
      />
    </div>
  );
};

export default BudgetWizard;
