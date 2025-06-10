
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, AuthContextType, SecurityEvent } from '@/types/auth';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { secureSessionService } from '@/services/secureSessionService';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced CSRF token functions with stronger security
const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const validateCSRFToken = (token: string): boolean => {
  try {
    const storedToken = sessionStorage.getItem('csrf_token');
    const tokenTimestamp = sessionStorage.getItem('csrf_token_timestamp');
    
    if (!storedToken || !tokenTimestamp) return false;
    
    // Check if token is expired (1 hour)
    const now = Date.now();
    const tokenAge = now - parseInt(tokenTimestamp);
    if (tokenAge > 60 * 60 * 1000) {
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('csrf_token_timestamp');
      return false;
    }
    
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

  // Enhanced security event logging
  const logSecurityEvent = (event: SecurityEvent) => {
    console.log('Security Event:', event);
    
    // Store in localStorage for admin review with size limits
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push({
        ...event,
        sessionId: sessionStorage.getItem('session_id'),
        fingerprint: sessionStorage.getItem('session_fingerprint')
      });
      
      // Keep only last 100 events to prevent storage overflow
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  };

  // Initialize auth state with enhanced security
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Starting enhanced secure initialization...');
      
      try {
        // Check for concurrent sessions
        if (secureSessionService.detectConcurrentSessions()) {
          logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: 'Concurrent session detected during initialization',
            userAgent: navigator.userAgent
          });
        }
        
        // Validate session
        if (!secureSessionService.checkSessionValidity()) {
          console.log('Session invalid, clearing auth state');
          setIsLoading(false);
          return;
        }
        
        // Generate enhanced CSRF token
        const token = generateCSRFToken();
        setCsrfToken(token);
        sessionStorage.setItem('csrf_token', token);
        sessionStorage.setItem('csrf_token_timestamp', Date.now().toString());
        
        // Restore authentication states using secure storage
        const teacherData = secureSessionService.securelyRetrieveUserData('teacher');
        const studentData = secureSessionService.securelyRetrieveUserData('student');
        
        if (teacherData && teacherData.id && teacherData.name) {
          teacherAuth.setTeacher(teacherData);
          logSecurityEvent({
            type: 'session_restored',
            userId: teacherData.id,
            timestamp: new Date().toISOString(),
            details: 'Teacher session restored from secure storage',
            userAgent: navigator.userAgent
          });
        }
        
        if (studentData && studentData.id && studentData.full_name) {
          studentAuth.setStudent(studentData);
          logSecurityEvent({
            type: 'session_restored',
            userId: studentData.id,
            timestamp: new Date().toISOString(),
            details: 'Student session restored from secure storage',
            userAgent: navigator.userAgent
          });
        }
        
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        logSecurityEvent({
          type: 'session_error',
          timestamp: new Date().toISOString(),
          details: 'Failed to initialize enhanced auth context',
          userAgent: navigator.userAgent,
          errorStack: error instanceof Error ? error.stack : String(error)
        });
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Enhanced secure initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Enhanced teacher login with additional security validation
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ): Promise<{ teacher?: Teacher; error?: string }> => {
    console.log('AuthContext: Enhanced secure teacher login attempt');
    
    // Validate session before login
    if (!secureSessionService.checkSessionValidity()) {
      return { error: 'Session invalid. Please refresh and try again.' };
    }
    
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
        return { error: result.error };
      } else if (result.teacher) {
        // Store user data securely
        secureSessionService.securelyStoreUserData('teacher', result.teacher);
        
        logSecurityEvent({
          type: 'login_success',
          userId: result.teacher.id,
          timestamp: new Date().toISOString(),
          details: 'Teacher login successful',
          userAgent: navigator.userAgent
        });
        
        return { teacher: result.teacher };
      }

      return { error: 'Unknown error occurred' };
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Enhanced student login with all required parameters and security validation
  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Enhanced secure student login attempt');
    
    // Validate session before login
    if (!secureSessionService.checkSessionValidity()) {
      return { error: 'Session invalid. Please refresh and try again.' };
    }
    
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
        // Store user data securely
        secureSessionService.securelyStoreUserData('student', result.student);
        
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
    console.log('AuthContext: Enhanced secure student signup attempt');
    
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
        // Store user data securely
        secureSessionService.securelyStoreUserData('student', result.student);
        
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

  // Enhanced secure logout function
  const logout = () => {
    console.log('AuthContext: Enhanced secure logout initiated');
    
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

    // Clear auth hooks
    teacherAuth.logout();
    studentAuth.logout();
    
    // Clear all session data securely
    localStorage.clear();
    sessionStorage.clear();
    
    // Regenerate CSRF token on logout
    const newToken = generateCSRFToken();
    setCsrfToken(newToken);
    sessionStorage.setItem('csrf_token', newToken);
    sessionStorage.setItem('csrf_token_timestamp', Date.now().toString());
  };

  // Debug logging for auth state
  useEffect(() => {
    console.log('AuthContext: Rendering with enhanced secure state:', {
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
