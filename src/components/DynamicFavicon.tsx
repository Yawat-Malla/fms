'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DynamicFavicon() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.siteLogo) {
      // Create a new link element for the favicon
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.siteLogo;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.siteLogo;
        document.head.appendChild(newLink);
      }
    }
  }, [settings?.siteLogo]);

  return null;
} 