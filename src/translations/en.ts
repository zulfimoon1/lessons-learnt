
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

  // Navigation
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
  'nav.help': 'Help',
  'nav.about': 'About',
  'nav.contact': 'Contact',

  // Dashboard
  'dashboard.overview': 'Overview',
  'dashboard.teacherOverview': 'Teacher Overview',
  'dashboard.doctorOverview': 'Doctor Overview',
  'dashboard.studentOverview': 'Student Overview',
  'dashboard.feedback': 'Feedback',
  'dashboard.feedbackDescription': 'View and manage student feedback for your lessons and classes.',
  'dashboard.weeklySummaries': 'Weekly Summaries',
  'dashboard.mentalHealthSupport': 'Mental Health Support',

  // Feedback
  'feedback.title': 'Lesson Feedback',
  'feedback.description': 'Share your thoughts about today\'s lesson to help improve the learning experience.',
  'feedback.lessonTitle': 'Lesson Title',
  'feedback.lessonTitlePlaceholder': 'Enter the lesson title',
  'feedback.lessonDescription': 'Lesson Description',
  'feedback.lessonDescriptionPlaceholder': 'Briefly describe what was covered in the lesson',
  'feedback.understanding': 'How well did you understand the lesson content?',
  'feedback.interest': 'How interesting was the lesson for you?',
  'feedback.growth': 'How much do you feel you learned or grew from this lesson?',
  'feedback.emotionalState': 'Emotional State',
  'feedback.emotionalStateDescription': 'Select how you felt emotionally during the lesson. This helps your teacher understand the classroom environment.',
  'feedback.whatWentWell': 'What went well in this lesson?',
  'feedback.whatWentWellPlaceholder': 'Share what you enjoyed or found helpful about the lesson',
  'feedback.suggestions': 'Suggestions for Improvement',
  'feedback.suggestionsPlaceholder': 'What could be improved in future lessons?',
  'feedback.additionalComments': 'Additional Comments',
  'feedback.additionalCommentsPlaceholder': 'Any other thoughts or feedback you\'d like to share?',
  'feedback.submitFeedback': 'Submit Feedback',
  'feedback.submitting': 'Submitting...',
  'feedback.submitted': 'Feedback Submitted',
  'feedback.submittedDescription': 'Thank you for your feedback!',
  'feedback.submitError': 'Failed to submit feedback. Please try again.',

  // Admin
  'admin.welcome': 'Welcome',
  'admin.subscription': 'Subscription',

  // Class
  'class.schedule': 'Schedule',

  // Upload
  'upload.bulkUpload': 'Bulk Upload',
  'upload.uploadComplete': 'Upload Complete',

  // Articles
  'articles.mentalHealth': 'Mental Health Articles',

  // Pricing
  'pricing.processing': 'Processing...',

  // Merge all sub-translations
  ...enAuthTranslations,
  ...enTeacherTranslations,
  ...enWeeklyTranslations,
  ...enChatTranslations,
  ...enDemoTranslations,
};
