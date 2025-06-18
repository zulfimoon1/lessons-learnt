
import React, { createContext, useContext, useState } from 'react';
import { translations } from '@/translations';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, interpolations?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, interpolations?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    let result = value || key;
    
    // Handle interpolations
    if (interpolations && typeof result === 'string') {
      Object.entries(interpolations).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), replacement);
      });
    }
    
    return result;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
