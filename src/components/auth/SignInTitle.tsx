'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function SignInTitle({ siteName }: { siteName: string }) {
  const { settings, isLoading } = useSettings();

  console.log('[SignInTitle] Current state:', {
    isLoading,
    settings,
    siteName: settings?.siteName,
    defaultTitle: 'File Management System'
  });

  if (isLoading) {
    return (
      <h2 className="text-center text-3xl font-extrabold text-white">
        Loading...
      </h2>
    );
  }

  const title = settings?.siteName || 'File Management System';
  console.log('[SignInTitle] Rendering with title:', title);

  return (
    <div className="text-center">
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Sign in to your account
      </p>
    </div>
  );
} 