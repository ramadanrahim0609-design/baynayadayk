import { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}