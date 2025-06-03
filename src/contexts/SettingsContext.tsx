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
  settings: defaultSettings,
  setSettings: () => {},
  isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data && (data.siteName || data.siteNameNepali)) {
          const newSettings = {
            siteName: data.siteName || defaultSettings.siteName,
            siteNameNepali: data.siteNameNepali || defaultSettings.siteNameNepali,
            siteLogo: data.siteLogo,
            maintenanceMode: data.maintenanceMode || defaultSettings.maintenanceMode,
            enabledModules: data.enabledModules || defaultSettings.enabledModules,
          };
          setSettings(newSettings);
          // Update document title immediately when settings are loaded
          document.title = newSettings.siteName;
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext); 