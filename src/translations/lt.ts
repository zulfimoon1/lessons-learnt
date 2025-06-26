
import { ltAuthTranslations } from './lt/auth';
import { ltChatTranslations } from './lt/chat';
import { ltDemoTranslations } from './lt/demo';
import { ltTeacherTranslations } from './lt/teacher';
import { ltWeeklyTranslations } from './lt/weekly';
import { ltAnalyticsTranslations } from './lt/analytics';

export const ltTranslations = {
  ...ltAuthTranslations,
  ...ltChatTranslations,
  ...ltDemoTranslations,
  ...ltTeacherTranslations,
  ...ltWeeklyTranslations,
  ...ltAnalyticsTranslations,
  
  // Common translations
  'common.loading': 'Kraunama...',
  'common.error': 'Klaida',
  'common.success': 'Sėkmė',
  'common.cancel': 'Atšaukti',
  'common.save': 'Išsaugoti',
  'common.delete': 'Ištrinti',
  'common.edit': 'Redaguoti',
  'common.view': 'Peržiūrėti',
  'common.back': 'Atgal',
  'common.next': 'Kitas',
  'common.previous': 'Ankstesnis',
  'common.submit': 'Pateikti',
  'common.close': 'Uždaryti',
  'common.open': 'Atidaryti',
  'common.yes': 'Taip',
  'common.no': 'Ne',
  'common.ok': 'Gerai',
  'common.ready': 'Pasiruošęs',
  'common.welcome': 'Sveiki',
  
  // Navigation
  'nav.home': 'Pradžia',
  'nav.dashboard': 'Skydelis',
  'nav.profile': 'Profilis',
  'nav.settings': 'Nustatymai',
  'nav.logout': 'Atsijungti',
  'nav.login': 'Prisijungti',
  'nav.signup': 'Registruotis',
  
  // Dashboard
  'dashboard.title': 'Skydelis',
  'dashboard.welcome': 'Sveiki atvykę į savo skydelį',
  'dashboard.studentDashboard': 'Studento skydelis',
  'dashboard.teacherDashboard': 'Mokytojo skydelis',
  'dashboard.feedback': 'Atsiliepimai',
  'dashboard.quickActions': 'Greiti veiksmai',
  'dashboard.recentActivity': 'Paskutinė veikla',
  'dashboard.stats': 'Statistika',
  
  // Features
  'features.mentalHealth.title': 'Psichikos sveikatos palaikymas',
  'features.mentalHealth.description': 'Prieiga prie psichikos sveikatos išteklių ir palaikymo',
  'features.feedback.title': 'Atsiliepimų sistema',
  'features.feedback.description': 'Pateikite ir gaukite atsiliepimus apie pamokas',
  
  // Admin
  'admin.welcome': 'Sveiki',
  'admin.role': 'Administratorius',
  
  // AI
  'ai.insights': 'AI įžvalgos',
  'ai.recommendations': 'AI rekomenacijos',
  'ai.analysis': 'AI analizė',
} as const;
