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
