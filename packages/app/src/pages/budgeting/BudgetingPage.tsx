import { BudgetingPageMobile } from '@pages/budgeting/BudgetingPage.mobile';
import { BudgetingPageDesktop } from '@pages/budgeting/BudgetingPage.desktop';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { usePlanningNumberAnimations } from '@shared/hooks/useUserPreferences';
import { PlanningNumberAnimationProvider } from '@features/budget-planning/ui/PlanningNumberAnimation';

export function BudgetingPage() {
  const isBelowDesktopBreakpoint = useIsMobile(1020);
  const { data: planningNumberAnimations = false } = usePlanningNumberAnimations();

  return (
    <PlanningNumberAnimationProvider enabled={planningNumberAnimations}>
      {isBelowDesktopBreakpoint ? <BudgetingPageMobile /> : <BudgetingPageDesktop />}
    </PlanningNumberAnimationProvider>
  );
}
