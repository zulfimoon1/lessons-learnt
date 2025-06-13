
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, AuthContextType, SecurityEvent } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';
import { teacherEmailLoginService, studentSimpleLoginService, teacherSignupService, studentSignupService } from '@/services/authService';

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
      console.log('AuthContext: Starting initialization...');
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Restore user data based on user metadata or database lookup
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (teacherData) {
          const teacher: Teacher = {
            id: teacherData.id,
            name: teacherData.name,
            email: teacherData.email,
            school: teacherData.school,
            role: teacherData.role as 'teacher' | 'admin' | 'doctor',
            specialization: teacherData.specialization,
            license_number: teacherData.license_number,
            is_available: teacherData.is_available
          };
          setTeacher(teacher);
          
          securityService.logSecurityEvent({
            type: 'session_restored',
            userId: teacher.id,
            timestamp: new Date().toISOString(),
            details: 'Teacher session restored',
            userAgent: navigator.userAgent
          });
        } else {
          // Check for student
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (studentData) {
            const student: Student = {
              id: studentData.id,
              full_name: studentData.full_name,
              school: studentData.school,
              grade: studentData.grade
            };
            setStudent(student);
            
            securityService.logSecurityEvent({
              type: 'session_restored',
              userId: student.id,
              timestamp: new Date().toISOString(),
              details: 'Student session restored',
              userAgent: navigator.userAgent
            });
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
        console.log('AuthContext: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Simplified teacher login without session validation
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ): Promise<{ teacher?: Teacher; error?: string }> => {
    console.log('AuthContext: Teacher login attempt');
    
    // Check rate limiting
    const rateLimitCheck = await securityService.checkRateLimit(email, 'teacher-login');
    if (!rateLimitCheck.allowed) {
      return { error: rateLimitCheck.message };
    }

    try {
      const result = name && school 
        ? await teacherSignupService(name, email, school, password, role)
        : await teacherEmailLoginService(email, password);

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

  // Simplified student login
  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student login attempt');
    
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

  // Enhanced student signup
  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt');
    
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
    console.log('AuthContext: Logout initiated');
    
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
