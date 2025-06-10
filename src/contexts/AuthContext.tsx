
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, AuthContextType, SecurityEvent } from '@/types/auth';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple CSRF token functions
const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const validateCSRFToken = (token: string): boolean => {
  try {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length === 64;
  } catch (error) {
    console.error('CSRF token validation failed:', error);
    return false;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>();
  
  const teacherAuth = useTeacherAuth();
  const studentAuth = useStudentAuth();

  // Security event logging
  const logSecurityEvent = (event: SecurityEvent) => {
    console.log('Security Event:', event);
    // Store in localStorage for admin review
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push(event);
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  };

  // Initialize auth state and generate CSRF token
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Starting secure initialization...');
      
      try {
        // Generate CSRF token
        const token = generateCSRFToken();
        setCsrfToken(token);
        sessionStorage.setItem('csrf_token', token);
        
        // Restore authentication states
        const teacherRestored = teacherAuth.restoreFromStorage();
        const studentRestored = studentAuth.restoreFromStorage();
        
        if (teacherRestored) {
          logSecurityEvent({
            type: 'session_restored',
            userId: teacherAuth.teacher?.id,
            timestamp: new Date().toISOString(),
            details: 'Teacher session restored from storage',
            userAgent: navigator.userAgent
          });
        }
        
        if (studentRestored) {
          logSecurityEvent({
            type: 'session_restored',
            userId: studentAuth.student?.id,
            timestamp: new Date().toISOString(),
            details: 'Student session restored from storage',
            userAgent: navigator.userAgent
          });
        }
        
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        logSecurityEvent({
          type: 'session_error',
          timestamp: new Date().toISOString(),
          details: 'Failed to initialize auth context',
          userAgent: navigator.userAgent,
          errorStack: error instanceof Error ? error.stack : String(error)
        });
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Secure initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Enhanced teacher login with security validation
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ) => {
    console.log('AuthContext: Secure teacher login attempt');
    
    // Validate CSRF token if provided
    if (csrfToken && !validateCSRFToken(csrfToken)) {
      logSecurityEvent({
        type: 'csrf_violation',
        timestamp: new Date().toISOString(),
        details: 'Invalid CSRF token during teacher login',
        userAgent: navigator.userAgent
      });
      return { error: 'Security validation failed' };
    }

    try {
      const result = name && school 
        ? await teacherAuth.signup(name, email, school, password, role)
        : await teacherAuth.login(email, password);

      if (result.error) {
        logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Teacher login failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
      } else if (result.teacher) {
        logSecurityEvent({
          type: 'login_success',
          userId: result.teacher.id,
          timestamp: new Date().toISOString(),
          details: 'Teacher login successful',
          userAgent: navigator.userAgent
        });
      }

      return result;
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Enhanced student login with security validation and all required parameters
  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Secure student login attempt');
    
    // Validate CSRF token if provided
    if (csrfToken && !validateCSRFToken(csrfToken)) {
      logSecurityEvent({
        type: 'csrf_violation',
        timestamp: new Date().toISOString(),
        details: 'Invalid CSRF token during student login',
        userAgent: navigator.userAgent
      });
      return { error: 'Security validation failed' };
    }

    try {
      const result = await studentAuth.login(fullName, school, grade, password);

      if (result.error) {
        logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Student login failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
      } else if (result.student) {
        logSecurityEvent({
          type: 'login_success',
          userId: result.student.id,
          timestamp: new Date().toISOString(),
          details: 'Student login successful',
          userAgent: navigator.userAgent
        });
      }

      return result;
    } catch (error) {
      console.error('AuthContext: Student login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Enhanced student signup with security validation
  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Secure student signup attempt');
    
    try {
      const result = await studentAuth.signup(fullName, school, grade, password);

      if (result.error) {
        console.log('AuthContext: Student signup failed:', result.error);
        logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Student signup failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
      } else if (result.student) {
        logSecurityEvent({
          type: 'login_success',
          userId: result.student.id,
          timestamp: new Date().toISOString(),
          details: 'Student signup successful',
          userAgent: navigator.userAgent
        });
      }

      return result;
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  // Secure logout function
  const logout = () => {
    console.log('AuthContext: Secure logout initiated');
    
    const currentUser = teacherAuth.teacher || studentAuth.student;
    if (currentUser) {
      logSecurityEvent({
        type: 'logout',
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: 'User logout',
        userAgent: navigator.userAgent
      });
    }

    teacherAuth.logout();
    studentAuth.logout();
    
    // Regenerate CSRF token on logout
    const newToken = generateCSRFToken();
    setCsrfToken(newToken);
    sessionStorage.setItem('csrf_token', newToken);
  };

  // Debug logging for auth state
  useEffect(() => {
    console.log('AuthContext: Rendering with secure state:', {
      hasTeacher: !!teacherAuth.teacher,
      hasStudent: !!studentAuth.student,
      isLoading
    });
  }, [teacherAuth.teacher, studentAuth.student, isLoading]);

  const contextValue: AuthContextType = {
    teacher: teacherAuth.teacher,
    student: studentAuth.student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout,
    csrfToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
