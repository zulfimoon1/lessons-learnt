
import { ltAuthTranslations } from './lt/auth';
import { ltTeacherTranslations } from './lt/teacher';
import { ltWeeklyTranslations } from './lt/weekly';
import { ltChatTranslations } from './lt/chat';
import { ltDemoTranslations } from './lt/demo';

export const ltTranslations = {
  // Common translations
  'common.loading': 'Kraunama...',
  'common.error': 'Klaida',
  'common.success': 'Sėkmingai',
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
  'common.reset': 'Atkurti',
  'common.apply': 'Pritaikyti',
  'common.update': 'Atnaujinti',
  'common.create': 'Sukurti',

  // Navigation
  'nav.home': 'Pradžia',
  'nav.dashboard': 'Skydelis',
  'nav.profile': 'Profilis',
  'nav.settings': 'Nustatymai',
  'nav.help': 'Pagalba',
  'nav.about': 'Apie mus',
  'nav.contact': 'Kontaktai',

  // Dashboard
  'dashboard.title': 'Studento skydelis',
  'dashboard.overview': 'Apžvalga',
  'dashboard.teacherOverview': 'Mokytojo apžvalga',
  'dashboard.doctorOverview': 'Daktaro apžvalga',
  'dashboard.studentOverview': 'Studento apžvalga',
  'dashboard.feedback': 'Atsiliepimai',
  'dashboard.feedbackDescription': 'Peržiūrėkite ir tvarkykite studentų atsiliepimus apie pamokas ir klases.',
  'dashboard.weeklySummaries': 'Savaitės santraukos',
  'dashboard.weeklySummary': 'Savaitės santrauka',
  'dashboard.mentalHealthSupport': 'Psichikos sveikatos pagalba',
  'dashboard.grade': 'Klasė',
  'dashboard.upcomingClasses': 'Artėjančios pamokos',
  'dashboard.subscribeNow': 'Užsisakyti dabar',

  // Feedback
  'feedback.title': 'Pamokos atsiliepimas',
  'feedback.description': 'Pasidalykite savo mintimis apie šiandienos pamoką, kad padėtumėte pagerinti mokymosi patirtį.',
  'feedback.lessonTitle': 'Pamokos pavadinimas',
  'feedback.lessonTitlePlaceholder': 'Įveskite pamokos pavadinimą',
  'feedback.lessonDescription': 'Pamokos aprašymas',
  'feedback.lessonDescriptionPlaceholder': 'Trumpai aprašykite, kas buvo nagrinėjama pamokoje',
  'feedback.understanding': 'Kaip gerai supratote pamokos turinį?',
  'feedback.interest': 'Kiek pamoka jums buvo įdomi?',
  'feedback.growth': 'Kiek jaučiatės išmokę ar išaugę iš šios pamokos?',
  'feedback.emotionalState': 'Emocinė būsena',
  'feedback.emotionalStateDescription': 'Pasirinkite, kaip jautėtės emociškai pamokos metu. Tai padeda mokytojui suprasti klasės aplinką.',
  'feedback.whatWentWell': 'Kas gerai pavyko šioje pamokoje?',
  'feedback.whatWentWellPlaceholder': 'Pasidalykite tuo, kas jums patiko ar buvo naudinga pamokoje',
  'feedback.suggestions': 'Pasiūlymai pagerinimui',
  'feedback.suggestionsPlaceholder': 'Ką būtų galima pagerinti būsimose pamokose?',
  'feedback.additionalComments': 'Papildomi komentarai',
  'feedback.additionalCommentsPlaceholder': 'Ar turite kitų minčių ar atsiliepimų, kuriais norėtumėte pasidalyti?',
  'feedback.submitFeedback': 'Pateikti atsiliepimą',
  'feedback.submitting': 'Pateikiama...',
  'feedback.submitted': 'Atsiliepimas pateiktas',
  'feedback.submittedDescription': 'Ačiū už jūsų atsiliepimą!',
  'feedback.submitError': 'Nepavyko pateikti atsiliepimo. Bandykite dar kartą.',

  // Admin
  'admin.title': 'Administratoriaus skydelis',
  'admin.welcome': 'Sveiki',
  'admin.subscription': 'Prenumerata',
  'admin.subscribe': 'Užsisakyti dabar',
  'admin.loading': 'Kraunama...',
  'admin.error.title': 'Klaida',
  'admin.error.description': 'Nepavyko įkelti duomenų',

  // Class
  'class.schedule': 'Tvarkaraštis',
  'class.upcomingClasses': 'Artėjančios pamokos',

  // Upload
  'upload.bulkUpload': 'Masinis įkėlimas',
  'upload.uploadComplete': 'Įkėlimas baigtas',

  // Articles
  'articles.mentalHealth': 'Psichikos sveikatos straipsniai',
  'articles.subscriptionRequired': 'Šiai funkcijai reikalinga prenumerata.',

  // Pricing
  'pricing.processing': 'Apdorojama...',

  // Student
  'student.failedToLoadClasses': 'Nepavyko įkelti pamokų',

  // Merge all sub-translations
  ...ltAuthTranslations,
  ...ltTeacherTranslations,
  ...ltWeeklyTranslations,
  ...ltChatTranslations,
  ...ltDemoTranslations,
};
