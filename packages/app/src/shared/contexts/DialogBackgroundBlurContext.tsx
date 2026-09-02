/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';

const DialogBackgroundBlurContext = createContext(true);

export function DialogBackgroundBlurProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <DialogBackgroundBlurContext.Provider value={enabled}>
      {children}
    </DialogBackgroundBlurContext.Provider>
  );
}

export function useDialogBackgroundBlurEnabled(): boolean {
  return useContext(DialogBackgroundBlurContext);
}
