import type { ReactNode } from 'react';
import { DialogBackgroundBlurProvider } from '@shared/contexts/DialogBackgroundBlurContext';
import { useDialogBackgroundBlur } from '@shared/hooks/useUserPreferences';

export function PersistedDialogAppearanceProvider({ children }: { children: ReactNode }) {
  const { data: dialogBackgroundBlur = true } = useDialogBackgroundBlur();

  return (
    <DialogBackgroundBlurProvider enabled={dialogBackgroundBlur}>
      {children}
    </DialogBackgroundBlurProvider>
  );
}
