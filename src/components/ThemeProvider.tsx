'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Add dark class to html element on component mount
  useEffect(() => {
    // Add dark class to the HTML element for Tailwind dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
} 