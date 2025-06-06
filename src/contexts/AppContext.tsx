'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '@/translations';

interface AppContextType {
  theme: 'dark' | 'light';
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  mounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to get nested translation value
const getNestedTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined) {
      console.log(`[Translation Debug] Key not found: ${key} in path: ${path}`);
      return path;
    }
    result = result[key];
  }
  
  if (typeof result !== 'string') {
    console.log(`[Translation Debug] Result is not a string for path: ${path}`, result);
    return path;
  }
  
  return result;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or default to system preference
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage or default to 'en'
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
    
    if (savedLanguage) setLanguage(savedLanguage);
    
    setMounted(true);
  }, []);

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
    
    // Force a refresh of the page to ensure all components re-render with new language
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('languageChange'));
    }
  }, [language, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper function to get nested translation value
  const t = (key: string): string => {
    if (!mounted) return key;
    
    const translation = getNestedTranslation(translations[language], key);
    return translation || key;
  };

  return (
    <AppContext.Provider value={{ theme, language, toggleTheme, setLanguage, t, mounted }}>
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