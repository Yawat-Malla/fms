'use client';

import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  useEffect(() => {
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    // Add the current theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
} 