
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
    
    return value || key;
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
          'auth.teacherLogin': 'Teacher Login',
          'demo.exploreFeatures': 'Explore Our Features',
          'demo.liveVoiceover': 'Live Voiceover',
          'demo.userType.student': 'Student View',
          'demo.userType.teacher': 'Teacher View',
          'demo.userType.psychologist': 'Psychologist View',
          'demo.studentFeedback.title': 'Student Feedback Collection',
          'demo.studentFeedback.description': 'Simple, anonymous feedback forms that students can complete quickly.',
          'demo.studentFeedback.voiceover': 'Discover how students can provide direct, anonymous feedback about their learning experience in real-time.',
          'demo.teacherInsights.title': 'Teacher Analytics Dashboard',
          'demo.teacherInsights.description': 'Comprehensive insights and actionable recommendations for educators.',
          'demo.teacherInsights.voiceover': 'Explore how teachers can access comprehensive analytics and insights to improve their teaching methods.',
          'demo.mentalHealth.title': 'Mental Health Support',
          'demo.mentalHealth.description': 'Early detection and intervention tools for student wellbeing.',
          'demo.mentalHealth.voiceover': 'Learn how students can access mental health resources and support when they need it most.',
          'demo.classManagement.title': 'Class Management Tools',
          'demo.classManagement.description': 'Streamlined tools for managing classroom activities and student progress.',
          'demo.classManagement.voiceover': 'See how teachers can efficiently manage their classes and track student progress in real-time.',
          'demo.liveChat.title': 'Live Communication',
          'demo.liveChat.description': 'Real-time communication between students, teachers, and support staff.',
          'demo.liveChat.voiceover': 'Experience real-time communication between students and teachers for immediate support and guidance.',
          'dashboard.teacherOverview': 'Teacher Dashboard',
          'dashboard.subscribeNow': 'Subscribe Now',
          'admin.welcome': 'Welcome',
          'auth.logout': 'Logout',
          'admin.subscription': 'Subscription',
          'teacher.subscriptionNeeded': 'A subscription is required for',
          'pricing.processing': 'Processing...',
          'login.teacher.role': 'Teacher',
          'auth.school': 'School',
          'pricing.securePayment': 'Active Plan',
          'class.schedule': 'Class Schedule',
          'upload.bulkUpload': 'Bulk Upload',
          'articles.mentalHealth': 'Mental Health Articles',
          'teacher.classSchedulingAvailable': 'Class scheduling is available with an active subscription.',
          'teacher.subscribeToContinue': 'Subscribe to Continue',
          'upload.subscriptionRequired': 'Subscription required for bulk upload.',
          'articles.subscriptionRequired': 'Subscription required for mental health articles.',
          'common.loading': 'Loading...',
          'common.success': 'Success',
          'common.error': 'Error',
          'upload.uploadComplete': 'Upload completed successfully',
          'admin.title': 'Admin Dashboard',
          'admin.logout': 'Logout',
          'admin.subscribe': 'Subscribe Now',
          'admin.stats.teachers': 'Total Teachers',
          'admin.teachers.title': 'School Teachers',
          'admin.teachers.description': 'Manage your school teachers and their roles.',
          'admin.teachers.empty': 'No teachers found.',
          'admin.loading': 'Loading...',
          'admin.error.title': 'Error',
          'admin.error.description': 'Failed to load data. Please try again.'
        };
        
        return fallbackTranslations[key] || key;
      }
    };
  }
  return context;
};
