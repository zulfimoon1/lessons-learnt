
import { ltAuthTranslations } from './lt/auth';
import { ltTeacherTranslations } from './lt/teacher';
import { ltWeeklyTranslations } from './lt/weekly';
import { ltChatTranslations } from './lt/chat';
import { ltDemoTranslations } from './lt/demo';

export const ltTranslations = {
  // Common translations
  'common.loading': 'Įkeliama...',
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
  'common.reset': 'Nustatyti iš naujo',
  'common.apply': 'Taikyti',
  'common.update': 'Atnaujinti',
  'common.create': 'Sukurti',
  'common.days': 'Dienos',

  // Navigation
  'nav.home': 'Pagrindinis',
  'nav.dashboard': 'Skydelis',
  'nav.profile': 'Profilis',
  'nav.settings': 'Nustatymai',
  'nav.help': 'Pagalba',
  'nav.about': 'Apie',
  'nav.contact': 'Kontaktai',

  // Login pages
  'login.teacher.title': 'Mokytojų portalas',
  'login.teacher.subtitle': 'Prisijunkite prie savo mokymo skydelio',
  'login.student.title': 'Studentų portalas',
  'login.student.subtitle': 'Prisijunkite prie savo mokymosi skydelio',

  // Welcome/Home page
  'welcome.title': 'Lessons Learnt',
  'welcome.heroTitle1': 'Kolaboratyvios klasės',
  'welcome.heroTitle2': 'Nepakartojami protai',
  'welcome.subtitle': 'Įgalinkite studentus, palaikykite mokytojus ir gerinkite mokymąsi su mūsų išsamia švietimo platforma',
  'welcome.freeForStudents': 'Visada nemokama studentams!',

  // Features
  'features.studentFeedback.title': 'Studentų atsiliepimų rinkimas',
  'features.studentFeedback.description': 'Rinkite tiesioginius atsiliepimus apie pamokas ir patirtį',
  'features.teacherInsights.title': 'Mokytojų analitikos skydelis',
  'features.teacherInsights.description': 'Stebėkite studentų pažangą ir klasės dinamiką',
  'features.mentalHealth.title': 'Psichinės sveikatos palaikymas',
  'features.mentalHealth.description': 'Anonimiškas pokalbis su mokyklos psichologais',

  // Platform
  'platform.whySchools': 'Kodėl mokyklos renkasi Lessons Learnt',
  'platform.whySchoolsSubtitle': 'Išsami švietimo technologija, kurioje pirmoje vietoje - studentų gerovė',
  'platform.studentInsights': 'Realaus laiko studentų įžvalgos',
  'platform.realTimeAnalytics': 'Realaus laiko analizė',
  'platform.realTimeAnalyticsDesc': 'Gaukite momentinį atsiliepimą apie pamokų efektyvumą ir studentų supratimą',
  'platform.mentalHealthMonitoring': 'Psichinės sveikatos stebėjimas',
  'platform.mentalHealthMonitoringDesc': 'Ankstyvasis papildomo palaikymo reikalaujančių studentų identifikavimas',
  'platform.privacySecurity': 'Privatumas ir saugumas',
  'platform.privacySecurityDesc': 'GDPR atitikimas su įmonės lygio saugumo priemonėmis',
  'platform.improvementPercent': '25%+',
  'platform.improvementTitle': 'Studentų įsitraukimo pagerėjimas',
  'platform.improvementDesc': 'Mokyklos praneša apie reikšmingą pagerėjimą per pirmą mėnesį',
  'platform.readyToTransform': 'Pasiruošę transformuoti savo mokyklą?',
  'platform.readyToTransformDesc': 'Prisijunkite prie tūkstančių pedagogų, jau naudojančių mūsų platformą',

  // Pricing
  'pricing.title': 'Kainodara',

  // Demo
  'demo.title': 'Demonstracija',
  'demo.subtitle': '5+ funkcijos, 3 vartotojų tipai',
  'demo.featureDemo': 'Funkcijų demonstracija',
  'demo.featuresUserTypes': '5+ funkcijos, 3 vartotojų tipai',
  'demo.experienceComplete': 'Patirkite visą platformą',
  'demo.discoverFuture': 'Atraskite ateities švietimą veiksmų - tyrinėkite mūsų novatorišką platformą, sukurtą transformuoti mokymąsi studentams, įgalinti pedagogus ir palaikyti psichinę sveikatą.',
  'demo.discoverDescription': 'Nuo interaktyvių studentų modeliavimų iki išsamios mokytojų analitikos - pamatykite, kaip mūsų platforma sukuria palaikančią ir įtraukiančią mokymosi aplinką.',
  'demo.experienceFullPlatform': 'Patirkite visą platformą',
  'demo.experienceDescription': 'Nuo interaktyvių studentų modeliavimų iki išsamios mokytojų analitikos - pamatykite, kaip mūsų platforma sukuria palaikančią ir įtraukiančią mokymosi aplinką.',
  'demo.enterDemo': 'Įeiti į demonstraciją',
  'demo.noRegistrationRequired': 'Registracija nereikalinga',
  'demo.fullFeatureAccess': 'Pilna prieiga prie funkcijų',
  'demo.sampleDataIncluded': 'Įtraukti pavyzdiniai duomenys',
  'demo.tryBeforeCommit': 'Išbandykite prieš apsispręsdami',

  // Student specific
  'student.failedToLoadClasses': 'Nepavyko įkelti pamokų',
  'student.fullNamePlaceholder': 'Vardas Pavardė',
  'student.schoolPlaceholder': 'Vilniaus licėjus',
  'student.gradePlaceholder': '5 klasė, 10A',
  'student.classGrade': 'Klasė/Grupė',
  'student.school': 'Mokykla',

  // Teacher specific  
  'teacher.missingInfo': 'Trūksta informacijos',
  'teacher.passwordMismatch': 'Slaptažodžiai nesutampa',
  'teacher.passwordsDoNotMatch': 'Slaptažodžiai nesutampa',
  'teacher.signupFailed': 'Registracija nepavyko',
  'teacher.accountCreated': 'Paskyra sukurta!',
  'teacher.welcomeToApp': 'Sveiki atvykę į Lesson Lens!',

  // Merge all sub-translations
  ...ltAuthTranslations,
  ...ltTeacherTranslations,
  ...ltWeeklyTranslations,
  ...ltChatTranslations,
  ...ltDemoTranslations,
};
