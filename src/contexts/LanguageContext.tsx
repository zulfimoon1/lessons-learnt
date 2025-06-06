
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: 'en' | 'lt';
  setLanguage: (lang: 'en' | 'lt') => void;
  t: (key: string) => string;
}

const translations: Record<'en' | 'lt', Translations> = {
  en: {
    // Header
    'app.title': 'LessonLens',
    'app.subtitle': 'Connect • Reflect • Improve',
    'teacher.login': 'Teacher Login',
    'student.login': 'Student Login',
    
    // Home page
    'home.welcome': 'Help Your Teachers Help You Learn Better',
    'home.description': 'Share your learning experience, emotions, and suggestions to create better lessons for everyone. Your voice matters in shaping your education journey.',
    'home.giveFeedback': 'Give Lesson Feedback',
    'home.anonymousNotice': "Don't worry - you can submit feedback anonymously if you prefer",
    'home.continueAnonymously': 'Continue Anonymously',
    
    // Features
    'feature.understanding.title': 'Lesson Understanding',
    'feature.understanding.description': 'Rate how well you understood the lesson content and identify areas that need more explanation.',
    'feature.engagement.title': 'Engagement Level',
    'feature.engagement.description': 'Share how interesting and engaging the lesson was, and what kept you motivated to learn.',
    'feature.emotional.title': 'Emotional Wellbeing',
    'feature.emotional.description': 'Express how you felt during the lesson and any emotional aspects of your learning experience.',
    
    // Student Login
    'student.portal': 'Student Portal',
    'student.loginDescription': 'Login to your account or create a new one',
    'student.fullName': 'Full Name',
    'student.school': 'School',
    'student.grade': 'Class/Grade',
    'student.password': 'Password',
    'student.confirmPassword': 'Confirm Password',
    'student.createAccount': 'Create Account',
    'student.login.button': 'Login',
    'student.signup': 'Sign Up',
    
    // Dashboard
    'dashboard.myClasses': 'My Classes',
    'dashboard.welcome': 'Welcome back',
    'dashboard.logout': 'Logout',
    'dashboard.noClasses': 'No Classes Scheduled',
    'dashboard.noClassesDescription': "Your teacher hasn't uploaded any class schedules yet. Check back later!",
    'dashboard.upcomingClasses': 'Upcoming Classes',
    'dashboard.giveFeedback': 'Give Feedback',
    'dashboard.giveAnonymousFeedback': 'Give Anonymous Feedback',
    
    // Weekly Summary
    'weekly.title': 'Weekly Summary',
    'weekly.subtitle': 'How was your week?',
    'weekly.question': 'Do you have any concerns at school this week?',
    'weekly.emotional': 'Emotional concerns',
    'weekly.academic': 'Academic/work related concerns',
    'weekly.submit': 'Submit Weekly Summary',
    'weekly.success': 'Weekly summary submitted successfully!',
    
    // Common
    'language': 'Language',
    'english': 'English',
    'lithuanian': 'Lithuanian',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'loading': 'Loading...',
  },
  lt: {
    // Header
    'app.title': 'PamokųĮžvalga',
    'app.subtitle': 'Susieti • Apmąstyti • Tobulėti',
    'teacher.login': 'Mokytojo prisijungimas',
    'student.login': 'Mokinio prisijungimas',
    
    // Home page
    'home.welcome': 'Padėkite savo mokytojams padėti jums geriau mokytis',
    'home.description': 'Pasidalykite savo mokymosi patirtimi, emocijomis ir pasiūlymais, kad sukurtumėte geresnes pamokas visiems. Jūsų nuomonė svarbi formuojant jūsų švietimo kelionę.',
    'home.giveFeedback': 'Pateikti pamokos atsiliepimą',
    'home.anonymousNotice': 'Nesijaudinkite - galite pateikti atsiliepimą anonimiškai, jei pageidaujate',
    'home.continueAnonymously': 'Tęsti anonimiškai',
    
    // Features
    'feature.understanding.title': 'Pamokos supratimas',
    'feature.understanding.description': 'Įvertinkite, kaip gerai supratote pamokos turinį ir nustatykite sritis, kurioms reikia daugiau paaiškinimų.',
    'feature.engagement.title': 'Įsitraukimo lygis',
    'feature.engagement.description': 'Pasidalykite, kaip įdomi ir įtraukianti buvo pamoka, ir kas jus motyvavo mokytis.',
    'feature.emotional.title': 'Emocinė gerovė',
    'feature.emotional.description': 'Išreikškite, kaip jautėtės pamokos metu ir bet kokius emocinius jūsų mokymosi patirties aspektus.',
    
    // Student Login
    'student.portal': 'Mokinio portalas',
    'student.loginDescription': 'Prisijunkite prie savo paskyros arba sukurkite naują',
    'student.fullName': 'Vardas ir pavardė',
    'student.school': 'Mokykla',
    'student.grade': 'Klasė',
    'student.password': 'Slaptažodis',
    'student.confirmPassword': 'Patvirtinti slaptažodį',
    'student.createAccount': 'Sukurti paskyrą',
    'student.login.button': 'Prisijungti',
    'student.signup': 'Registruotis',
    
    // Dashboard
    'dashboard.myClasses': 'Mano pamokos',
    'dashboard.welcome': 'Sveiki sugrįžę',
    'dashboard.logout': 'Atsijungti',
    'dashboard.noClasses': 'Pamokų nesuplanuota',
    'dashboard.noClassesDescription': 'Jūsų mokytojas dar neįkėlė jokių pamokų tvarkaraščių. Patikrinkite vėliau!',
    'dashboard.upcomingClasses': 'Būsimos pamokos',
    'dashboard.giveFeedback': 'Pateikti atsiliepimą',
    'dashboard.giveAnonymousFeedback': 'Pateikti anoniminį atsiliepimą',
    
    // Weekly Summary
    'weekly.title': 'Savaitės santrauka',
    'weekly.subtitle': 'Kaip praėjo jūsų savaitė?',
    'weekly.question': 'Ar turite kokių nors rūpesčių mokykloje šią savaitę?',
    'weekly.emotional': 'Emociniai rūpesčiai',
    'weekly.academic': 'Akademiniai/darbo rūpesčiai',
    'weekly.submit': 'Pateikti savaitės santrauką',
    'weekly.success': 'Savaitės santrauka sėkmingai pateikta!',
    
    // Common
    'language': 'Kalba',
    'english': 'Anglų',
    'lithuanian': 'Lietuvių',
    'submit': 'Pateikti',
    'cancel': 'Atšaukti',
    'loading': 'Kraunama...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'lt'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'lt';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'lt') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
