
import { ltAuthTranslations } from './lt/auth';
import { ltTeacherTranslations } from './lt/teacher';
import { ltWeeklyTranslations } from './lt/weekly';
import { ltChatTranslations } from './lt/chat';
import { ltDemoTranslations } from './lt/demo';

export const ltTranslations = {
  // Common translations
  'common.loading': 'Kraunama...',
  'common.error': 'Klaida',
  'common.success': 'Sėkmė',
  'common.cancel': 'Atšaukti',
  'common.save': 'Išsaugoti',
  'common.delete': 'Ištrinti',
  'common.edit': 'Redaguoti',
  'common.add': 'Pridėti',
  'common.remove': 'Pašalinti',
  'common.confirm': 'Patvirtinti',
  'common.yes': 'Taip',
  'common.no': 'Ne',
  'common.submit': 'Pateikti',
  'common.back': 'Atgal',
  'common.next': 'Toliau',
  'common.previous': 'Ankstesnis',
  'common.close': 'Uždaryti',
  'common.open': 'Atidaryti',
  'common.view': 'Peržiūrėti',
  'common.download': 'Atsisiųsti',
  'common.upload': 'Įkelti',
  'common.search': 'Ieškoti',
  'common.filter': 'Filtruoti',
  'common.sort': 'Rūšiuoti',
  'common.refresh': 'Atnaujinti',
  'common.clear': 'Išvalyti',
  'common.reset': 'Iš naujo',
  'common.apply': 'Pritaikyti',
  'common.update': 'Atnaujinti',
  'common.create': 'Sukurti',
  'common.days': 'Dienos',
  'common.minute': 'minutė',
  'common.minutes': 'minutės',
  'common.ready': 'Paruošta',
  'common.minimize': 'Sumažinti',

  // Navigation
  'nav.home': 'Pradžia',
  'nav.dashboard': 'Skydelis',
  'nav.profile': 'Profilis',
  'nav.settings': 'Nustatymai',
  'nav.help': 'Pagalba',
  'nav.about': 'Apie',
  'nav.contact': 'Kontaktai',
  'navigation.studentLogin': 'Studento prisijungimas',
  'navigation.teacherLogin': 'Mokytojo prisijungimas',
  'navigation.signUpNow': 'Registruotis dabar',
  'navigation.backToHome': 'Grįžti į pradžią',

  // Logout
  'logout': 'Atsijungti',

  // Dashboard
  'dashboard.title': 'Studento skydelis',
  'dashboard.welcome': 'Sveiki atvykę',
  'dashboard.overview': 'Apžvalga',
  'dashboard.teacherOverview': 'Mokytojo apžvalga',
  'dashboard.doctorOverview': 'Daktaro apžvalga',
  'dashboard.studentOverview': 'Studento apžvalga',
  'dashboard.studentDashboard': 'Studento skydelis',
  'dashboard.teacherDashboard': 'Mokytojo skydelis',
  'dashboard.feedback': 'Atsiliepimai',
  'dashboard.feedbackDescription': 'Peržiūrėti ir tvarkyti studentų atsiliepimus apie pamokas ir klases.',
  'dashboard.weeklySummaries': 'Savaitės santraukos',
  'dashboard.weeklySummary': 'Savaitės santrauka',
  'dashboard.mentalHealthSupport': 'Psichinės sveikatos palaikymas',
  'dashboard.mentalHealth': 'Psichinė sveikata',
  'dashboard.grade': 'Klasė',

  // Auth translations
  'auth.login': 'Prisijungti',
  'auth.signUp': 'Registruotis',

  // Analytics
  'analytics.title': 'Analitika',
  'analytics.description': 'Įžvalgos apie jūsų mokymo veiklą ir studentų įsitraukimą',

  ...ltAuthTranslations,
  ...ltTeacherTranslations,
  ...ltWeeklyTranslations,
  ...ltChatTranslations,
  ...ltDemoTranslations,
} as const;
