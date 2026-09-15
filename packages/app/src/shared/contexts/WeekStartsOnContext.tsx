/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

const WeekStartsOnContext = createContext<0 | 1>(0);

export const WeekStartsOnProvider = WeekStartsOnContext.Provider;

export function useWeekStartsOn(): 0 | 1 {
  return useContext(WeekStartsOnContext);
}
