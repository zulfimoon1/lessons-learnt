
import { enAuthTranslations } from './en/auth';
import { enChatTranslations } from './en/chat';
import { enDemoTranslations } from './en/demo';
import { enTeacherTranslations } from './en/teacher';
import { enWeeklyTranslations } from './en/weekly';

export const enTranslations = {
  ...enAuthTranslations,
  ...enChatTranslations,
  ...enDemoTranslations,
  ...enTeacherTranslations,
  ...enWeeklyTranslations,
  
  // Common translations
  'common.error': 'Error',
  'common.success': 'Success',
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
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
  'common.confirm': 'Confirm',
  'common.welcome': 'Welcome',
  
  // Admin translations
  'admin.welcome': 'Welcome',
  'admin.dashboard': 'Admin Dashboard',
  
  // Dashboard translations
  'dashboard.feedback': 'Feedback',
  'dashboard.doctorOverview': 'Doctor Overview',
  
  // Class translations
  'class.schedule': 'Schedule',
  'class.schedules': 'Schedules',
};
