import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

// Provide a default context value to prevent the "must be used within provider" error
const defaultContextValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key, // Return the key as fallback
  isLoading: true
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lt')) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage: changeLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  // Since we now provide a default context value, this should never be undefined
  // But we'll keep a safety check with a more informative message
  if (!context) {
    console.error('useLanguage: Context is unexpectedly undefined');
    return defaultContextValue;
  }
  return context;
};
