
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Auth
    'auth.login': 'Login',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.school': 'School',
    'auth.loginFailed': 'Login failed',
    'auth.loginSuccess': 'Login successful',
    'auth.loggingIn': 'Logging in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.createAccount': 'Create Account',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    
    // Student
    'student.fullNamePlaceholder': 'Enter your full name',
    'student.fullNameSignupPlaceholder': 'Enter your full name',
    'student.schoolPlaceholder': 'Enter your school name',
    'student.gradePlaceholder': 'e.g., Grade 5, Year 7',
    'student.classGrade': 'Class/Grade',
    'student.createPassword': 'Create a password',
    'student.confirmPasswordPlaceholder': 'Confirm your password',
    'student.loginFailed': 'Login failed',
    'student.signupFailed': 'Signup failed',
    'student.welcomeBack': 'Welcome back!',
    'student.loginSuccess': 'Login successful',
    'student.accountCreated': 'Account created!',
    'student.welcomeToApp': 'Welcome to LessonLens!',
    'student.passwordMismatch': 'Password mismatch',
    'student.passwordsDoNotMatch': 'Passwords do not match',
    
    // Teacher
    'teacher.missingInfo': 'Missing information',
    
    // Login pages
    'login.student.title': 'Student Portal',
    'login.student.subtitle': 'Share your thoughts and help improve your learning experience',
    'login.teacher.title': 'Teacher Portal',
    'login.teacher.subtitle': 'Monitor and improve your teaching effectiveness',
    'login.teacher.role': 'Role',
    'login.teacher.roleTeacher': 'Teacher',
    'login.teacher.roleAdmin': 'Administrator',
  },
  lt: {
    // Common
    'common.loading': 'Kraunama...',
    'common.error': 'Klaida',
    'common.success': 'Sėkmė',
    
    // Auth
    'auth.login': 'Prisijungti',
    'auth.signUp': 'Registruotis',
    'auth.email': 'El. paštas',
    'auth.password': 'Slaptažodis',
    'auth.confirmPassword': 'Patvirtinti slaptažodį',
    'auth.fullName': 'Vardas ir pavardė',
    'auth.school': 'Mokykla',
    'auth.loginFailed': 'Prisijungimas nepavyko',
    'auth.loginSuccess': 'Sėkmingai prisijungta',
    'auth.loggingIn': 'Prisijungiama...',
    'auth.creatingAccount': 'Kuriama paskyra...',
    'auth.createAccount': 'Sukurti paskyrą',
    'auth.emailRequired': 'El. paštas privalomas',
    'auth.passwordRequired': 'Slaptažodis privalomas',
    
    // Student
    'student.fullNamePlaceholder': 'Įveskite vardą ir pavardę',
    'student.fullNameSignupPlaceholder': 'Įveskite vardą ir pavardę',
    'student.schoolPlaceholder': 'Įveskite mokyklos pavadinimą',
    'student.gradePlaceholder': 'pvz., 5 klasė, 10A',
    'student.classGrade': 'Klasė',
    'student.createPassword': 'Sukurkite slaptažodį',
    'student.confirmPasswordPlaceholder': 'Patvirtinkite slaptažodį',
    'student.loginFailed': 'Prisijungimas nepavyko',
    'student.signupFailed': 'Registracija nepavyko',
    'student.welcomeBack': 'Sveiki sugrįžę!',
    'student.loginSuccess': 'Sėkmingai prisijungta',
    'student.accountCreated': 'Paskyra sukurta!',
    'student.welcomeToApp': 'Sveiki atvykę į LessonLens!',
    'student.passwordMismatch': 'Slaptažodžiai nesutampa',
    'student.passwordsDoNotMatch': 'Slaptažodžiai nesutampa',
    
    // Teacher
    'teacher.missingInfo': 'Trūksta informacijos',
    
    // Login pages
    'login.student.title': 'Mokinio portalas',
    'login.student.subtitle': 'Pasidalinkite savo mintimis ir padėkite pagerinti mokymosi patirtį',
    'login.teacher.title': 'Mokytojo portalas',
    'login.teacher.subtitle': 'Stebėkite ir gerinkite savo mokymo efektyvumą',
    'login.teacher.role': 'Vaidmuo',
    'login.teacher.roleTeacher': 'Mokytojas',
    'login.teacher.roleAdmin': 'Administratorius',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
