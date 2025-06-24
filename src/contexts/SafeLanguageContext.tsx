
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';
import { logCoreSystemStatus } from '@/utils/coreSystemsChecker';

type Language = 'en' | 'lt';

interface SafeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
}

// Safe fallback for when context is unavailable
const safeFallbackContext: SafeLanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key, // Return the key as fallback
  isLoading: false
};

const SafeLanguageContext = createContext<SafeLanguageContextType>(safeFallbackContext);

export const SafeLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = () => {
      try {
        console.log('🌐 SafeLanguage: Initializing...');
        logCoreSystemStatus();
        
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lt')) {
          setLanguage(savedLanguage);
          console.log('🌐 Language restored:', savedLanguage);
        } else {
          console.log('🌐 Using default language: en');
        }
      } catch (error) {
        console.warn('SafeLanguage: Failed to load language from localStorage:', error);
        // Fallback to English if there's any error
        setLanguage('en');
      } finally {
        setIsLoading(false);
        console.log('🌐 SafeLanguage: Initialization complete');
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = (lang: Language) => {
    try {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      console.log('🌐 Language changed to:', lang);
    } catch (error) {
      console.warn('SafeLanguage: Failed to save language to localStorage:', error);
      // Still change the language in memory even if storage fails
      setLanguage(lang);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      let translation = translations[language]?.[key] || translations['en']?.[key] || key;
      
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, value);
        });
      }
      
      return translation;
    } catch (error) {
      console.warn('SafeLanguage: Translation error for key:', key, error);
      return key; // Fallback to key if translation fails
    }
  };

  const contextValue: SafeLanguageContextType = {
    language,
    setLanguage: changeLanguage,
    t,
    isLoading
  };

  return (
    <SafeLanguageContext.Provider value={contextValue}>
      {children}
    </SafeLanguageContext.Provider>
  );
};

export const useSafeLanguage = () => {
  const context = useContext(SafeLanguageContext);
  if (!context) {
    console.warn('useSafeLanguage: Context not found, using fallback');
    return safeFallbackContext;
  }
  return context;
};
