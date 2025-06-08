'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DynamicTitle() {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    console.log('[DynamicTitle] Current state:', {
      isLoading,
      settings,
      currentTitle: document.title
    });

    if (!isLoading && settings?.siteName) {
      console.log('[DynamicTitle] Updating document title to:', settings.siteName);
        document.title = settings.siteName;
    }
  }, [settings?.siteName, isLoading]);

  return null;
} 