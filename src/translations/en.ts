
import { enAuthTranslations } from './en/auth';
import { enChatTranslations } from './en/chat';
import { enDemoTranslations } from './en/demo';
import { enTeacherTranslations } from './en/teacher';
import { enWeeklyTranslations } from './en/weekly';
import { enAnalyticsTranslations } from './en/analytics';

export const enTranslations = {
  ...enAuthTranslations,
  ...enChatTranslations,
  ...enDemoTranslations,
  ...enTeacherTranslations,
  ...enWeeklyTranslations,
  ...enAnalyticsTranslations,
  
  // Common translations
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.submit': 'Submit',
  'common.close': 'Close',
  'common.open': 'Open',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.ready': 'Ready',
  'common.welcome': 'Welcome',
  
  // Navigation
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
  'nav.logout': 'Logout',
  'nav.login': 'Login',
  'nav.signup': 'Sign Up',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welcome to your dashboard',
  'dashboard.studentDashboard': 'Student Dashboard',
  'dashboard.teacherDashboard': 'Teacher Dashboard',
  'dashboard.feedback': 'Feedback',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.stats': 'Statistics',
  
  // Features
  'features.mentalHealth.title': 'Mental Health Support',
  'features.mentalHealth.description': 'Access mental health resources and support',
  'features.feedback.title': 'Feedback System',
  'features.feedback.description': 'Provide and receive feedback on classes',
  
  // Admin
  'admin.welcome': 'Welcome',
  'admin.role': 'Administrator',
  
  // AI
  'ai.insights': 'AI Insights',
  'ai.recommendations': 'AI Recommendations',
  'ai.analysis': 'AI Analysis',
} as const;
