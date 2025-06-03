import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import { AppProvider } from '@/contexts/AppContext';
import { TextSettingsProvider } from '@/contexts/TextSettingsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import DynamicTitle from '@/components/DynamicTitle';
import DynamicFavicon from '@/components/DynamicFavicon';
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
  
  return {
    title: settings?.siteName || 'File Management System',
    description: "A modern file management system for government offices",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SettingsProvider>
          <Providers session={session}>
            <TextSettingsProvider>
              <AppProvider>
                <DynamicTitle />
                <DynamicFavicon />
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
