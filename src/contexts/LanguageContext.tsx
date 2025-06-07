
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageContextType } from '@/types/language';
import { translations } from '@/translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lt')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.error('useLanguage must be used within a LanguageProvider. Providing fallback...');
    
    // Provide a fallback context to prevent crashes
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => {
        const fallbackTranslations: Record<string, string> = {
          'welcome.title': 'Transform Education with Student-Led Feedback',
          'welcome.subtitle': 'Empowering schools with real-time insights from students to create better learning environments and support mental health.',
          'tagline.studentLead': 'Because students know best what they need.',
          'auth.studentLogin': 'Student Login',
          'auth.teacherLogin': 'Teacher Login'
        };
        
        return fallbackTranslations[key] || key;
      }
    };
  }
  return context;
};
