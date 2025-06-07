'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DynamicFavicon() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.siteLogo) {
      // Update all favicon-related links
      const updateFavicon = (rel: string, href: string) => {
        const link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (link) {
          link.href = href;
      } else {
        const newLink = document.createElement('link');
          newLink.rel = rel;
          newLink.href = href;
        document.head.appendChild(newLink);
      }
      };

      // Update standard favicon
      updateFavicon('icon', settings.siteLogo);
      // Update shortcut icon
      updateFavicon('shortcut icon', settings.siteLogo);
      // Update apple touch icon
      updateFavicon('apple-touch-icon', settings.siteLogo);
    }
  }, [settings?.siteLogo]);

  return null;
} 