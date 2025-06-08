
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'lt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.login': 'Login',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.registerNow': 'Register Now',
    'auth.chooseRegistrationType': 'Choose Registration Type',
    'auth.chooseRegistrationDesc': 'Are you a student or a teacher?',
    'auth.registerAsStudent': 'Register as Student',
    'auth.registerAsTeacher': 'Register as Teacher',
    'auth.studentLogin': 'Student Login',
    'auth.teacherLogin': 'Teacher Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.name': 'Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.school': 'School',
    'auth.grade': 'Grade',
    'auth.role': 'Role',
    'auth.createAccount': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signInHere': 'Sign in here',
    'auth.signUpHere': 'Sign up here',

    // Welcome
    'welcome.title': 'Empowering Education Through Student Voice',
    'welcome.subtitle': 'A revolutionary platform that puts student feedback at the heart of educational excellence',

    // Tagline
    'tagline.studentLead': 'Where every student voice shapes tomorrow\'s education',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.update': 'Update',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.analytics': 'Analytics',
    'dashboard.reports': 'Reports',
    'dashboard.settings': 'Settings',
    'dashboard.profile': 'Profile',
    'dashboard.notifications': 'Notifications',
    'dashboard.help': 'Help',
    'dashboard.feedback': 'Feedback',
    'dashboard.grade': 'Grade',
    'dashboard.upcomingClasses': 'Upcoming Classes',
    'dashboard.weeklySummary': 'Weekly Summary',
    'dashboard.mentalHealthSupport': 'Mental Health Support',
    'dashboard.scheduledClasses': 'Your scheduled classes for',
    'dashboard.noClasses': 'No upcoming classes scheduled',
    'dashboard.noPsychologists': 'No school psychologists available at this time',
    'dashboard.contactAdmin': 'Please contact your school administrator for assistance',

    // Classes
    'class.upcomingClasses': 'Upcoming Classes',
    'class.duration': 'minutes',

    // Features
    'features.studentFeedback.title': 'Real-time Student Feedback',
    'features.studentFeedback.description': 'Capture authentic student voices with our intuitive feedback system that encourages honest, constructive input.',
    'features.teacherInsights.title': 'Teacher Insights',
    'features.teacherInsights.description': 'Transform feedback into actionable insights that help teachers improve their methods and connect better with students.',
    'features.mentalHealth.title': 'Mental Health Focus',
    'features.mentalHealth.description': 'Monitor student wellbeing with integrated mental health tracking and support resources.',

    // Platform
    'platform.whySchools': 'Why Schools Choose Lessons Learnt',
    'platform.whySchoolsSubtitle': 'Transform your educational environment with data-driven insights and student-centered approaches',
    'platform.studentInsights': 'Unlock Student Insights',
    'platform.realTimeAnalytics': 'Real-time Analytics',
    'platform.realTimeAnalyticsDesc': 'Get instant insights into student engagement, learning progress, and classroom dynamics',
    'platform.mentalHealthMonitoring': 'Mental Health Monitoring',
    'platform.mentalHealthMonitoringDesc': 'Early detection of mental health concerns with integrated support pathways',
    'platform.privacySecurity': 'Privacy & Security',
    'platform.privacySecurityDesc': 'Enterprise-grade security with full GDPR compliance and student data protection',
    'platform.improvementPercent': '85%',
    'platform.improvementTitle': 'Student Engagement Improvement',
    'platform.improvementDesc': 'Schools report significant increases in student participation and learning outcomes',
    'platform.readyToTransform': 'Ready to Transform Your School?',
    'platform.readyToTransformDesc': 'Join hundreds of schools already using Lessons Learnt to create better learning environments',

    // Admin
    'admin.welcome': 'Welcome',
    'admin.manageTeachers': 'Manage Teachers',
    'admin.viewReports': 'View Reports',
    'admin.schoolSettings': 'School Settings',
    'admin.totalTeachers': 'Total Teachers',
    'admin.totalStudents': 'Total Students',
    'admin.activeFeedback': 'Active Feedback',
    'admin.inviteTeacher': 'Invite Teacher',
    'admin.teacherManagement': 'Teacher Management',
    'admin.recentFeedback': 'Recent Feedback',
    'admin.performanceOverview': 'Performance Overview',

    // Teacher
    'teacher.myClasses': 'My Classes',
    'teacher.studentFeedback': 'Student Feedback',
    'teacher.classSchedule': 'Class Schedule',
    'teacher.performanceAnalytics': 'Performance Analytics',
    'teacher.mentalHealthAlerts': 'Mental Health Alerts',
    'teacher.classManagement': 'Class Management',
    'teacher.addNewClass': 'Add New Class',
    'teacher.viewFeedback': 'View Feedback',
    'teacher.scheduleClass': 'Schedule Class',
    'teacher.bulkUpload': 'Bulk Upload',
    'teacher.noClasses': 'No classes scheduled',
    'teacher.createFirstClass': 'Create your first class to get started',

    // Student
    'student.accessMentalHealthResources': 'Access mental health resources and support available at {school}',
    'student.failedToLoadClasses': 'Failed to load upcoming classes',
    'student.failedToLoadPsychologists': 'Failed to load school psychologists',
    'student.defaultName': 'Student',

    // Language
    'language.english': 'English',
    'language.lithuanian': 'Lithuanian',

    // Feedback
    'feedback.submitFeedback': 'Submit Feedback',
    'feedback.lessonFeedback': 'Lesson Feedback',
    'feedback.howWasLesson': 'How was your lesson?',
    'feedback.selectSubject': 'Select Subject',
    'feedback.selectTeacher': 'Select Teacher',
    'feedback.rating': 'Rating',
    'feedback.comments': 'Comments',
    'feedback.submitSuccess': 'Feedback submitted successfully!',
    'feedback.submitError': 'Failed to submit feedback',

    // Mental Health
    'mentalHealth.support': 'Mental Health Support',
    'mentalHealth.resources': 'Resources',
    'mentalHealth.counseling': 'Counseling',
    'mentalHealth.emergency': 'Emergency Contacts',

    // Reports
    'reports.weeklyReport': 'Weekly Report',
    'reports.monthlyReport': 'Monthly Report',
    'reports.classPerformance': 'Class Performance',
    'reports.studentEngagement': 'Student Engagement',

    // Settings
    'settings.general': 'General',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.account': 'Account',
  },
  lt: {
    // Navigation
    'nav.login': 'Prisijungti',
    
    // Authentication
    'auth.login': 'Prisijungti',
    'auth.register': 'Registruotis',
    'auth.registerNow': 'Registruotis Dabar',
    'auth.chooseRegistrationType': 'Pasirinkite Registracijos Tipą',
    'auth.chooseRegistrationDesc': 'Ar esate mokinys ar mokytojas?',
    'auth.registerAsStudent': 'Registruotis kaip Mokinys',
    'auth.registerAsTeacher': 'Registruotis kaip Mokytojas',
    'auth.studentLogin': 'Mokinio Prisijungimas',
    'auth.teacherLogin': 'Mokytojo Prisijungimas',
    'auth.signup': 'Registracija',
    'auth.logout': 'Atsijungti',
    'auth.name': 'Vardas',
    'auth.email': 'El. paštas',
    'auth.password': 'Slaptažodis',
    'auth.school': 'Mokykla',
    'auth.grade': 'Klasė',
    'auth.role': 'Vaidmuo',
    'auth.createAccount': 'Sukurti Paskyrą',
    'auth.alreadyHaveAccount': 'Jau turite paskyrą?',
    'auth.dontHaveAccount': 'Neturite paskyros?',
    'auth.signInHere': 'Prisijunkite čia',
    'auth.signUpHere': 'Registruokitės čia',

    // Welcome
    'welcome.title': 'Stiprinimas Švietimo Per Mokinio Balsą',
    'welcome.subtitle': 'Revoliucinė platforma, kuri padeda mokinio atsiliepimams formuoti švietimo tobulumą',

    // Tagline
    'tagline.studentLead': 'Kur kiekvienas mokinio balsas formuoja rytojaus švietimą',

    // Common
    'common.loading': 'Kraunama...',
    'common.error': 'Klaida',
    'common.success': 'Sėkmė',
    'common.cancel': 'Atšaukti',
    'common.save': 'Išsaugoti',
    'common.delete': 'Ištrinti',
    'common.edit': 'Redaguoti',
    'common.view': 'Peržiūrėti',
    'common.close': 'Uždaryti',
    'common.submit': 'Pateikti',
    'common.search': 'Ieškoti',
    'common.filter': 'Filtruoti',
    'common.export': 'Eksportuoti',
    'common.import': 'Importuoti',
    'common.refresh': 'Atnaujinti',
    'common.add': 'Pridėti',
    'common.remove': 'Pašalinti',
    'common.update': 'Atnaujinti',

    // Dashboard
    'dashboard.title': 'Valdymo skydas',
    'dashboard.overview': 'Apžvalga',
    'dashboard.analytics': 'Analitika',
    'dashboard.reports': 'Ataskaitos',
    'dashboard.settings': 'Nustatymai',
    'dashboard.profile': 'Profilis',
    'dashboard.notifications': 'Pranešimai',
    'dashboard.help': 'Pagalba',
    'dashboard.feedback': 'Atsiliepimai',
    'dashboard.grade': 'Klasė',
    'dashboard.upcomingClasses': 'Artėjančios Pamokos',
    'dashboard.weeklySummary': 'Savaitės Santrauka',
    'dashboard.mentalHealthSupport': 'Psichikos Sveikatos Palaikymas',
    'dashboard.scheduledClasses': 'Jūsų suplanuotos pamokos',
    'dashboard.noClasses': 'Nėra suplanuotų artėjančių pamokų',
    'dashboard.noPsychologists': 'Šiuo metu nėra mokyklos psichologų',
    'dashboard.contactAdmin': 'Kreipkitės į mokyklos administratorių pagalbos',

    // Classes
    'class.upcomingClasses': 'Artėjančios Pamokos',
    'class.duration': 'minutės',

    // Features
    'features.studentFeedback.title': 'Realaus Laiko Mokinio Atsiliepimai',
    'features.studentFeedback.description': 'Užfiksuokite autentiškus mokinių balsus su mūsų intuityvia atsiliepimų sistema, kuri skatina sąžiningus, konstruktyvius atsiliepimus.',
    'features.teacherInsights.title': 'Mokytojo Įžvalgos',
    'features.teacherInsights.description': 'Paverčiame atsiliepimus veiksmingomis įžvalgomis, kurios padeda mokytojams tobulinti savo metodus ir geriau susisiekti su mokiniais.',
    'features.mentalHealth.title': 'Psichikos Sveikatos Fokusas',
    'features.mentalHealth.description': 'Stebėkite mokinių gerovę su integruotu psichikos sveikatos sekimu ir palaikymo ištekliais.',

    // Platform
    'platform.whySchools': 'Kodėl Mokyklos Renkasi Lessons Learnt',
    'platform.whySchoolsSubtitle': 'Transformuokite savo švietimo aplinką su duomenimis grįstomis įžvalgomis ir mokinio-orientuotais metodais',
    'platform.studentInsights': 'Atskleiskite Mokinio Įžvalgas',
    'platform.realTimeAnalytics': 'Realaus Laiko Analitika',
    'platform.realTimeAnalyticsDesc': 'Gaukite tiesioginius įžvalgas apie mokinių įsitraukimą, mokymosi pažangą ir klasės dinamiką',
    'platform.mentalHealthMonitoring': 'Psichikos Sveikatos Stebėjimas',
    'platform.mentalHealthMonitoringDesc': 'Ankstyvasis psichikos sveikatos problemų aptikimas su integruotais palaikymo keliais',
    'platform.privacySecurity': 'Privatumas ir Saugumas',
    'platform.privacySecurityDesc': 'Įmonės lygio saugumas su pilnu GDPR atitikimu ir mokinių duomenų apsauga',
    'platform.improvementPercent': '85%',
    'platform.improvementTitle': 'Mokinio Įsitraukimo Pagerėjimas',
    'platform.improvementDesc': 'Mokyklos praneša apie reikšmingus mokinių dalyvavimo ir mokymosi rezultatų padidėjimus',
    'platform.readyToTransform': 'Pasiruošę Transformuoti Savo Mokyklą?',
    'platform.readyToTransformDesc': 'Prisijunkite prie šimtų mokyklų, kurios jau naudoja Lessons Learnt kuriant geresnes mokymosi aplinkas',

    // Admin
    'admin.welcome': 'Sveiki',
    'admin.manageTeachers': 'Valdyti Mokytojus',
    'admin.viewReports': 'Peržiūrėti Ataskaitas',
    'admin.schoolSettings': 'Mokyklos Nustatymai',
    'admin.totalTeachers': 'Iš viso Mokytojų',
    'admin.totalStudents': 'Iš viso Mokinių',
    'admin.activeFeedback': 'Aktyvūs Atsiliepimai',
    'admin.inviteTeacher': 'Pakviesti Mokytoją',
    'admin.teacherManagement': 'Mokytojų Valdymas',
    'admin.recentFeedback': 'Paskutiniai Atsiliepimai',
    'admin.performanceOverview': 'Našumo Apžvalga',

    // Teacher
    'teacher.myClasses': 'Mano Klasės',
    'teacher.studentFeedback': 'Mokinių Atsiliepimai',
    'teacher.classSchedule': 'Klasės Tvarkaraštis',
    'teacher.performanceAnalytics': 'Našumo Analitika',
    'teacher.mentalHealthAlerts': 'Psichikos Sveikatos Įspėjimai',
    'teacher.classManagement': 'Klasės Valdymas',
    'teacher.addNewClass': 'Pridėti Naują Klasę',
    'teacher.viewFeedback': 'Peržiūrėti Atsiliepimus',
    'teacher.scheduleClass': 'Suplanuoti Pamoką',
    'teacher.bulkUpload': 'Masinis Įkėlimas',
    'teacher.noClasses': 'Nėra suplanuotų klasių',
    'teacher.createFirstClass': 'Sukurkite savo pirmą klasę, kad pradėtumėte',

    // Student
    'student.accessMentalHealthResources': 'Prieiga prie psichikos sveikatos išteklių ir palaikymo, prieinamo {school}',
    'student.failedToLoadClasses': 'Nepavyko įkelti artėjančių pamokų',
    'student.failedToLoadPsychologists': 'Nepavyko įkelti mokyklos psichologų',
    'student.defaultName': 'Mokinys',

    // Language
    'language.english': 'Anglų',
    'language.lithuanian': 'Lietuvių',

    // Feedback
    'feedback.submitFeedback': 'Pateikti Atsiliepimą',
    'feedback.lessonFeedback': 'Pamokos Atsiliepimas',
    'feedback.howWasLesson': 'Kaip buvo jūsų pamoka?',
    'feedback.selectSubject': 'Pasirinkite Dalyką',
    'feedback.selectTeacher': 'Pasirinkite Mokytoją',
    'feedback.rating': 'Įvertinimas',
    'feedback.comments': 'Komentarai',
    'feedback.submitSuccess': 'Atsiliepimas sėkmingai pateiktas!',
    'feedback.submitError': 'Nepavyko pateikti atsiliepimo',

    // Mental Health
    'mentalHealth.support': 'Psichikos Sveikatos Palaikymas',
    'mentalHealth.resources': 'Ištekliai',
    'mentalHealth.counseling': 'Konsultavimas',
    'mentalHealth.emergency': 'Skubūs Kontaktai',

    // Reports
    'reports.weeklyReport': 'Savaitės Ataskaita',
    'reports.monthlyReport': 'Mėnesio Ataskaita',
    'reports.classPerformance': 'Klasės Našumas',
    'reports.studentEngagement': 'Mokinio Įsitraukimas',

    // Settings
    'settings.general': 'Bendri',
    'settings.notifications': 'Pranešimai',
    'settings.privacy': 'Privatumas',
    'settings.account': 'Paskyra',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
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
