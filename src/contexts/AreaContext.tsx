import { createContext, useContext, type ReactNode } from 'react';
import type { AreaType } from '../types/knowledge.types';

const AreaContext = createContext<AreaType>('verstehen');

export function AreaProvider({ area, children }: { area: AreaType; children: ReactNode }) {
  return <AreaContext.Provider value={area}>{children}</AreaContext.Provider>;
}

export function useArea(): AreaType {
  return useContext(AreaContext);
}

export function getAreaColorVar(area: AreaType): string {
  return `var(--color-area-${area})`;
}
