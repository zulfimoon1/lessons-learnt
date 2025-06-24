
import { ltAuthTranslations } from './lt/auth';
import { ltChatTranslations } from './lt/chat';
import { ltDemoTranslations } from './lt/demo';
import { ltTeacherTranslations } from './lt/teacher';
import { ltWeeklyTranslations } from './lt/weekly';

export const ltTranslations = {
  ...ltAuthTranslations,
  ...ltChatTranslations,
  ...ltDemoTranslations,
  ...ltTeacherTranslations,
  ...ltWeeklyTranslations,
  
  // Common translations
  'common.error': 'Klaida',
  'common.success': 'Sėkmė',
  'common.loading': 'Kraunama...',
  'common.save': 'Išsaugoti',
  'common.cancel': 'Atšaukti',
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
  'common.confirm': 'Patvirtinti',
  'common.welcome': 'Sveiki',
  
  // Admin translations
  'admin.welcome': 'Sveiki',
  'admin.dashboard': 'Administratoriaus skydelis',
  
  // Dashboard translations
  'dashboard.feedback': 'Atsiliepimai',
  'dashboard.doctorOverview': 'Gydytojo apžvalga',
  
  // Class translations
  'class.schedule': 'Tvarkaraštis',
  'class.schedules': 'Tvarkaraščiai',
};
