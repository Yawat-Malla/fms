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
  const siteName = settings?.siteName || 'File Management System';
  const siteLogo = settings?.siteLogo || '/favicon.ico';
  
  return {
    title: siteName,
    description: "A modern file management system for government offices",
    icons: {
      icon: [
        { url: siteLogo, sizes: 'any' },
        { url: '/favicon.ico', sizes: 'any' }
      ],
      shortcut: siteLogo,
      apple: siteLogo,
    },
    manifest: '/site.webmanifest',
    themeColor: '#1a1a1a',
    viewport: 'width=device-width, initial-scale=1',
    other: {
      'msapplication-TileImage': siteLogo,
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

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href={settings?.siteLogo || '/favicon.ico'} />
        <link rel="shortcut icon" href={settings?.siteLogo || '/favicon.ico'} />
        <link rel="apple-touch-icon" href={settings?.siteLogo || '/apple-touch-icon.png'} />
      </head>
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
