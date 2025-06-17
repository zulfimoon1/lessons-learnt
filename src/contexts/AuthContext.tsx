
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { consolidatedAuthService } from '@/services/consolidatedAuthService';
import { secureSessionService } from '@/services/secureSessionService';

interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
  grade?: string;
}

interface AuthContextType {
  // Current authenticated users
  teacher: AuthUser | null;
  student: AuthUser | null;
  
  // Loading state
  isLoading: boolean;
  
  // Authentication methods
  teacherLogin: (email: string, password: string, name?: string, school?: string, role?: string) => Promise<{ teacher?: AuthUser; error?: string }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: AuthUser; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: AuthUser; error?: string }>;
  
  // Logout
  logout: () => void;
  
  // Session management
  refreshSession: () => boolean;
  isAuthenticated: () => boolean;
  getCSRFToken: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<AuthUser | null>(null);
  const [student, setStudent] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = consolidatedAuthService.getCurrentUser();
        
        if (currentUser) {
          if (currentUser.userType === 'teacher') {
            setTeacher(currentUser);
          } else if (currentUser.userType === 'student') {
            setStudent(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up session monitoring
    const sessionCheckInterval = setInterval(() => {
      const session = secureSessionService.getSecureSession();
      if (!session) {
        // Session expired, clear state
        setTeacher(null);
        setStudent(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, []);

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string, 
    role?: string
  ): Promise<{ teacher?: AuthUser; error?: string }> => {
    try {
      setIsLoading(true);

      let result;
      
      if (name && school) {
        // This is a signup request
        result = await consolidatedAuthService.secureSignup({
          userType: 'teacher',
          name,
          email,
          school,
          role: role || 'teacher',
          password
        });
      } else {
        // This is a login request
        result = await consolidatedAuthService.secureLogin({
          email,
          password,
          school: 'unknown', // Will be populated from database
          userType: 'teacher'
        });
      }

      if (result.success && result.user) {
        setTeacher(result.user);
        setStudent(null); // Clear any existing student session
        return { teacher: result.user };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const studentLogin = async (
    fullName: string, 
    school: string, 
    grade: string, 
    password: string
  ): Promise<{ student?: AuthUser; error?: string }> => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureLogin({
        fullName,
        school,
        grade,
        password,
        userType: 'student'
      });

      if (result.success && result.user) {
        setStudent(result.user);
        setTeacher(null); // Clear any existing teacher session
        return { student: result.user };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Student authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const studentSignup = async (
    fullName: string, 
    school: string, 
    grade: string, 
    password: string
  ): Promise<{ student?: AuthUser; error?: string }> => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureSignup({
        userType: 'student',
        fullName,
        school,
        grade,
        password
      });

      if (result.success && result.user) {
        setStudent(result.user);
        setTeacher(null); // Clear any existing teacher session
        return { student: result.user };
      } else {
        return { error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Student registration error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    consolidatedAuthService.logout();
    setTeacher(null);
    setStudent(null);
  };

  const refreshSession = (): boolean => {
    const currentUser = teacher || student;
    const isMentalHealthUser = currentUser?.role === 'doctor';
    return secureSessionService.refreshSession(isMentalHealthUser);
  };

  const isAuthenticated = (): boolean => {
    return consolidatedAuthService.isAuthenticated();
  };

  const getCSRFToken = (): string => {
    return secureSessionService.getCSRFToken();
  };

  const value: AuthContextType = {
    teacher,
    student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout,
    refreshSession,
    isAuthenticated,
    getCSRFToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
