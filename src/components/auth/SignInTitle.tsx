'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function SignInTitle() {
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
    <h2 className="text-center text-3xl font-extrabold text-white">
      {title}
    </h2>
  );
} 