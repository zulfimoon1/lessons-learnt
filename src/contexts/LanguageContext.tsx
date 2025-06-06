
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'welcome.title': 'Transform Education with Real-Time Feedback',
    'welcome.subtitle': 'Empower students to share their thoughts and help teachers create better learning experiences through meaningful feedback.',
    'auth.studentLogin': 'Student Login',
    'auth.teacherLogin': 'Teacher Login',
    'features.studentFeedback.title': 'Student Feedback',
    'features.studentFeedback.description': 'Students can easily share their thoughts about lessons, teaching methods, and classroom experience in real-time.',
    'features.teacherInsights.title': 'Teacher Insights',
    'features.teacherInsights.description': 'Teachers get valuable insights from student feedback to improve their teaching methods and create better learning environments.',
    'features.dataAnalytics.title': 'Data Analytics',
    'features.dataAnalytics.description': 'Comprehensive analytics and reporting tools help schools track progress and make data-driven decisions for educational improvement.'
  },
  lt: {
    'welcome.title': 'Keiskite švietimą su realaus laiko atsiliepimais',
    'welcome.subtitle': 'Įgalinkite mokinius dalytis savo mintimis ir padėkite mokytojams kurti geresnes mokymosi patirtis per prasmingus atsiliepimus.',
    'auth.studentLogin': 'Mokinio prisijungimas',
    'auth.teacherLogin': 'Mokytojo prisijungimas',
    'features.studentFeedback.title': 'Mokinių atsiliepimai',
    'features.studentFeedback.description': 'Mokiniai gali lengvai dalytis savo mintimis apie pamokas, mokymo metodus ir klasės patirtį realiu laiku.',
    'features.teacherInsights.title': 'Mokytojų įžvalgos',
    'features.teacherInsights.description': 'Mokytojai gauna vertingas įžvalgas iš mokinių atsiliepimų, kad pagerintų savo mokymo metodus ir sukurtų geresnes mokymosi aplinkas.',
    'features.dataAnalytics.title': 'Duomenų analitika',
    'features.dataAnalytics.description': 'Išsamūs analitikos ir ataskaitų įrankiai padeda mokykloms sekti pažangą ir priimti duomenimis pagrįstus sprendimus švietimo gerinimui.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
