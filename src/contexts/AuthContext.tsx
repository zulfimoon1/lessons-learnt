
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { enhancedSecureTeacherLogin, enhancedSecureStudentLogin, enhancedSecureStudentSignup } from '@/services/enhancedSecureAuthService';
import { sessionService } from '@/services/secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Starting secure initialization...');
    
    const restoreSecureSession = () => {
      try {
        const session = sessionService.getSession();
        
        if (session) {
          console.log('AuthContext: Restoring secure session for:', session.userType);
          
          // Restore user data based on session
          if (session.userType === 'teacher') {
            const teacherData = localStorage.getItem('teacher');
            if (teacherData) {
              const parsedTeacher = JSON.parse(teacherData);
              if (parsedTeacher && parsedTeacher.id === session.userId) {
                setTeacher(parsedTeacher);
                sessionService.refreshSession(session);
              } else {
                sessionService.clearSession();
              }
            }
          } else if (session.userType === 'student') {
            const studentData = localStorage.getItem('student');
            if (studentData) {
              const parsedStudent = JSON.parse(studentData);
              if (parsedStudent && parsedStudent.id === session.userId) {
                setStudent(parsedStudent);
                sessionService.refreshSession(session);
              } else {
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
      
      const result = await enhancedSecureTeacherLogin(email, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Teacher login successful');
        setTeacher(result.user);
        setStudent(null); // Ensure only one user type is logged in
        
        // Store teacher data securely
        try {
          localStorage.setItem('teacher', JSON.stringify(result.user));
          localStorage.removeItem('student');
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
        }
        
        return { teacher: result.user };
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
      
      // For student login, we need to extract school and grade from stored form data
      // In a real implementation, this would be handled by the login form
      const loginData = JSON.parse(sessionStorage.getItem('studentLoginData') || '{}');
      const school = loginData.school || '';
      const grade = loginData.grade || '';
      
      if (!school || !grade) {
        return { error: 'School and grade information required' };
      }
      
      const result = await enhancedSecureStudentLogin(fullName, school, grade, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Student login successful');
        setStudent(result.user);
        setTeacher(null); // Ensure only one user type is logged in
        
        // Store student data securely
        try {
          localStorage.setItem('student', JSON.stringify(result.user));
          localStorage.removeItem('teacher');
          sessionStorage.removeItem('studentLoginData'); // Clear temporary data
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
        }
        
        return { student: result.user };
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
      
      const result = await enhancedSecureStudentSignup(fullName, school, grade, password);
      
      if (result.user && !result.error) {
        console.log('AuthContext: Student signup successful');
        setStudent(result.user);
        setTeacher(null); // Ensure only one user type is logged in
        
        // Store student data securely
        try {
          localStorage.setItem('student', JSON.stringify(result.user));
          localStorage.removeItem('teacher');
        } catch (storageError) {
          console.error('AuthContext: Storage error:', storageError);
        }
        
        return { student: result.user };
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
