import React, { createContext, useContext, useState, useCallback } from 'react';

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key: string) => key,
  setLanguage: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
}

const translations = {
  en: {
    'app.title': 'Lesson Lens',
    'app.subtitle': 'Empowering Education Through Feedback',
    'navigation.studentLogin': 'Student Login',
    'navigation.teacherLogin': 'Teacher Login',
    'login.student.title': 'Student Login',
    'login.student.subtitle': 'Enter your details to access the dashboard',
    'login.student.fullName': 'Full Name',
    'login.student.school': 'School',
    'login.student.grade': 'Grade',
    'login.student.password': 'Password',
    'login.student.login': 'Login',
    'login.student.signup': 'Signup',
    'login.student.signingIn': 'Signing In...',
    'login.student.signingUp': 'Signing Up...',
    'login.teacher.title': 'Teacher Login',
    'login.teacher.subtitle': 'Sign in to access your teacher dashboard',
    'login.teacher.login': 'Login',
    'login.teacher.signup': 'Signup',
    'login.teacher.email': 'Email',
    'login.teacher.password': 'Password',
    'login.teacher.fullName': 'Full Name',
    'login.teacher.school': 'School',
    'login.teacher.confirmPassword': 'Confirm Password',
    'login.teacher.createAccount': 'Create Account',
    'login.teacher.loggingIn': 'Logging In...',
    'login.teacher.creatingAccount': 'Creating Account...',
    'login.teacher.role': 'Role',
    'login.teacher.roleTeacher': 'Teacher',
    'login.teacher.roleAdmin': 'School Admin',
    'login.teacher.adminHint': 'School Admins can manage teachers and view all feedback',
    
    // Admin dashboard translations
    'admin.title': 'School Admin Dashboard',
    'admin.welcome': 'Welcome',
    'admin.logout': 'Logout',
    'admin.loading': 'Loading dashboard...',
    'admin.stats.teachers': 'Total Teachers',
    'admin.stats.feedback': 'Total Feedback',
    'admin.subscription': 'Subscription',
    'admin.subscribe': 'Subscribe Now',
    'admin.teachers.title': 'Teachers at',
    'admin.teachers.description': 'Manage teachers at your school',
    'admin.teachers.empty': 'No teachers found',
    'admin.feedback.title': 'Feedback Summary',
    'admin.feedback.description': 'Overview of student feedback per teacher and class',
    'admin.feedback.empty': 'No feedback data available yet',
    'admin.feedback.teacher': 'Teacher',
    'admin.feedback.subject': 'Subject',
    'admin.feedback.date': 'Date',
    'admin.feedback.scores': 'Scores',
    'admin.feedback.understanding': 'Understanding',
    'admin.feedback.interest': 'Interest',
    'admin.feedback.growth': 'Growth',
    'admin.feedback.count': '{count} responses',
    'admin.error.title': 'Error loading data',
    'admin.error.description': 'Failed to load dashboard data',
    'admin.payment.error.title': 'Payment Error',
    'admin.payment.error.description': 'Failed to create subscription. Please try again.',
  },
  es: {
    'app.title': 'Lesson Lens',
    'app.subtitle': 'Potenciando la Educación a Través de la Retroalimentación',
    'navigation.studentLogin': 'Acceso Estudiantes',
    'navigation.teacherLogin': 'Acceso Profesores',
     'login.student.title': 'Acceso Estudiantes',
    'login.student.subtitle': 'Introduce tus datos para acceder al panel',
    'login.student.fullName': 'Nombre Completo',
    'login.student.school': 'Escuela',
    'login.student.grade': 'Grado',
    'login.student.password': 'Contraseña',
    'login.student.login': 'Acceder',
    'login.student.signup': 'Registrarse',
    'login.student.signingIn': 'Iniciando Sesión...',
    'login.student.signingUp': 'Registrando...',
    'login.teacher.title': 'Acceso de Profesor',
    'login.teacher.subtitle': 'Inicia sesión para acceder a tu panel de profesor',
    'login.teacher.login': 'Acceder',
    'login.teacher.signup': 'Registrarse',
    'login.teacher.email': 'Correo Electrónico',
    'login.teacher.password': 'Contraseña',
    'login.teacher.fullName': 'Nombre Completo',
    'login.teacher.school': 'Escuela',
    'login.teacher.confirmPassword': 'Confirmar Contraseña',
    'login.teacher.createAccount': 'Crear Cuenta',
    'login.teacher.loggingIn': 'Iniciando Sesión...',
    'login.teacher.creatingAccount': 'Creando Cuenta...',
    'login.teacher.role': 'Rol',
    'login.teacher.roleTeacher': 'Profesor',
    'login.teacher.roleAdmin': 'Administrador Escolar',
    'login.teacher.adminHint': 'Los administradores escolares pueden gestionar profesores y ver todos los comentarios',
    
    // Admin dashboard translations
    'admin.title': 'Panel de Administración Escolar',
    'admin.welcome': 'Bienvenido',
    'admin.logout': 'Cerrar sesión',
    'admin.loading': 'Cargando panel...',
    'admin.stats.teachers': 'Total de Profesores',
    'admin.stats.feedback': 'Total de Comentarios',
    'admin.subscription': 'Suscripción',
    'admin.subscribe': 'Suscribirse Ahora',
    'admin.teachers.title': 'Profesores en',
    'admin.teachers.description': 'Gestionar profesores en tu escuela',
    'admin.teachers.empty': 'No se encontraron profesores',
    'admin.feedback.title': 'Resumen de Comentarios',
    'admin.feedback.description': 'Visión general de los comentarios de estudiantes por profesor y clase',
    'admin.feedback.empty': 'Aún no hay datos de comentarios disponibles',
    'admin.feedback.teacher': 'Profesor',
    'admin.feedback.subject': 'Asignatura',
    'admin.feedback.date': 'Fecha',
    'admin.feedback.scores': 'Puntuaciones',
    'admin.feedback.understanding': 'Comprensión',
    'admin.feedback.interest': 'Interés',
    'admin.feedback.growth': 'Crecimiento',
    'admin.feedback.count': '{count} respuestas',
    'admin.error.title': 'Error al cargar datos',
    'admin.error.description': 'No se pudieron cargar los datos del panel',
    'admin.payment.error.title': 'Error de Pago',
    'admin.payment.error.description': 'No se pudo crear la suscripción. Por favor, inténtalo de nuevo.',
  },
  fr: {
    'app.title': 'Lesson Lens',
    'app.subtitle': 'Améliorer l\'éducation grâce au feedback',
    'navigation.studentLogin': 'Connexion Étudiant',
    'navigation.teacherLogin': 'Connexion Enseignant',
    'login.student.title': 'Connexion Étudiant',
    'login.student.subtitle': 'Entrez vos informations pour accéder au tableau de bord',
    'login.student.fullName': 'Nom Complet',
    'login.student.school': 'École',
    'login.student.grade': 'Niveau',
    'login.student.password': 'Mot de Passe',
    'login.student.login': 'Se Connecter',
    'login.student.signup': 'S\'inscrire',
    'login.student.signingIn': 'Connexion...',
    'login.student.signingUp': 'Inscription...',
    'login.teacher.title': 'Connexion Enseignant',
    'login.teacher.subtitle': 'Connectez-vous pour accéder à votre tableau de bord enseignant',
    'login.teacher.login': 'Se Connecter',
    'login.teacher.signup': 'S\'inscrire',
    'login.teacher.email': 'Adresse Email',
    'login.teacher.password': 'Mot de Passe',
    'login.teacher.fullName': 'Nom Complet',
    'login.teacher.school': 'École',
    'login.teacher.confirmPassword': 'Confirmer le Mot de Passe',
    'login.teacher.createAccount': 'Créer un Compte',
    'login.teacher.loggingIn': 'Connexion...',
    'login.teacher.creatingAccount': 'Création du Compte...',
    'login.teacher.role': 'Rôle',
    'login.teacher.roleTeacher': 'Enseignant',
    'login.teacher.roleAdmin': 'Administrateur scolaire',
    'login.teacher.adminHint': 'Les administrateurs scolaires peuvent gérer les enseignants et consulter tous les commentaires',
    
    // Admin dashboard translations
    'admin.title': 'Tableau de Bord d\'Administration Scolaire',
    'admin.welcome': 'Bienvenue',
    'admin.logout': 'Déconnexion',
    'admin.loading': 'Chargement du tableau de bord...',
    'admin.stats.teachers': 'Total des Enseignants',
    'admin.stats.feedback': 'Total des Commentaires',
    'admin.subscription': 'Abonnement',
    'admin.subscribe': 'S\'abonner Maintenant',
    'admin.teachers.title': 'Enseignants à',
    'admin.teachers.description': 'Gérer les enseignants de votre école',
    'admin.teachers.empty': 'Aucun enseignant trouvé',
    'admin.feedback.title': 'Résumé des Commentaires',
    'admin.feedback.description': 'Aperçu des commentaires des élèves par enseignant et par classe',
    'admin.feedback.empty': 'Aucune donnée de commentaire disponible pour le moment',
    'admin.feedback.teacher': 'Enseignant',
    'admin.feedback.subject': 'Matière',
    'admin.feedback.date': 'Date',
    'admin.feedback.scores': 'Scores',
    'admin.feedback.understanding': 'Compréhension',
    'admin.feedback.interest': 'Intérêt',
    'admin.feedback.growth': 'Progrès',
    'admin.feedback.count': '{count} réponses',
    'admin.error.title': 'Erreur de chargement des données',
    'admin.error.description': 'Échec du chargement des données du tableau de bord',
    'admin.payment.error.title': 'Erreur de Paiement',
    'admin.payment.error.description': 'Échec de la création de l\'abonnement. Veuillez réessayer.',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>(localStorage.getItem('language') || 'en');

  React.useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key: string) => {
    return translations[language as keyof typeof translations][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
