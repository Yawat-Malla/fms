'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TextSettings {
  fontSize: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
}

interface TextSettingsContextType {
  textSettings: TextSettings;
  updateTextSettings: (settings: Partial<TextSettings>) => void;
}

const defaultSettings: TextSettings = {
  fontSize: 'text-base',
  fontFamily: 'font-sans',
  lineHeight: 'leading-normal',
  letterSpacing: 'tracking-normal',
};

const TextSettingsContext = createContext<TextSettingsContextType | undefined>(undefined);

export function TextSettingsProvider({ children }: { children: React.ReactNode }) {
  const [textSettings, setTextSettings] = useState<TextSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('textSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('textSettings', JSON.stringify(textSettings));
  }, [textSettings]);

  const updateTextSettings = (newSettings: Partial<TextSettings>) => {
    setTextSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <TextSettingsContext.Provider value={{ textSettings, updateTextSettings }}>
      {children}
    </TextSettingsContext.Provider>
  );
}

export function useTextSettings() {
  const context = useContext(TextSettingsContext);
  if (context === undefined) {
    throw new Error('useTextSettings must be used within a TextSettingsProvider');
  }
  return context;
} 