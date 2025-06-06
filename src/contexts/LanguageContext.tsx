import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.studentLogin': 'Student Login',
    'auth.teacherLogin': 'Teacher Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Name',
    'auth.school': 'School',
    'auth.signUp': 'Sign Up',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.forgotPassword': 'Forgot Password?',

    // Teacher Login Page
    'login.teacher.title': 'Teacher & Admin Portal',
    'login.teacher.subtitle': 'Access your classroom dashboard and school management tools',
    'login.teacher.login': 'Login',
    'login.teacher.signup': 'Sign Up',
    'login.teacher.email': 'Email',
    'login.teacher.password': 'Password',
    'login.teacher.fullName': 'Full Name',
    'login.teacher.school': 'School Name',
    'login.teacher.role': 'Role',
    'login.teacher.roleTeacher': 'Teacher',
    'login.teacher.roleAdmin': 'School Administrator',
    'login.teacher.adminHint': 'School Admins can manage teachers and view all feedback',
    'login.teacher.confirmPassword': 'Confirm Password',
    'login.teacher.createAccount': 'Create Account',
    'login.teacher.loggingIn': 'Logging in...',
    'login.teacher.creatingAccount': 'Creating account...',
    
    // Welcome messages
    'welcome.title': 'Transform Your School with Real-Time Feedback',
    'welcome.subtitle': 'Empower teachers with student insights and help administrators monitor school-wide performance',
    
    // Features
    'features.studentFeedback.title': 'Student Feedback',
    'features.studentFeedback.description': 'Students can easily provide feedback on their learning experience',
    'features.teacherInsights.title': 'Teacher Insights',
    'features.teacherInsights.description': 'Teachers get real-time insights to improve their teaching methods',
    'features.mentalHealth.title': 'Mental Health',
    'features.mentalHealth.description': 'Early detection and support for student well-being and mental health concerns',
    'features.dataAnalytics.title': 'Data Analytics',
    'features.dataAnalytics.description': 'Comprehensive analytics to track student progress and well-being',
    
    // Platform overview
    'platform.whySchools': 'Why Schools Choose Lessons Learnt',
    'platform.whySchoolsSubtitle': 'Our platform empowers schools with actionable insights to create better learning environments, support student well-being, and drive educational excellence through data-driven decisions.',
    'platform.studentInsights': 'Comprehensive Student Insights',
    'platform.realTimeAnalytics': 'Real-Time Analytics',
    'platform.realTimeAnalyticsDesc': 'Track student engagement, learning progress, and classroom dynamics with instant feedback collection and analysis.',
    'platform.mentalHealthMonitoring': 'Mental Health Monitoring',
    'platform.mentalHealthMonitoringDesc': 'Early detection of student well-being concerns through intelligent content analysis and immediate alerts to school counselors.',
    'platform.privacySecurity': 'Privacy & Security',
    'platform.privacySecurityDesc': 'Enterprise-grade security ensures student data protection while maintaining compliance with educational privacy standards.',
    'platform.improvementPercent': '85%',
    'platform.improvementTitle': 'Improvement in Student Engagement',
    'platform.improvementDesc': 'Schools using our platform report significant increases in student participation and learning outcomes.',
    'platform.readyToTransform': 'Ready to Transform Your School?',
    'platform.readyToTransformDesc': 'Join hundreds of schools already using Lessons Learnt to create better learning environments.',
    
    // Dashboard
    'dashboard.overview': 'Overview',
    'dashboard.classes': 'Classes',
    'dashboard.feedback': 'Feedback',
    'dashboard.analytics': 'Analytics',
    'dashboard.settings': 'Settings',
    'dashboard.schoolOverview': 'School Overview',
    'dashboard.teacherOverview': 'Teacher Overview',
    'dashboard.totalTeachers': 'Total Teachers',
    'dashboard.totalClasses': 'Total Classes',
    'dashboard.avgSatisfaction': 'Avg Satisfaction',
    'dashboard.feedbackReceived': 'Feedback Received',
    'dashboard.recentFeedback': 'Recent Feedback',
    'dashboard.subscribeNow': 'Subscribe Now',
    'dashboard.manageSubscription': 'Manage Subscription',
    
    // Class management
    'class.create': 'Create Class',
    'class.edit': 'Edit Class',
    'class.delete': 'Delete Class',
    'class.name': 'Class Name',
    'class.subject': 'Subject',
    'class.schedule': 'Schedule',
    'class.students': 'Students',
    
    // Feedback
    'feedback.understanding': 'Understanding',
    'feedback.interest': 'Interest',
    'feedback.growth': 'Growth',
    'feedback.submit': 'Submit Feedback',
    'feedback.average': 'Average',
    'feedback.excellent': 'Excellent',
    'feedback.good': 'Good',
    'feedback.fair': 'Fair',
    'feedback.poor': 'Poor',

    // Admin Dashboard
    'admin.title': 'School Admin Dashboard',
    'admin.welcome': 'Welcome',
    'admin.logout': 'Logout',
    'admin.loading': 'Loading dashboard...',
    'admin.subscription': 'Subscription',
    'admin.subscribe': 'Subscribe Now',
    'admin.stats.teachers': 'Total Teachers',
    'admin.stats.feedback': 'Total Feedback',
    'admin.teachers.title': 'Teachers',
    'admin.teachers.description': 'Manage teachers at your school',
    'admin.teachers.empty': 'No teachers found',
    'admin.feedback.title': 'Feedback Summary',
    'admin.feedback.description': 'Overview of student feedback per teacher and class',
    'admin.feedback.teacher': 'Teacher',
    'admin.feedback.subject': 'Subject',
    'admin.feedback.date': 'Date',
    'admin.feedback.scores': 'Scores',
    'admin.feedback.understanding': 'Understanding',
    'admin.feedback.interest': 'Interest',
    'admin.feedback.growth': 'Growth',
    'admin.feedback.responses': 'responses',
    'admin.feedback.empty': 'No feedback data available yet',
    'admin.error.title': 'Error loading data',
    'admin.error.description': 'Failed to load dashboard data',

    // Pricing Page
    'pricing.title': 'Subscription Pricing',
    'pricing.backToDashboard': 'Back to Dashboard',
    'pricing.welcome': 'Welcome',
    'pricing.choosePlan': 'Choose Your School Plan',
    'pricing.subtitle': 'Simple, transparent pricing for your entire school',
    'pricing.school': 'School',
    'pricing.configurePlan': 'Configure Your Plan',
    'pricing.configureDesc': 'Customize your subscription based on the number of teachers',
    'pricing.numberOfTeachers': 'Number of Teachers',
    'pricing.teacherDesc': 'Each teacher can create unlimited classes and collect student feedback',
    'pricing.discountCode': 'Discount Code (Optional)',
    'pricing.enterDiscount': 'Enter discount code',
    'pricing.validating': 'Validating...',
    'pricing.apply': 'Apply',
    'pricing.discountAppliedShort': 'discount applied!',
    'pricing.whatsIncluded': "What's included",
    'pricing.unlimitedClasses': 'Unlimited class schedules',
    'pricing.feedbackCollection': 'Student feedback collection',
    'pricing.analytics': 'Analytics and reporting',
    'pricing.mentalHealth': 'Mental health monitoring',
    'pricing.multiLanguage': 'Multi-language support',
    'pricing.orderSummary': 'Order Summary',
    'pricing.reviewDetails': 'Review your subscription details',
    'pricing.teachers': 'Teachers',
    'pricing.each': 'each',
    'pricing.subtotal': 'Subtotal',
    'pricing.discount': 'Discount',
    'pricing.totalMonthly': 'Total (Monthly)',
    'pricing.billing': 'Billing',
    'pricing.billingDesc': 'You will be charged ${amount} monthly. You can cancel or modify your subscription at any time.',
    'pricing.processing': 'Processing...',
    'pricing.subscribeFor': 'Subscribe for',
    'pricing.securePayment': 'Secure payment powered by Stripe. Cancel anytime.',
    'pricing.discountApplied': 'Discount Applied!',
    'pricing.discountAppliedDesc': '{percent}% discount has been applied to your order.',
    'pricing.invalidDiscount': 'Invalid Discount Code',
    'pricing.invalidDiscountDesc': 'The discount code you entered is not valid.',
    'pricing.paymentError': 'Payment Error',
    'pricing.paymentErrorDesc': 'Failed to create subscription. Please try again.',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Tagline
    'tagline.studentLead': 'When students lead, teachers succeed',
  },
  lt: {
    // Navigation
    'nav.home': 'Pagrindinis',
    'nav.about': 'Apie mus',
    'nav.contact': 'Kontaktai',
    
    // Authentication
    'auth.login': 'Prisijungti',
    'auth.logout': 'Atsijungti',
    'auth.studentLogin': 'Mokinių prisijungimas',
    'auth.teacherLogin': 'Mokytojų prisijungimas',
    'auth.email': 'El. paštas',
    'auth.password': 'Slaptažodis',
    'auth.confirmPassword': 'Patvirtinti slaptažodį',
    'auth.name': 'Vardas',
    'auth.school': 'Mokykla',
    'auth.signUp': 'Registruotis',
    'auth.alreadyHaveAccount': 'Jau turite paskyrą?',
    'auth.dontHaveAccount': 'Neturite paskyros?',
    'auth.forgotPassword': 'Pamiršote slaptažodį?',

    // Teacher Login Page
    'login.teacher.title': 'Mokytojų ir administratorių portalas',
    'login.teacher.subtitle': 'Prieiga prie jūsų klasės skydelio ir mokyklos valdymo įrankių',
    'login.teacher.login': 'Prisijungti',
    'login.teacher.signup': 'Registruotis',
    'login.teacher.email': 'El. paštas',
    'login.teacher.password': 'Slaptažodis',
    'login.teacher.fullName': 'Pilnas vardas',
    'login.teacher.school': 'Mokyklos pavadinimas',
    'login.teacher.role': 'Rolė',
    'login.teacher.roleTeacher': 'Mokytojas',
    'login.teacher.roleAdmin': 'Mokyklos administratorius',
    'login.teacher.adminHint': 'Mokyklos administratoriai gali valdyti mokytojus ir peržiūrėti visą grįžtamąjį ryšį',
    'login.teacher.confirmPassword': 'Patvirtinti slaptažodį',
    'login.teacher.createAccount': 'Sukurti paskyrą',
    'login.teacher.loggingIn': 'Prisijungiama...',
    'login.teacher.creatingAccount': 'Kuriama paskyra...',
    
    // Welcome messages
    'welcome.title': 'Transformuokite savo mokyklą su realaus laiko grįžtamuoju ryšiu',
    'welcome.subtitle': 'Įgalinkite mokytojus mokinių įžvalgomis ir padėkite administratoriams stebėti visos mokyklos veiklą',
    
    // Features
    'features.studentFeedback.title': 'Mokinių grįžtamasis ryšys',
    'features.studentFeedback.description': 'Mokiniai gali lengvai pateikti grįžtamąjį ryšį apie savo mokymosi patirtį',
    'features.teacherInsights.title': 'Mokytojų įžvalgos',
    'features.teacherInsights.description': 'Mokytojai gauna realaus laiko įžvalgas, kad pagerintų savo mokymo metodus',
    'features.mentalHealth.title': 'Psichikos sveikata',
    'features.mentalHealth.description': 'Ankstyvos mokinių gerovės ir psichikos sveikatos problemų aptikimas ir pagalba',
    'features.dataAnalytics.title': 'Duomenų analitika',
    'features.dataAnalytics.description': 'Išsami analitika mokinių pažangai ir gerovei sekti',
    
    // Platform overview
    'platform.whySchools': 'Kodėl mokyklos renkasi Lessons Learnt',
    'platform.whySchoolsSubtitle': 'Mūsų platforma įgalina mokyklas veiksmingomis įžvalgomis kurti geresnę mokymosi aplinką, palaikyti mokinių gerovę ir skatinti švietimo puikumą per duomenimis grįstus sprendimus.',
    'platform.studentInsights': 'Išsamios mokinių įžvalgos',
    'platform.realTimeAnalytics': 'Realaus laiko analitika',
    'platform.realTimeAnalyticsDesc': 'Sekite mokinių įsitraukimą, mokymosi pažangą ir klasės dinamiką su momentaliu grįžtamojo ryšio rinkiniu ir analize.',
    'platform.mentalHealthMonitoring': 'Psichikos sveikatos stebėjimas',
    'platform.mentalHealthMonitoringDesc': 'Ankstyvos mokinių gerovės problemų aptikimas per protingą turinio analizę ir momentalius įspėjimus mokyklos konsultantams.',
    'platform.privacySecurity': 'Privatumas ir saugumas',
    'platform.privacySecurityDesc': 'Įmonių lygio saugumas užtikrina mokinių duomenų apsaugą ir atitikimą švietimo privatumo standartams.',
    'platform.improvementPercent': '85%',
    'platform.improvementTitle': 'Pagerėjimas mokinių įsitraukime',
    'platform.improvementDesc': 'Mokyklos, naudojančios mūsų platformą, praneša apie žymų mokinių dalyvavimo ir mokymosi rezultatų padidėjimą.',
    'platform.readyToTransform': 'Pasiruošę transformuoti savo mokyklą?',
    'platform.readyToTransformDesc': 'Prisijunkite prie šimtų mokyklų, jau naudojančių Lessons Learnt geresnei mokymosi aplinkai kurti.',
    
    // Dashboard
    'dashboard.overview': 'Apžvalga',
    'dashboard.classes': 'Klasės',
    'dashboard.feedback': 'Grįžtamasis ryšys',
    'dashboard.analytics': 'Analitika',
    'dashboard.settings': 'Nustatymai',
    'dashboard.schoolOverview': 'Mokyklos apžvalga',
    'dashboard.teacherOverview': 'Mokytojo apžvalga',
    'dashboard.totalTeachers': 'Iš viso mokytojų',
    'dashboard.totalClasses': 'Iš viso klasių',
    'dashboard.avgSatisfaction': 'Vid. pasitenkinimas',
    'dashboard.feedbackReceived': 'Gautas grįžtamasis ryšys',
    'dashboard.recentFeedback': 'Naujausi atsiliepimai',
    'dashboard.subscribeNow': 'Prenumeruoti dabar',
    'dashboard.manageSubscription': 'Valdyti prenumeratą',
    
    // Class management
    'class.create': 'Sukurti klasę',
    'class.edit': 'Redaguoti klasę',
    'class.delete': 'Ištrinti klasę',
    'class.name': 'Klasės pavadinimas',
    'class.subject': 'Dalykas',
    'class.schedule': 'Tvarkaraštis',
    'class.students': 'Mokiniai',
    
    // Feedback
    'feedback.understanding': 'Supratimas',
    'feedback.interest': 'Susidomėjimas',
    'feedback.growth': 'Augimas',
    'feedback.submit': 'Pateikti grįžtamąjį ryšį',
    'feedback.average': 'Vidurkis',
    'feedback.excellent': 'Puiku',
    'feedback.good': 'Gerai',
    'feedback.fair': 'Vidutiniškai',
    'feedback.poor': 'Blogai',

    // Admin Dashboard - Lithuanian translations
    'admin.title': 'Mokyklos administratoriaus skydelis',
    'admin.welcome': 'Sveiki',
    'admin.logout': 'Atsijungti',
    'admin.loading': 'Kraunamas skydelis...',
    'admin.subscription': 'Prenumerata',
    'admin.subscribe': 'Prenumeruoti dabar',
    'admin.stats.teachers': 'Iš viso mokytojų',
    'admin.stats.feedback': 'Iš viso grįžtamojo ryšio',
    'admin.teachers.title': 'Mokytojai',
    'admin.teachers.description': 'Valdyti mokyklos mokytojus',
    'admin.teachers.empty': 'Mokytojų nerasta',
    'admin.feedback.title': 'Grįžtamojo ryšio suvestinė',
    'admin.feedback.description': 'Mokinių grįžtamojo ryšio apžvalga pagal mokytoją ir klasę',
    'admin.feedback.teacher': 'Mokytojas',
    'admin.feedback.subject': 'Dalykas',
    'admin.feedback.date': 'Data',
    'admin.feedback.scores': 'Įvertinimai',
    'admin.feedback.understanding': 'Supratimas',
    'admin.feedback.interest': 'Susidomėjimas',
    'admin.feedback.growth': 'Augimas',
    'admin.feedback.responses': 'atsakymai',
    'admin.feedback.empty': 'Grįžtamojo ryšio duomenų dar nėra',
    'admin.error.title': 'Klaida kraunant duomenis',
    'admin.error.description': 'Nepavyko įkelti skydelio duomenų',

    // Pricing Page - Lithuanian
    'pricing.title': 'Prenumeratos kainos',
    'pricing.backToDashboard': 'Grįžti į skydelį',
    'pricing.welcome': 'Sveiki',
    'pricing.choosePlan': 'Pasirinkite mokyklos planą',
    'pricing.subtitle': 'Paprastos, skaidrios kainos visai jūsų mokyklai',
    'pricing.school': 'Mokykla',
    'pricing.configurePlan': 'Konfigūruokite savo planą',
    'pricing.configureDesc': 'Pritaikykite prenumeratą pagal mokytojų skaičių',
    'pricing.numberOfTeachers': 'Mokytojų skaičius',
    'pricing.teacherDesc': 'Kiekvienas mokytojas gali sukurti neribotą klasių skaičių ir rinkti mokinių grįžtamąjį ryšį',
    'pricing.discountCode': 'Nuolaidos kodas (neprivaloma)',
    'pricing.enterDiscount': 'Įveskite nuolaidos kodą',
    'pricing.validating': 'Tikrinama...',
    'pricing.apply': 'Taikyti',
    'pricing.discountAppliedShort': 'nuolaida pritaikyta!',
    'pricing.whatsIncluded': 'Kas įtraukta',
    'pricing.unlimitedClasses': 'Neriboti klasių tvarkaraščiai',
    'pricing.feedbackCollection': 'Mokinių grįžtamojo ryšio rinkimas',
    'pricing.analytics': 'Analitika ir ataskaitos',
    'pricing.mentalHealth': 'Psichikos sveikatos stebėjimas',
    'pricing.multiLanguage': 'Daugiakalbė pagalba',
    'pricing.orderSummary': 'Užsakymo suvestinė',
    'pricing.reviewDetails': 'Peržiūrėkite prenumeratos informaciją',
    'pricing.teachers': 'Mokytojai',
    'pricing.each': 'kiekvienas',
    'pricing.subtotal': 'Tarpinė suma',
    'pricing.discount': 'Nuolaida',
    'pricing.totalMonthly': 'Iš viso (mėnesinis)',
    'pricing.billing': 'Atsiskaitymas',
    'pricing.billingDesc': 'Jums bus apmokestinta ${amount} per mėnesį. Galite atšaukti ar keisti prenumeratą bet kada.',
    'pricing.processing': 'Apdorojama...',
    'pricing.subscribeFor': 'Prenumeruoti už',
    'pricing.securePayment': 'Saugus mokėjimas naudojant Stripe. Atšaukite bet kada.',
    'pricing.discountApplied': 'Nuolaida pritaikyta!',
    'pricing.discountAppliedDesc': 'Jūsų užsakymui pritaikyta {percent}% nuolaida.',
    'pricing.invalidDiscount': 'Neteisingas nuolaidos kodas',
    'pricing.invalidDiscountDesc': 'Įvestas nuolaidos kodas nėra galiojantis.',
    'pricing.paymentError': 'Mokėjimo klaida',
    'pricing.paymentErrorDesc': 'Nepavyko sukurti prenumeratos. Bandykite dar kartą.',
    
    // Common
    'common.save': 'Išsaugoti',
    'common.cancel': 'Atšaukti',
    'common.edit': 'Redaguoti',
    'common.delete': 'Ištrinti',
    'common.loading': 'Kraunama...',
    'common.error': 'Klaida',
    'common.success': 'Sėkmė',
    'common.close': 'Uždaryti',
    'common.back': 'Atgal',
    'common.next': 'Toliau',
    'common.previous': 'Ankstesnis',
    
    // Tagline
    'tagline.studentLead': 'Kai mokiniai veda, mokytojai sėkmingai dirba',
  }
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextProps = {
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

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageProvider, useLanguage };
