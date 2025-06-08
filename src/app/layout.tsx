import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import { AppProvider } from '@/contexts/AppContext';
import { TextSettingsProvider } from '@/contexts/TextSettingsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import DynamicTitle from '@/components/DynamicTitle';
import prisma from '@/lib/prisma';

// Use Inter as the primary font (closer to iOS San Francisco font)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Specify weights for better font loading optimization
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSettings.findFirst();
  const title = settings?.siteName || 'File Management System';
  
  console.log('[RootLayout] Generated metadata with title:', title);
  
  return {
    title,
    description: 'A modern file management system built with Next.js',
    icons: {
      icon: '/nepal-emblem.png',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const settings = await prisma.systemSettings.findFirst();
  const title = settings?.siteName || 'File Management System';

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <title>{title}</title>
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <Providers session={session}>
            <TextSettingsProvider>
              <AppProvider>
                <DynamicTitle />
                {children}
                <Toaster position="top-right" />
              </AppProvider>
            </TextSettingsProvider>
          </Providers>
        </SettingsProvider>
      </body>
    </html>
  );
}
