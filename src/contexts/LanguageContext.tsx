
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
    'features.dataAnalytics.title': 'Data Analytics',
    'features.dataAnalytics.description': 'Comprehensive analytics to track student progress and well-being',
    
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
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    
    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.studentLogin': 'Acceso Estudiantes',
    'auth.teacherLogin': 'Acceso Profesores',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.name': 'Nombre',
    'auth.school': 'Escuela',
    'auth.signUp': 'Registrarse',
    'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'auth.dontHaveAccount': '¿No tienes una cuenta?',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',

    // Teacher Login Page
    'login.teacher.title': 'Portal de Profesores y Administradores',
    'login.teacher.subtitle': 'Accede a tu panel de aula y herramientas de gestión escolar',
    'login.teacher.login': 'Iniciar Sesión',
    'login.teacher.signup': 'Registrarse',
    'login.teacher.email': 'Correo Electrónico',
    'login.teacher.password': 'Contraseña',
    'login.teacher.fullName': 'Nombre Completo',
    'login.teacher.school': 'Nombre de la Escuela',
    'login.teacher.role': 'Rol',
    'login.teacher.roleTeacher': 'Profesor',
    'login.teacher.roleAdmin': 'Administrador Escolar',
    'login.teacher.adminHint': 'Los Admins Escolares pueden gestionar profesores y ver toda la retroalimentación',
    'login.teacher.confirmPassword': 'Confirmar Contraseña',
    'login.teacher.createAccount': 'Crear Cuenta',
    'login.teacher.loggingIn': 'Iniciando sesión...',
    'login.teacher.creatingAccount': 'Creando cuenta...',
    
    // Welcome messages
    'welcome.title': 'Transforma tu Escuela con Retroalimentación en Tiempo Real',
    'welcome.subtitle': 'Empodera a los profesores con insights de estudiantes y ayuda a los administradores a monitorear el rendimiento escolar',
    
    // Features
    'features.studentFeedback.title': 'Retroalimentación Estudiantil',
    'features.studentFeedback.description': 'Los estudiantes pueden proporcionar fácilmente retroalimentación sobre su experiencia de aprendizaje',
    'features.teacherInsights.title': 'Insights para Profesores',
    'features.teacherInsights.description': 'Los profesores obtienen insights en tiempo real para mejorar sus métodos de enseñanza',
    'features.dataAnalytics.title': 'Análisis de Datos',
    'features.dataAnalytics.description': 'Análisis comprehensivo para rastrear el progreso y bienestar de los estudiantes',
    
    // Dashboard
    'dashboard.overview': 'Resumen',
    'dashboard.classes': 'Clases',
    'dashboard.feedback': 'Retroalimentación',
    'dashboard.analytics': 'Análisis',
    'dashboard.settings': 'Configuración',
    'dashboard.schoolOverview': 'Resumen de la Escuela',
    'dashboard.teacherOverview': 'Resumen del Profesor',
    'dashboard.totalTeachers': 'Total de Profesores',
    'dashboard.totalClasses': 'Total de Clases',
    'dashboard.avgSatisfaction': 'Satisfacción Promedio',
    'dashboard.feedbackReceived': 'Retroalimentación Recibida',
    'dashboard.recentFeedback': 'Retroalimentación Reciente',
    'dashboard.subscribeNow': 'Suscribirse Ahora',
    'dashboard.manageSubscription': 'Gestionar Suscripción',
    
    // Class management
    'class.create': 'Crear Clase',
    'class.edit': 'Editar Clase',
    'class.delete': 'Eliminar Clase',
    'class.name': 'Nombre de la Clase',
    'class.subject': 'Materia',
    'class.schedule': 'Horario',
    'class.students': 'Estudiantes',
    
    // Feedback
    'feedback.understanding': 'Comprensión',
    'feedback.interest': 'Interés',
    'feedback.growth': 'Crecimiento',
    'feedback.submit': 'Enviar Retroalimentación',
    'feedback.average': 'Promedio',
    'feedback.excellent': 'Excelente',
    'feedback.good': 'Bueno',
    'feedback.fair': 'Regular',
    'feedback.poor': 'Deficiente',

    // Admin Dashboard - Spanish translations
    'admin.title': 'Panel de Administración Escolar',
    'admin.welcome': 'Bienvenido',
    'admin.logout': 'Cerrar Sesión',
    'admin.loading': 'Cargando panel...',
    'admin.subscription': 'Suscripción',
    'admin.subscribe': 'Suscribirse Ahora',
    'admin.stats.teachers': 'Total de Profesores',
    'admin.stats.feedback': 'Total de Retroalimentación',
    'admin.teachers.title': 'Profesores',
    'admin.teachers.description': 'Gestionar profesores en tu escuela',
    'admin.teachers.empty': 'No se encontraron profesores',
    'admin.feedback.title': 'Resumen de Retroalimentación',
    'admin.feedback.description': 'Resumen de retroalimentación estudiantil por profesor y clase',
    'admin.feedback.teacher': 'Profesor',
    'admin.feedback.subject': 'Materia',
    'admin.feedback.date': 'Fecha',
    'admin.feedback.scores': 'Puntuaciones',
    'admin.feedback.understanding': 'Comprensión',
    'admin.feedback.interest': 'Interés',
    'admin.feedback.growth': 'Crecimiento',
    'admin.feedback.responses': 'respuestas',
    'admin.feedback.empty': 'No hay datos de retroalimentación disponibles aún',
    'admin.error.title': 'Error al cargar datos',
    'admin.error.description': 'Falló la carga de datos del panel',

    // Pricing Page - Spanish
    'pricing.title': 'Precios de Suscripción',
    'pricing.backToDashboard': 'Volver al Panel',
    'pricing.welcome': 'Bienvenido',
    'pricing.choosePlan': 'Elige tu Plan Escolar',
    'pricing.subtitle': 'Precios simples y transparentes para toda tu escuela',
    'pricing.school': 'Escuela',
    'pricing.configurePlan': 'Configura tu Plan',
    'pricing.configureDesc': 'Personaliza tu suscripción según el número de profesores',
    'pricing.numberOfTeachers': 'Número de Profesores',
    'pricing.teacherDesc': 'Cada profesor puede crear clases ilimitadas y recopilar retroalimentación estudiantil',
    'pricing.discountCode': 'Código de Descuento (Opcional)',
    'pricing.enterDiscount': 'Ingresa código de descuento',
    'pricing.validating': 'Validando...',
    'pricing.apply': 'Aplicar',
    'pricing.discountAppliedShort': '¡descuento aplicado!',
    'pricing.whatsIncluded': 'Qué incluye',
    'pricing.unlimitedClasses': 'Horarios de clase ilimitados',
    'pricing.feedbackCollection': 'Recopilación de retroalimentación estudiantil',
    'pricing.analytics': 'Análisis e informes',
    'pricing.mentalHealth': 'Monitoreo de salud mental',
    'pricing.multiLanguage': 'Soporte multiidioma',
    'pricing.orderSummary': 'Resumen del Pedido',
    'pricing.reviewDetails': 'Revisa los detalles de tu suscripción',
    'pricing.teachers': 'Profesores',
    'pricing.each': 'cada uno',
    'pricing.subtotal': 'Subtotal',
    'pricing.discount': 'Descuento',
    'pricing.totalMonthly': 'Total (Mensual)',
    'pricing.billing': 'Facturación',
    'pricing.billingDesc': 'Se te cobrará ${amount} mensualmente. Puedes cancelar o modificar tu suscripción en cualquier momento.',
    'pricing.processing': 'Procesando...',
    'pricing.subscribeFor': 'Suscribirse por',
    'pricing.securePayment': 'Pago seguro con Stripe. Cancela en cualquier momento.',
    'pricing.discountApplied': '¡Descuento Aplicado!',
    'pricing.discountAppliedDesc': 'Se ha aplicado un descuento del {percent}% a tu pedido.',
    'pricing.invalidDiscount': 'Código de Descuento Inválido',
    'pricing.invalidDiscountDesc': 'El código de descuento que ingresaste no es válido.',
    'pricing.paymentError': 'Error de Pago',
    'pricing.paymentErrorDesc': 'Falló la creación de la suscripción. Por favor intenta de nuevo.',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
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
