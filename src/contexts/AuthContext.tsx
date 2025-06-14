
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, AuthContextType, SecurityEvent } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';
import { teacherEmailLoginService, teacherSignupService, studentSimpleLoginService, studentSignupService } from '@/services/authService';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>();

  // Initialize security monitoring
  useEffect(() => {
    securityService.monitorSecurityViolations();
    
    // Generate initial CSRF token
    const token = securityService.generateCSRFToken();
    setCsrfToken(token);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Starting secure initialization...');
      
      try {
        // Check session validity
        const isValidSession = await securityService.validateSession();
        if (!isValidSession) {
          console.log('Invalid session, clearing auth state');
          setIsLoading(false);
          return;
        }

        // Restore teacher from localStorage
        const savedTeacher = localStorage.getItem('teacher');
        if (savedTeacher) {
          try {
            const parsedTeacher = JSON.parse(savedTeacher);
            if (parsedTeacher && parsedTeacher.id && parsedTeacher.name) {
              setTeacher(parsedTeacher);
              
              securityService.logSecurityEvent({
                type: 'session_restored',
                userId: parsedTeacher.id,
                timestamp: new Date().toISOString(),
                details: 'Teacher session restored',
                userAgent: navigator.userAgent
              });
            }
          } catch (error) {
            console.error('Error parsing saved teacher:', error);
            localStorage.removeItem('teacher');
          }
        }

        // Restore student from localStorage
        const savedStudent = localStorage.getItem('student');
        if (savedStudent) {
          try {
            const parsedStudent = JSON.parse(savedStudent);
            if (parsedStudent && parsedStudent.id && parsedStudent.full_name) {
              setStudent(parsedStudent);
              
              securityService.logSecurityEvent({
                type: 'session_restored',
                userId: parsedStudent.id,
                timestamp: new Date().toISOString(),
                details: 'Student session restored',
                userAgent: navigator.userAgent
              });
            }
          } catch (error) {
            console.error('Error parsing saved student:', error);
            localStorage.removeItem('student');
          }
        }
        
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        securityService.logSecurityEvent({
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

  // Teacher login function
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ): Promise<{ teacher?: Teacher; error?: string }> => {
    console.log('AuthContext: Teacher login attempt for:', email);
    
    // If name and school are provided, this is a signup request
    if (name && school) {
      return await teacherSignup(name, email, school, password, role);
    }
    
    // Validate session
    const isValidSession = await securityService.validateSession();
    if (!isValidSession) {
      return { error: 'Session invalid. Please refresh and try again.' };
    }
    
    // Check rate limiting
    const rateLimitCheck = await securityService.checkRateLimit(email, 'teacher-login');
    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.message };
    }

    try {
      const result = await teacherEmailLoginService(email, password);

      const success = !!result.teacher;
      await securityService.recordAttempt(email, 'teacher-login', success);

      if (result.error) {
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Teacher login failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
        return { error: result.error };
      }
      
      if (result.teacher) {
        const teacher: Teacher = {
          ...result.teacher,
          role: result.teacher.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacher);
        setStudent(null); // Clear student state
        
        // Save to localStorage
        localStorage.setItem('teacher', JSON.stringify(teacher));
        localStorage.removeItem('student');
        
        securityService.logSecurityEvent({
          type: 'login_success',
          userId: teacher.id,
          timestamp: new Date().toISOString(),
          details: 'Teacher login successful',
          userAgent: navigator.userAgent
        });
        
        return { teacher };
      }

      return { error: 'Unknown error occurred' };
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      await securityService.recordAttempt(email, 'teacher-login', false);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Separate teacher signup function
  const teacherSignup = async (
    name: string,
    email: string,
    school: string,
    password: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ): Promise<{ teacher?: Teacher; error?: string }> => {
    console.log('AuthContext: Teacher signup attempt for:', name);
    
    // Check rate limiting for signups
    const rateLimitCheck = await securityService.checkRateLimit(email, 'teacher-signup', {
      maxAttempts: 3,
      windowMinutes: 60
    });
    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.message };
    }
    
    try {
      const result = await teacherSignupService(name, email, school, password, role);

      const success = !!result.teacher;
      await securityService.recordAttempt(email, 'teacher-signup', success);

      if (result.error) {
        console.log('AuthContext: Teacher signup failed:', result.error);
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Teacher signup failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
        return { error: result.error };
      }
      
      if (result.teacher) {
        const teacher: Teacher = {
          ...result.teacher,
          role: result.teacher.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacher);
        setStudent(null); // Clear student state
        
        // Save to localStorage
        localStorage.setItem('teacher', JSON.stringify(teacher));
        localStorage.removeItem('student');
        
        securityService.logSecurityEvent({
          type: 'login_success',
          userId: teacher.id,
          timestamp: new Date().toISOString(),
          details: 'Teacher signup successful',
          userAgent: navigator.userAgent
        });
        
        return { teacher };
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Teacher signup error:', error);
      await securityService.recordAttempt(email, 'teacher-signup', false);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  // Student login
  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student login attempt for:', fullName);
    
    // Validate session
    const isValidSession = await securityService.validateSession();
    if (!isValidSession) {
      return { error: 'Session invalid. Please refresh and try again.' };
    }
    
    // Check rate limiting
    const identifier = `${fullName}-${school}-${grade}`;
    const rateLimitCheck = await securityService.checkRateLimit(identifier, 'student-login');
    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.message };
    }

    try {
      const result = await studentSimpleLoginService(fullName, password);
      
      const success = !!result.student;
      await securityService.recordAttempt(identifier, 'student-login', success);

      if (result.error) {
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Student login failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
        return { error: result.error };
      }
      
      if (result.student) {
        const student: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(student);
        setTeacher(null); // Clear teacher state
        
        // Save to localStorage
        localStorage.setItem('student', JSON.stringify(student));
        localStorage.removeItem('teacher');
        
        securityService.logSecurityEvent({
          type: 'login_success',
          userId: student.id,
          timestamp: new Date().toISOString(),
          details: 'Student login successful',
          userAgent: navigator.userAgent
        });
        
        return { student };
      }

      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Student login error:', error);
      await securityService.recordAttempt(identifier, 'student-login', false);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Student signup
  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt for:', fullName);
    
    // Check rate limiting for signups
    const identifier = `${fullName}-${school}`;
    const rateLimitCheck = await securityService.checkRateLimit(identifier, 'student-signup', {
      maxAttempts: 3,
      windowMinutes: 60
    });
    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.message };
    }
    
    try {
      const result = await studentSignupService(fullName, school, grade, password);

      const success = !!result.student;
      await securityService.recordAttempt(identifier, 'student-signup', success);

      if (result.error) {
        console.log('AuthContext: Student signup failed:', result.error);
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Student signup failed: ${result.error}`,
          userAgent: navigator.userAgent
        });
        return { error: result.error };
      }
      
      if (result.student) {
        const student: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(student);
        setTeacher(null); // Clear teacher state
        
        // Save to localStorage
        localStorage.setItem('student', JSON.stringify(student));
        localStorage.removeItem('teacher');
        
        securityService.logSecurityEvent({
          type: 'login_success',
          userId: student.id,
          timestamp: new Date().toISOString(),
          details: 'Student signup successful',
          userAgent: navigator.userAgent
        });
        
        return { student };
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      await securityService.recordAttempt(identifier, 'student-signup', false);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  // Enhanced secure logout
  const logout = async () => {
    console.log('AuthContext: Secure logout initiated');
    
    const currentUser = teacher || student;
    if (currentUser) {
      securityService.logSecurityEvent({
        type: 'logout',
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: 'User logout',
        userAgent: navigator.userAgent
      });
    }

    // Clear auth state
    setTeacher(null);
    setStudent(null);
    
    // Clear localStorage
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
    
    // Clear session securely
    await securityService.clearSession();
    
    // Regenerate CSRF token
    const newToken = securityService.generateCSRFToken();
    setCsrfToken(newToken);
  };

  const contextValue: AuthContextType = {
    teacher,
    student,
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
