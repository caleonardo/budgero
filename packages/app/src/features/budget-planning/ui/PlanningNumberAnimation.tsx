import { createContext, useContext, type ReactNode } from 'react';
import { AnimatedNumber, type AnimatedNumberProps } from '@shared/ui/animated-number';

const PlanningNumberAnimationContext = createContext(false);

export function PlanningNumberAnimationProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <PlanningNumberAnimationContext.Provider value={enabled}>
      {children}
    </PlanningNumberAnimationContext.Provider>
  );
}

/** Planning amount that snaps by default and animates only when enabled in Appearance. */
export function PlanningAnimatedNumber({
  value,
  formatter,
  stiffness: _stiffness,
  damping: _damping,
  rounding: _rounding,
  ...spanProps
}: AnimatedNumberProps) {
  const enabled = useContext(PlanningNumberAnimationContext);

  if (enabled) {
    return (
      <AnimatedNumber
        value={value}
        formatter={formatter}
        stiffness={_stiffness}
        damping={_damping}
        rounding={_rounding}
        {...spanProps}
      />
    );
  }

  return <span {...spanProps}>{formatter(value)}</span>;
}
