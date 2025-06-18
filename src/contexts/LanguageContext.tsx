
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
    try {
      // Ensure translations exist for the current language
      if (!translations[language]) {
        console.warn(`Translations not found for language: ${language}`);
        return key;
      }

      let translation = translations[language][key] || key;
      
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, value);
        });
      }
      
      return translation;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
