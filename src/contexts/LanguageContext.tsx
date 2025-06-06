
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
    'features.dataAnalytics.description': 'Comprehensive analytics and reporting tools help schools track progress and make data-driven decisions for educational improvement.',
    
    // Teacher Dashboard
    'dashboard.teacher.title': 'Teacher Dashboard',
    'dashboard.teacher.welcome': 'Welcome back',
    'dashboard.teacher.addClass': 'Add Class',
    'dashboard.teacher.logout': 'Logout',
    'dashboard.teacher.loading': 'Loading dashboard...',
    'dashboard.teacher.totalClasses': 'Total Classes',
    'dashboard.teacher.totalFeedback': 'Total Feedback',
    'dashboard.teacher.avgUnderstanding': 'Avg Understanding',
    'dashboard.teacher.thisWeek': 'This Week',
    'dashboard.teacher.schedule': 'Your Class Schedule',
    'dashboard.teacher.scheduleDescription': 'Manage your upcoming classes and view student enrollment',
    'dashboard.teacher.noClasses': 'No classes scheduled yet. Add your first class!',
    'dashboard.teacher.studentFeedback': 'Student Feedback',
    'dashboard.teacher.feedbackDescription': 'Review and analyze feedback from your students',
    'dashboard.teacher.noFeedback': 'No feedback submissions yet. Students will see your scheduled classes and can submit feedback.',
    'dashboard.teacher.detailedFeedback': 'Detailed Feedback',
    'dashboard.teacher.understanding': 'Understanding',
    'dashboard.teacher.interestLevel': 'Interest Level',
    'dashboard.teacher.educationalGrowth': 'Educational Growth',
    'dashboard.teacher.emotionalState': 'Emotional State',
    'dashboard.teacher.whatWentWell': 'What Went Well',
    'dashboard.teacher.suggestions': 'Suggestions for Improvement',
    'dashboard.teacher.additionalComments': 'Additional Comments',
    'dashboard.teacher.close': 'Close',
    'dashboard.teacher.viewDetails': 'View Details',
    'dashboard.teacher.anonymous': 'Anonymous',
    
    // Teacher Login
    'login.teacher.title': 'Teacher Portal',
    'login.teacher.subtitle': 'Login to your account or create a new one',
    'login.teacher.login': 'Login',
    'login.teacher.signup': 'Sign Up',
    'login.teacher.email': 'Email',
    'login.teacher.password': 'Password',
    'login.teacher.fullName': 'Full Name',
    'login.teacher.school': 'School',
    'login.teacher.confirmPassword': 'Confirm Password',
    'login.teacher.createAccount': 'Create Account',
    'login.teacher.loggingIn': 'Logging in...',
    'login.teacher.creatingAccount': 'Creating account...',
    
    // Class Schedule Form
    'schedule.title': 'Schedule New Class',
    'schedule.subtitle': 'Add a new class to your schedule for students to review',
    'schedule.backToDashboard': 'Back to Dashboard',
    'schedule.classDetails': 'Class Details',
    'schedule.classDetailsDescription': 'Basic information about your lesson',
    'schedule.subject': 'Subject',
    'schedule.selectSubject': 'Select subject',
    'schedule.lessonTopic': 'Lesson Topic',
    'schedule.description': 'Description (Optional)',
    'schedule.scheduleDetails': 'Schedule Details',
    'schedule.scheduleDetailsDescription': 'When and where the class will take place',
    'schedule.date': 'Date',
    'schedule.time': 'Time',
    'schedule.duration': 'Duration (minutes)',
    'schedule.school': 'School',
    'schedule.classGrade': 'Class/Grade',
    'schedule.recurringOptions': 'Recurring Options',
    'schedule.recurringDescription': 'Set this class to repeat on a schedule',
    'schedule.makeRecurring': 'Make this class recurring',
    'schedule.repeats': 'Repeats',
    'schedule.occurrences': 'Number of occurrences',
    'schedule.endDate': 'End Date',
    'schedule.scheduleClass': 'Schedule Class',
    'schedule.scheduleRecurringClasses': 'Schedule Recurring Classes',
    
    // Common
    'common.minutes': 'minutes',
    'common.min': 'min',
    'common.unknown': 'Unknown'
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
    'features.dataAnalytics.description': 'Išsamūs analitikos ir ataskaitų įrankiai padeda mokykloms sekti pažangą ir priimti duomenimis pagrįstus sprendimus švietimo gerinimui.',
    
    // Teacher Dashboard
    'dashboard.teacher.title': 'Mokytojo valdymo skydas',
    'dashboard.teacher.welcome': 'Sveiki sugrįžę',
    'dashboard.teacher.addClass': 'Pridėti pamoką',
    'dashboard.teacher.logout': 'Atsijungti',
    'dashboard.teacher.loading': 'Kraunamas valdymo skydas...',
    'dashboard.teacher.totalClasses': 'Viso pamokų',
    'dashboard.teacher.totalFeedback': 'Viso atsiliepimų',
    'dashboard.teacher.avgUnderstanding': 'Vid. supratimas',
    'dashboard.teacher.thisWeek': 'Šią savaitę',
    'dashboard.teacher.schedule': 'Jūsų pamokų tvarkaraštis',
    'dashboard.teacher.scheduleDescription': 'Tvarkykite būsimas pamokas ir peržiūrėkite mokinių registraciją',
    'dashboard.teacher.noClasses': 'Pamokų dar nesuplanuota. Pridėkite pirmą pamoką!',
    'dashboard.teacher.studentFeedback': 'Mokinių atsiliepimai',
    'dashboard.teacher.feedbackDescription': 'Peržiūrėkite ir analizuokite mokinių atsiliepimus',
    'dashboard.teacher.noFeedback': 'Atsiliepimų dar nėra. Mokiniai matys jūsų suplanuotas pamokas ir galės pateikti atsiliepimus.',
    'dashboard.teacher.detailedFeedback': 'Išsamus atsiliepimas',
    'dashboard.teacher.understanding': 'Supratimas',
    'dashboard.teacher.interestLevel': 'Susidomėjimo lygis',
    'dashboard.teacher.educationalGrowth': 'Ugdymo augimas',
    'dashboard.teacher.emotionalState': 'Emocinė būsena',
    'dashboard.teacher.whatWentWell': 'Kas pavyko gerai',
    'dashboard.teacher.suggestions': 'Pasiūlymai pagerinimui',
    'dashboard.teacher.additionalComments': 'Papildomi komentarai',
    'dashboard.teacher.close': 'Uždaryti',
    'dashboard.teacher.viewDetails': 'Peržiūrėti detales',
    'dashboard.teacher.anonymous': 'Anoniminis',
    
    // Teacher Login
    'login.teacher.title': 'Mokytojo portalas',
    'login.teacher.subtitle': 'Prisijunkite prie savo paskyros arba sukurkite naują',
    'login.teacher.login': 'Prisijungti',
    'login.teacher.signup': 'Registruotis',
    'login.teacher.email': 'El. paštas',
    'login.teacher.password': 'Slaptažodis',
    'login.teacher.fullName': 'Pilnas vardas',
    'login.teacher.school': 'Mokykla',
    'login.teacher.confirmPassword': 'Patvirtinti slaptažodį',
    'login.teacher.createAccount': 'Sukurti paskyrą',
    'login.teacher.loggingIn': 'Prisijungiama...',
    'login.teacher.creatingAccount': 'Kuriama paskyra...',
    
    // Class Schedule Form
    'schedule.title': 'Suplanuoti naują pamoką',
    'schedule.subtitle': 'Pridėkite naują pamoką į savo tvarkaraštį, kad mokiniai galėtų vertinti',
    'schedule.backToDashboard': 'Grįžti į valdymo skydą',
    'schedule.classDetails': 'Pamokos detalės',
    'schedule.classDetailsDescription': 'Pagrindinė informacija apie jūsų pamoką',
    'schedule.subject': 'Dalykas',
    'schedule.selectSubject': 'Pasirinkite dalyką',
    'schedule.lessonTopic': 'Pamokos tema',
    'schedule.description': 'Aprašymas (neprivalomas)',
    'schedule.scheduleDetails': 'Tvarkaraščio detalės',
    'schedule.scheduleDetailsDescription': 'Kada ir kur vyks pamoka',
    'schedule.date': 'Data',
    'schedule.time': 'Laikas',
    'schedule.duration': 'Trukmė (minutės)',
    'schedule.school': 'Mokykla',
    'schedule.classGrade': 'Klasė/Kursas',
    'schedule.recurringOptions': 'Pasikartojimo parinktys',
    'schedule.recurringDescription': 'Nustatykite, kad ši pamoka kartotųsi pagal tvarkaraštį',
    'schedule.makeRecurring': 'Padaryti šią pamoką pasikartojančią',
    'schedule.repeats': 'Kartojasi',
    'schedule.occurrences': 'Pasikartojimų skaičius',
    'schedule.endDate': 'Pabaigos data',
    'schedule.scheduleClass': 'Suplanuoti pamoką',
    'schedule.scheduleRecurringClasses': 'Suplanuoti pasikartojančias pamokas',
    
    // Common
    'common.minutes': 'minutės',
    'common.min': 'min',
    'common.unknown': 'Nežinoma'
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
