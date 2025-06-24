
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { loginTeacher, signupTeacher, loginStudent, signupStudent } from '@/services/authIntegrationService';
import { logCoreSystemStatus } from '@/utils/coreSystemsChecker';

// Safe Auth Context that preserves functionality during changes
const SafeAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSafeAuth = () => {
  const context = useContext(SafeAuthContext);
  if (!context) {
    // Fallback behavior instead of throwing
    console.error('useSafeAuth must be used within a SafeAuthProvider, using fallback');
    return {
      teacher: null,
      student: null,
      isLoading: false,
      teacherLogin: async () => ({ error: 'Auth context not available' }),
      studentLogin: async () => ({ error: 'Auth context not available' }),
      studentSignup: async () => ({ error: 'Auth context not available' }),
      logout: () => {},
      csrfToken: '',
      setTeacher: () => {},
      setStudent: () => {},
    } as AuthContextType;
  }
  return context;
};

export const SafeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken] = useState(() => Math.random().toString(36).substring(2));

  // Enhanced initialization with error recovery
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 SafeAuth: Starting secure initialization...');
        logCoreSystemStatus();
        
        const savedTeacher = localStorage.getItem('teacher');
        const savedStudent = localStorage.getItem('student');
        
        if (savedTeacher) {
          try {
            const parsedTeacher = JSON.parse(savedTeacher);
            if (parsedTeacher && parsedTeacher.id) {
              setTeacher(parsedTeacher);
              console.log('🔐 Teacher session restored:', parsedTeacher.email);
            }
          } catch (parseError) {
            console.warn('Failed to parse teacher data, clearing:', parseError);
            localStorage.removeItem('teacher');
          }
        } else if (savedStudent) {
          try {
            const parsedStudent = JSON.parse(savedStudent);
            if (parsedStudent && parsedStudent.id) {
              setStudent(parsedStudent);
              console.log('🔐 Student session restored:', parsedStudent.full_name);
            }
          } catch (parseError) {
            console.warn('Failed to parse student data, clearing:', parseError);
            localStorage.removeItem('student');
          }
        }
      } catch (error) {
        console.error('SafeAuth: Critical initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('teacher');
        localStorage.removeItem('student');
      } finally {
        setIsLoading(false);
        console.log('🔐 SafeAuth: Secure initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Safe login methods with preserved functionality
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    try {
      console.log('SafeAuth: Teacher login attempt for:', email);
      const result = await loginTeacher(email, password);
      
      if (result.teacher) {
        const mappedTeacher: Teacher = {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          school: result.teacher.school,
          role: result.teacher.role,
          specialization: result.teacher.specialization,
          is_available: result.teacher.is_available
        };
        
        setTeacher(mappedTeacher);
        setStudent(null);
        
        try {
          localStorage.setItem('teacher', JSON.stringify(mappedTeacher));
          localStorage.removeItem('student');
        } catch (storageError) {
          console.warn('Storage error during teacher login:', storageError);
        }
        
        console.log('SafeAuth: Teacher login successful');
        return { teacher: mappedTeacher };
      }
      
      console.log('SafeAuth: Teacher login failed:', result.error);
      return { error: result.error };
    } catch (error) {
      console.error('SafeAuth: Teacher authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    }
  };

  const studentLoginMethod = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('SafeAuth: Student login attempt for:', fullName);
      const result = await loginStudent(fullName, school, grade, password);
      
      if ('student' in result && result.student) {
        setStudent(result.student);
        setTeacher(null);
        
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          localStorage.removeItem('teacher');
        } catch (storageError) {
          console.warn('Storage error during student login:', storageError);
        }
        
        console.log('SafeAuth: Student login successful');
        return { student: result.student };
      }
      
      const errorMessage = 'error' in result ? result.error : 'Login failed. Please try again.';
      console.log('SafeAuth: Student login failed:', errorMessage);
      return { error: errorMessage };
    } catch (error) {
      console.error('SafeAuth: Student authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    }
  };

  const studentSignupMethod = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('SafeAuth: Student signup attempt for:', fullName);
      const result = await signupStudent(fullName, school, grade, password);
      
      if ('student' in result && result.student) {
        setStudent(result.student);
        setTeacher(null);
        
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          localStorage.removeItem('teacher');
        } catch (storageError) {
          console.warn('Storage error during student signup:', storageError);
        }
        
        console.log('SafeAuth: Student signup successful');
        return { student: result.student };
      }
      
      const errorMessage = 'error' in result ? result.error : 'Signup failed. Please try again.';
      return { error: errorMessage };
    } catch (error) {
      console.error('SafeAuth: Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('SafeAuth: Logging out');
    setTeacher(null);
    setStudent(null);
    try {
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
      localStorage.removeItem('platformAdmin');
    } catch (error) {
      console.warn('Storage error during logout:', error);
    }
  };

  const value: AuthContextType = {
    teacher,
    student,
    isLoading,
    teacherLogin,
    studentLogin: studentLoginMethod,
    studentSignup: studentSignupMethod,
    logout,
    csrfToken,
    setTeacher,
    setStudent,
  };

  return <SafeAuthContext.Provider value={value}>{children}</SafeAuthContext.Provider>;
};
