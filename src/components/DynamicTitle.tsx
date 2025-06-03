'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DynamicTitle() {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    // Only update the title if we have settings and we're not loading
    if (!isLoading && settings?.siteName) {
      // Only update if the title is different to avoid unnecessary updates
      if (document.title !== settings.siteName) {
        document.title = settings.siteName;
      }
    }
  }, [settings?.siteName, isLoading]);

  return null;
} 