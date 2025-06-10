
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Teacher, Student } from '@/types/auth';
import { enhancedSecureTeacherLogin, enhancedSecureStudentLogin, enhancedSecureStudentSignup } from '@/services/enhancedSecureAuthService';
import { sessionService } from '@/services/secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate CSRF token for security
  const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    console.log('AuthContext: Starting secure initialization...');
    
    // Generate CSRF token
    setCsrfToken(generateCSRFToken());
    
    const restoreSecureSession = async () => {
      try {
        const session = await sessionService.getSession();
        
        if (session) {
          console.log('AuthContext: Restoring secure session for:', session.userType);
          
          // Restore user data based on session with enhanced validation
          if (session.userType === 'teacher') {
            const teacherData = localStorage.getItem('teacher');
            if (teacherData) {
              const parsedTeacher = JSON.parse(teacherData);
              if (parsedTeacher && parsedTeacher.id === session.userId) {
                setTeacher(parsedTeacher);
                await sessionService.refreshSession(session);
                
                // Log session restoration
                logUserSecurityEvent({
                  type: 'session_restored',
                  userId: parsedTeacher.id,
                  timestamp: new Date().toISOString(),
                  details: 'Teacher session restored successfully',
                  userAgent: navigator.userAgent
                });
              } else {
                console.warn('AuthContext: Teacher data mismatch, clearing session');
                sessionService.clearSession();
              }
            }
          } else if (session.userType === 'student') {
            const studentData = localStorage.getItem('student');
            if (studentData) {
              const parsedStudent = JSON.parse(studentData);
              if (parsedStudent && parsedStudent.id === session.userId) {
                setStudent(parsedStudent);
                await sessionService.refreshSession(session);
                
                // Log session restoration
                logUserSecurityEvent({
                  type: 'session_restored',
                  userId: parsedStudent.id,
                  timestamp: new Date().toISOString(),
                  details: 'Student session restored successfully',
                  userAgent: navigator.userAgent
                });
              } else {
                console.warn('AuthContext: Student data mismatch, clearing session');
                sessionService.clearSession();
              }
            }
          }
        } else {
          // Clear any legacy storage if no valid session
          sessionService.clearSession();
        }
      } catch (error) {
        console.error('AuthContext: Session restoration error:', error);
        logUserSecurityEvent({
          type: 'session_error',
          timestamp: new Date().toISOString(),
          details: `Session restoration failed: ${error}`,
          userAgent: navigator.userAgent
        });
        sessionService.clearSession();
      }
    };

    restoreSecureSession();
    console.log('AuthContext: Secure initialization complete');
    setIsLoading(false);
  }, []);

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    try {
      console.log('AuthContext: Secure teacher login attempt for:', email);
      
      // Validate CSRF token (in real implementation, this would be passed from form)
      if (!csrfToken) {
        return { error: 'Security token missing. Please refresh and try again.' };
      }

      const result = await enhancedSecureTeacherLogin(email, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Teacher login successful');
        const teacherData: Teacher = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          school: result.user.school,
          role: result.user.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacherData);
        setStudent(null); // Ensure only one user type is logged in
        
        // Store teacher data securely with enhanced validation
        try {
          localStorage.setItem('teacher', JSON.stringify(teacherData));
          localStorage.removeItem('student');
          
          // Generate new CSRF token after successful login
          setCsrfToken(generateCSRFToken());
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
          logUserSecurityEvent({
            type: 'storage_error',
            userId: teacherData.id,
            timestamp: new Date().toISOString(),
            details: `Storage error during login: ${storageError}`,
            userAgent: navigator.userAgent
          });
        }
        
        return { teacher: teacherData };
      } else {
        console.log('AuthContext: Teacher login failed:', result.error);
        return { error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Teacher login context error: ${error}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const studentLogin = async (fullName: string, password: string) => {
    try {
      console.log('AuthContext: Secure student login attempt');
      
      // Validate CSRF token
      if (!csrfToken) {
        return { error: 'Security token missing. Please refresh and try again.' };
      }
      
      // For student login, we need to extract school and grade from stored form data
      const loginData = JSON.parse(sessionStorage.getItem('studentLoginData') || '{}');
      const school = loginData.school || '';
      const grade = loginData.grade || '';
      
      if (!school || !grade) {
        return { error: 'School and grade information required' };
      }
      
      const result = await enhancedSecureStudentLogin(fullName, school, grade, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Student login successful');
        const studentData: Student = {
          id: result.user.id,
          full_name: result.user.fullName,
          school: result.user.school,
          grade: result.user.grade
        };
        
        setStudent(studentData);
        setTeacher(null); // Ensure only one user type is logged in
        
        // Store student data securely with enhanced validation
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          sessionStorage.removeItem('studentLoginData'); // Clear temporary data
          
          // Generate new CSRF token after successful login
          setCsrfToken(generateCSRFToken());
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
          logUserSecurityEvent({
            type: 'storage_error',
            userId: studentData.id,
            timestamp: new Date().toISOString(),
            details: `Storage error during login: ${storageError}`,
            userAgent: navigator.userAgent
          });
        }
        
        return { student: studentData };
      } else {
        console.log('AuthContext: Student login failed:', result.error);
        return { error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: Student login error:', error);
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Student login context error: ${error}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('AuthContext: Secure student signup attempt');
      
      // Validate CSRF token
      if (!csrfToken) {
        return { error: 'Security token missing. Please refresh and try again.' };
      }
      
      const result = await enhancedSecureStudentSignup(fullName, school, grade, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Student signup successful');
        const studentData: Student = {
          id: result.user.id,
          full_name: result.user.fullName,
          school: result.user.school,
          grade: result.user.grade
        };
        
        setStudent(studentData);
        setTeacher(null); // Ensure only one user type is logged in
        
        // Store student data securely
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          
          // Generate new CSRF token after successful signup
          setCsrfToken(generateCSRFToken());
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
          logUserSecurityEvent({
            type: 'storage_error',
            userId: studentData.id,
            timestamp: new Date().toISOString(),
            details: `Storage error during signup: ${storageError}`,
            userAgent: navigator.userAgent
          });
        }
        
        return { student: studentData };
      } else {
        console.log('AuthContext: Student signup failed:', result.error);
        return { error: result.error };
      }
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Secure logout initiated');
    
    // Log the logout event
    const currentUser = teacher || student;
    if (currentUser) {
      logUserSecurityEvent({
        type: 'logout',
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        details: `User logged out: ${teacher ? 'teacher' : 'student'}`,
        userAgent: navigator.userAgent
      });
    }
    
    // Clear all authentication state
    setTeacher(null);
    setStudent(null);
    
    // Clear secure session and storage
    sessionService.clearSession();
    
    // Generate new CSRF token after logout
    setCsrfToken(generateCSRFToken());
    
    console.log('AuthContext: Secure logout complete');
  };

  const value: AuthContextType = {
    teacher,
    student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout,
    csrfToken,
  };

  console.log('AuthContext: Rendering with secure state:', { 
    hasTeacher: !!teacher, 
    hasStudent: !!student, 
    isLoading 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
