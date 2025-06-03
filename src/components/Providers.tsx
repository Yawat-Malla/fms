'use client';

import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '@/contexts/AppContext';
import ThemeProvider from '@/components/ThemeProvider';
import AnimationProvider from '@/components/AnimationProvider';

interface ProvidersProps {
  children: React.ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        <ThemeProvider>
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </ThemeProvider>
      </AppProvider>
    </SessionProvider>
  );
} 