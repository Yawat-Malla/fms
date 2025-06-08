'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemSettings {
  siteName: string;
  siteNameNepali: string;
  siteLogo?: string;
  maintenanceMode: boolean;
  enabledModules: string[];
}

interface SettingsContextType {
  settings: SystemSettings | null;
  setSettings: (settings: SystemSettings) => void;
  isLoading: boolean;
}

const defaultSettings: SystemSettings = {
  siteName: 'File Management System',
  siteNameNepali: 'फाइल व्यवस्थापन प्रणाली',
  maintenanceMode: false,
  enabledModules: ['files', 'users', 'reports'],
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  setSettings: () => {},
  isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      console.log('[SettingsContext] Starting to fetch settings');
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        console.log('[SettingsContext] Raw settings data:', data);
        
        if (data) {
          const newSettings = {
            siteName: (data.siteName || defaultSettings.siteName).trim(),
            siteNameNepali: (data.siteNameNepali || defaultSettings.siteNameNepali).trim(),
            siteLogo: data.siteLogo,
            maintenanceMode: data.maintenanceMode || defaultSettings.maintenanceMode,
            enabledModules: data.enabledModules || defaultSettings.enabledModules,
          };
          console.log('[SettingsContext] Processed settings:', newSettings);
          setSettings(newSettings);
          // Update document title immediately when settings are loaded
          document.title = newSettings.siteName;
          console.log('[SettingsContext] Updated document title to:', newSettings.siteName);
        }
      } catch (error) {
        console.error('[SettingsContext] Error fetching settings:', error);
        // Only use default settings if we fail to fetch
        console.log('[SettingsContext] Using default settings due to error');
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
        console.log('[SettingsContext] Finished loading settings, isLoading:', false);
      }
    };

    fetchSettings();
  }, []);

  // Log whenever settings change
  useEffect(() => {
    console.log('[SettingsContext] Settings updated:', settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext); 