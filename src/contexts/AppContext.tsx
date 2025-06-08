'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/translations';

interface AppContextType {
  theme: 'dark' | 'light';
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  mounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Initialize values from localStorage after mount
  useEffect(() => {
    // Check for system preference first
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const savedLanguage = localStorage.getItem('language') as Language;
    
    // Use saved theme if exists, otherwise use system preference
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
    
    setMounted(true);
  }, [i18n]);

  // Update theme in localStorage and document class when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme, mounted]);

  // Update language in localStorage and document lang attribute when language changes
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language, mounted, i18n]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <AppContext.Provider value={{ theme, language, toggleTheme, setLanguage, mounted }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 