import { enAuthTranslations } from './en/auth';
import { enTeacherTranslations } from './en/teacher';
import { enWeeklyTranslations } from './en/weekly';
import { enChatTranslations } from './en/chat';
import { enDemoTranslations } from './en/demo';

export const enTranslations = {
  // Common translations
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.submit': 'Submit',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.close': 'Close',
  'common.open': 'Open',
  'common.view': 'View',
  'common.download': 'Download',
  'common.upload': 'Upload',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.refresh': 'Refresh',
  'common.clear': 'Clear',
  'common.reset': 'Reset',
  'common.apply': 'Apply',
  'common.update': 'Update',
  'common.create': 'Create',
  'common.days': 'Days',
  'common.minute': 'minute',
  'common.minutes': 'minutes',
  'common.ready': 'Ready',
  'common.minimize': 'Minimize',
  'common.bookDemo': 'Book a Demo',
  'common.menu': 'Menu',
  'common.getStarted': 'Get Started',
  'common.studentLogin': 'Student Login',
  'common.teacherLogin': 'Teacher Login',
  'common.lessonsShort': 'Lessons',
  'common.english': 'English',
  'common.lithuanian': 'Lietuvių',
  'common.messageRequired': 'Message required',
  'common.pleaseEnterMessage': 'Please enter a message',
  'common.psychologistRequired': 'Psychologist required',
  'common.pleaseSelectPsychologist': 'Please select a psychologist to contact',
  'common.anonymousStudent': 'Anonymous Student',
  'common.unknown': 'Unknown',
  'common.choosePsychologist': 'Choose a psychologist...',
  'common.enterYourName': 'Enter your name',
  'common.failedToSendMessage': 'Failed to send message. Please try again.',
  'common.anonymousMessageSent': 'Your anonymous message has been sent to the school psychologist',
  'common.messageSentToSchoolPsychologist': 'Your message has been sent to the school psychologist',

  // Navigation
  'navigation.studentLogin': 'Student Login',
  'navigation.teacherLogin': 'Teacher Login',
  'navigation.signUpNow': 'Sign Up Now',
  'navigation.backToHome': 'Back to Home',

  // Welcome section - NEW comprehensive hero messaging
  'welcome.title': 'Lessons Learnt',
  'welcome.heroTitle1': 'Know How Every Student Feels',
  'welcome.heroTitle2': 'And When They Need Help',
  'welcome.subtitle': 'Get genuine student feedback through voice messages. AI detects emotional distress early. Teachers get alerts to help students before it\'s too late.',
  'welcome.freeForStudents': 'Always Free for Students!',
  'welcome.studentsWelcome': 'Welcome to your learning journey',
  'welcome.studentsSubtitle': 'Track your progress, share feedback, and get support when you need it.',

  // Pricing and Demo
  'pricing.title': 'Pricing',
  'demo.title': 'See Demo',

  // Homepage - Platform section
  'platform.whySchools': 'Why Schools Choose Our Platform',
  'platform.whySchoolsSubtitle': 'Comprehensive insights and support for educational excellence',
  'platform.studentInsights': 'Student Insights & Analytics',
  'platform.realTimeAnalytics': 'Real-Time Analytics',
  'platform.realTimeAnalyticsDesc': 'Get instant insights into student engagement, understanding, and emotional well-being through our advanced analytics dashboard.',
  'platform.mentalHealthMonitoring': 'Mental Health Monitoring',
  'platform.mentalHealthMonitoringDesc': 'Early detection of students who need support, helping educators intervene before issues become serious.',
  'platform.privacySecurity': 'Privacy & Security',
  'platform.privacySecurityDesc': 'GDPR compliant with bank-level encryption. Student data is protected with the highest security standards.',
  'platform.improvementPercent': '85%',
  'platform.improvementTitle': 'Student Engagement Improvement',
  'platform.improvementDesc': 'Schools report significant improvements in student engagement and teacher insights.',
  'platform.readyToTransform': 'Ready to Transform Your School?',
  'platform.readyToTransformDesc': 'Join hundreds of schools already using our platform to improve student outcomes.',
  
  // Dashboard header
  'header.dashboard': 'Dashboard',
  'header.welcome': 'Welcome',
  
  // Dashboard - Enhanced with missing keys
  'dashboard.title': 'Student Dashboard',
  'dashboard.student.heyThere': 'Hey there',
  'dashboard.student.mySchool': 'My School',
  'dashboard.student.myGrade': 'My Grade', 
  'dashboard.student.classesComingUp': 'Classes Coming Up',
  'dashboard.student.readyToShare': 'Ready to share how you\'re feeling?',
  'dashboard.welcome': 'Welcome',
  'dashboard.overview': 'Overview',
  'dashboard.teacherOverview': 'Teacher Overview',
  'dashboard.doctorOverview': 'Doctor Overview',
  'dashboard.studentOverview': 'Student Overview',
  'dashboard.studentDashboard': 'Student Dashboard',
  'dashboard.myLearningDashboard': 'My Learning Dashboard',
  'dashboard.myClasses': 'My Classes',
  'dashboard.shareMyThoughts': 'Share My Thoughts',
  'dashboard.myWeek': 'My Week',
  'dashboard.howImFeeling': 'How I\'m Feeling',
  'dashboard.myProgress': 'My Progress',
  'dashboard.feedback': 'Feedback',
  
  // Quick Actions
  'quickActions.title': 'Quick Actions',
  'quickActions.checkMyClasses': 'Check My Classes',
  'quickActions.shareHowClassWent': 'Share How Class Went',
  'quickActions.checkInAboutMyWeek': 'Check In About My Week',
  'quickActions.howAmIFeeling': 'How Am I Feeling?',
  'quickActions.seeClassesComingUp': 'See what classes I have coming up',
  'quickActions.tellUsAboutClasses': 'Tell us about your classes',
  'quickActions.seeHowWeekGoing': 'See how this week is going',
  'quickActions.talkAboutFeeling': 'Talk about how I\'m doing',
  
  // Student Classes
  'classes.title': 'Classes & Feedback',
  'classes.noClassesFound': 'No classes found',
  'classes.classesWillAppear': 'Classes for {grade} at {school} will appear here',
  'classes.feedbackNeeded': 'Feedback Needed',
  'classes.feedbackSubmitted': 'Feedback Submitted',
  'classes.upcoming': 'Upcoming',
  'classes.leaveFeedback': 'Leave Feedback',
  'classes.submitFeedback': 'Submit Feedback',
  'classes.debugInfo': 'Debug Information:',
  
  // Wellness Tracker
  'wellness.title': 'How Are You Feeling Today?',
  'wellness.pickFeeling': 'Pick the one that feels right:',
  'wellness.tellUsMore': 'Want to tell us more? (You don\'t have to!)',
  'wellness.shareFeeling': 'Share How I\'m Feeling',
  'wellness.recentEntries': 'How You\'ve Been Feeling Lately:',
  'wellness.yourVoiceMessage': 'Your voice message',
  'wellness.whatGoingOn': 'What\'s going on? How are things at school or home? Anything you want to share...',
  'wellness.awesome': 'Awesome!',
  'wellness.prettyGood': 'Pretty Good',
  'wellness.okay': 'Okay',
  'wellness.notGreat': 'Not Great',
  'wellness.reallyBad': 'Really Bad',

  // Features - UPDATED to reflect combined value proposition
  'features.studentFeedback.title': 'Voice Feedback Collection',
  'features.studentFeedback.description': 'Students share honest feedback through voice messages, revealing true emotions and learning experiences',
  'features.teacherInsights.title': 'AI-Powered Early Detection',
  'features.teacherInsights.description': 'Advanced AI analyzes voice patterns and feedback to detect emotional distress and learning struggles early',
  'features.mentalHealth.title': 'Instant Teacher Alerts',
  'features.mentalHealth.description': 'Teachers receive immediate notifications when students need support, enabling timely intervention',

  // Basic auth fields
  'emailPlaceholder': 'Enter your email',
  'passwordPlaceholder': 'Enter your password',
  'confirmPasswordPlaceholder': 'Confirm your password',
  'fullNamePlaceholder': 'Enter your full name',
  'schoolPlaceholder': 'Enter your school name',
  'gradePlaceholder': 'Enter your grade',
  'signIn': 'Sign In',
  'signingIn': 'Signing In...',
  'signingUp': 'Signing Up...',
  'teacher': 'Teacher',
  'admin': 'Admin',
  'doctor': 'Doctor',
  'grade': 'Grade',
  'role': 'Role',
  'logout': 'Logout',

  // Form
  'form.email': 'Email',

  // Merge all sub-translations
  ...enAuthTranslations,
  ...enTeacherTranslations,
  ...enWeeklyTranslations,
  ...enChatTranslations,
  ...enDemoTranslations,
};

export const translations = {
  en: enTranslations
};