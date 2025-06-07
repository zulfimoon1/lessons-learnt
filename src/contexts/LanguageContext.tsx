import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'lt';

interface Translations {
  [key: string]: any;
}

const translations: Record<Language, Translations> = {
  en: {
    'welcome.title': 'Transform Education with Student-Led Feedback',
    'welcome.subtitle': 'Empowering schools with real-time insights from students to create better learning environments and support mental health.',
    'tagline.studentLead': 'Because students know best what they need.',
    'auth.studentLogin': 'Student Login',
    'auth.teacherLogin': 'Teacher Login',
    'features.studentFeedback.title': 'Student Feedback',
    'features.studentFeedback.description': 'Real-time feedback collection from students to improve teaching methods and classroom environment.',
    'features.teacherInsights.title': 'Teacher Insights',
    'features.teacherInsights.description': 'Comprehensive analytics and reports to help teachers understand and respond to student needs.',
    'features.mentalHealth.title': 'Mental Health Support',
    'features.mentalHealth.description': 'Early detection and support systems for student mental health and wellbeing.',
    'platform.whySchools': 'Why Schools Choose Our Platform',
    'platform.whySchoolsSubtitle': 'Join thousands of educators already transforming their classrooms',
    'platform.studentInsights': 'Real-Time Student Insights',
    'platform.realTimeAnalytics': 'Real-Time Analytics',
    'platform.realTimeAnalyticsDesc': 'Get instant feedback on lesson effectiveness and student engagement levels.',
    'platform.mentalHealthMonitoring': 'Mental Health Monitoring',
    'platform.mentalHealthMonitoringDesc': 'Early warning systems to identify students who may need additional support.',
    'platform.privacySecurity': 'Privacy & Security',
    'platform.privacySecurityDesc': 'GDPR compliant with end-to-end encryption and secure data handling.',
    'platform.improvementPercent': '89%',
    'platform.improvementTitle': 'Improvement in Student Engagement',
    'platform.improvementDesc': 'Schools report significant improvements in classroom dynamics and student satisfaction.',
    'platform.readyToTransform': 'Ready to Transform Your School?',
    'platform.readyToTransformDesc': 'Book a personalized demo to see how our platform can benefit your institution.',
    'demo.exploreFeatures': 'Explore Our Features',
    'demo.liveVoiceover': 'Live Voiceover',
    'demo.subtitle': 'Experience our comprehensive educational feedback platform with live demonstrations',
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
    'demo.stats.coreFeatures': 'Core Features',
    'demo.stats.userTypes': 'User Types',
    'demo.stats.mentalHealthSupport': 'Mental Health Support',
    'demo.compliance.gdpr': 'GDPR Compliant',
    'demo.compliance.soc2': 'SOC 2 Type II',
    'demo.compliance.hipaa': 'HIPAA Ready',
    'demo.compliance.description': 'Fully compliant with international data protection standards',
    'compliance.privacyPolicy': 'Privacy Policy',
    'compliance.gdpr.title': 'GDPR Compliant',
    'compliance.gdpr.description': 'Full compliance with European data protection regulations',
    'compliance.soc2.title': 'SOC 2 Type II',
    'compliance.soc2.description': 'Rigorous security and availability controls audited annually',
    'compliance.hipaa.title': 'HIPAA Ready',
    'compliance.hipaa.description': 'Healthcare data protection standards for student mental health',
    'compliance.gdprCompliant': 'GDPR Compliant',
    'compliance.soc2': 'SOC 2 Type II',
    'compliance.hipaaReady': 'HIPAA Ready',
    'compliance.dataProtection': 'Data Protection',
    'compliance.cookiePolicy': 'Cookie Policy',
    'compliance.dataProcessing': 'Data Processing',
    'compliance.dataRetention': 'Data Retention',
    'compliance.rightToDelete': 'Right to Delete',
    'compliance.termsOfService': 'Terms of Service'
  },
  lt: {
    'welcome.title': 'Transformuokite švietimą su mokinių vedamu grįžtuoju ryšiu',
    'welcome.subtitle': 'Suteikiame mokykloms realaus laiko įžvalgas iš mokinių, kad sukurtume geresnę mokymosi aplinką ir palaikytume psichikos sveikatą.',
    'tagline.studentLead': 'Nes mokiniai geriausiai žino, ko jiems reikia.',
    'auth.studentLogin': 'Mokinio prisijungimas',
    'auth.teacherLogin': 'Mokytojo prisijungimas',
    'features.studentFeedback.title': 'Mokinių grįžtamasis ryšys',
    'features.studentFeedback.description': 'Realaus laiko grįžtamojo ryšio rinkimas iš mokinių, siekiant pagerinti mokymo metodus ir klasės aplinką.',
    'features.teacherInsights.title': 'Mokytojų įžvalgos',
    'features.teacherInsights.description': 'Išsamūs analitikos duomenys ir ataskaitos, padedančios mokytojams suprasti ir reaguoti į mokinių poreikius.',
    'features.mentalHealth.title': 'Psichikos sveikatos palaikymas',
    'features.mentalHealth.description': 'Ankstyvos diagnostikos ir palaikymo sistemos mokinių psichikos sveikatai ir gerovei.',
    'platform.whySchools': 'Kodėl mokyklos renkasi mūsų platformą',
    'platform.whySchoolsSubtitle': 'Prisijunkite prie tūkstančių pedagogų, jau transformuojančių savo klases',
    'platform.studentInsights': 'Realaus laiko mokinių įžvalgos',
    'platform.realTimeAnalytics': 'Realaus laiko analitika',
    'platform.realTimeAnalyticsDesc': 'Gaukite momentinį grįžtamąjį ryšį apie pamokos efektyvumą ir mokinių įsitraukimo lygį.',
    'platform.mentalHealthMonitoring': 'Psichikos sveikatos stebėjimas',
    'platform.mentalHealthMonitoringDesc': 'Ankstyvojo perspėjimo sistemos, skirtos identifikuoti mokinius, kuriems gali prireikti papildomos pagalbos.',
    'platform.privacySecurity': 'Privatumas ir saugumas',
    'platform.privacySecurityDesc': 'BDAR atitiktis su visapusiu šifravimu ir saugiu duomenų tvarkymu.',
    'platform.improvementPercent': '89%',
    'platform.improvementTitle': 'Pagerinimas mokinių įsitraukime',
    'platform.improvementDesc': 'Mokyklos praneša apie reikšmingus pagerinimus klasės dinamikoje ir mokinių pasitenkinime.',
    'platform.readyToTransform': 'Pasiruošę transformuoti savo mokyklą?',
    'platform.readyToTransformDesc': 'Užsisakykite personalizuotą demonstraciją, kad pamatytumėte, kaip mūsų platforma gali naudoti jūsų institucijai.',
    'demo.exploreFeatures': 'Tyrinėkite mūsų funkcijas',
    'demo.liveVoiceover': 'Tiesioginė garso takelis',
    'demo.subtitle': 'Patirkite mūsų išsamią švietimo grįžtamojo ryšio platformą su tiesioginėmis demonstracijomis',
    'demo.userType.student': 'Mokinio vaizdas',
    'demo.userType.teacher': 'Mokytojo vaizdas',
    'demo.userType.psychologist': 'Psichologo vaizdas',
    'demo.studentFeedback.title': 'Mokinių grįžtamojo ryšio rinkimas',
    'demo.studentFeedback.description': 'Paprastos, anoniminės grįžtamojo ryšio formos, kurias mokiniai gali užpildyti greitai.',
    'demo.studentFeedback.voiceover': 'Sužinokite, kaip mokiniai gali teikti tiesioginius, anoniminius atsiliepimus apie savo mokymosi patirtį realiu laiku.',
    'demo.teacherInsights.title': 'Mokytojų analitikos skydelis',
    'demo.teacherInsights.description': 'Išsamūs įžvalgos ir veiksmingi rekomendacijos pedagogams.',
    'demo.teacherInsights.voiceover': 'Atraskite, kaip mokytojai gali pasiekti išsamius analitikos duomenis ir įžvalgas, kad pagerintų savo mokymo metodus.',
    'demo.mentalHealth.title': 'Psichikos sveikatos palaikymas',
    'demo.mentalHealth.description': 'Ankstyvos diagnostikos ir intervencijos įrankiai mokinių gerovei.',
    'demo.mentalHealth.voiceover': 'Sužinokite, kaip mokiniai gali pasiekti psichikos sveikatos išteklius ir palaikymą, kai jiems to labiausiai reikia.',
    'demo.classManagement.title': 'Klasės valdymo įrankiai',
    'demo.classManagement.description': 'Supaprastinti įrankiai klasės veiklai ir mokinių pažangai valdyti.',
    'demo.classManagement.voiceover': 'Pažiūrėkite, kaip mokytojai gali efektyviai valdyti savo klases ir sekti mokinių pažangą realiu laiku.',
    'demo.liveChat.title': 'Tiesioginis bendravimas',
    'demo.liveChat.description': 'Realaus laiko bendravimas tarp mokinių, mokytojų ir palaikymo personalo.',
    'demo.liveChat.voiceover': 'Patirkite realaus laiko bendravimą tarp mokinių ir mokytojų, kad gautumėte momentinę pagalbą ir vadovavimą.',
    'demo.stats.coreFeatures': 'Pagrindinės funkcijos',
    'demo.stats.userTypes': 'Vartotojų tipai',
    'demo.stats.mentalHealthSupport': 'Psichikos sveikatos palaikymas',
    'demo.compliance.gdpr': 'BDAR atitiktis',
    'demo.compliance.soc2': 'SOC 2 Type II',
    'demo.compliance.hipaa': 'HIPAA paruoštas',
    'demo.compliance.description': 'Visiškai atitinka tarptautinius duomenų apsaugos standartus',
    'compliance.privacyPolicy': 'Privatumo politika',
    'compliance.gdpr.title': 'BDAR atitiktis',
    'compliance.gdpr.description': 'Pilnas atitikimas Europos duomenų apsaugos reglamentams',
    'compliance.soc2.title': 'SOC 2 Type II',
    'compliance.soc2.description': 'Griežti saugumo ir prieinamumo kontrolės mechanizmai, audituojami kasmet',
    'compliance.hipaa.title': 'HIPAA paruoštas',
    'compliance.hipaa.description': 'Sveikatos duomenų apsaugos standartai mokinių psichikos sveikatai',
    'compliance.gdprCompliant': 'BDAR atitiktis',
    'compliance.soc2': 'SOC 2 Type II',
    'compliance.hipaaReady': 'HIPAA paruoštas',
    'compliance.dataProtection': 'Duomenų apsauga',
    'compliance.cookiePolicy': 'Slapukų politika',
    'compliance.dataProcessing': 'Duomenų apdorojimas',
    'compliance.dataRetention': 'Duomenų saugojimas',
    'compliance.rightToDelete': 'Teisė ištrinti',
    'compliance.termsOfService': 'Paslaugų teikimo sąlygos'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

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
    
    console.log(`Translation for "${key}":`, value || 'NOT FOUND');
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
        console.log(`Fallback translation for "${key}"`);
        // ... keep existing code (fallback translations object)
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
          'demo.liveChat.voiceover': 'Experience real-time communication between students and teachers for immediate support and guidance.'
        };
        
        return fallbackTranslations[key] || key;
      }
    };
  }
  return context;
};
