
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthStorage } from '@/hooks/useAuthStorage';
import { teacherLoginService, studentSimpleLoginService, studentSignupService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { teacher, student, isLoading, saveTeacher, saveStudent, clearAuth } = useAuthStorage();

  console.log('AuthContext: Rendering with state:', { 
    hasTeacher: !!teacher, 
    hasStudent: !!student, 
    isLoading 
  });

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin'
  ) => {
    console.log('AuthContext: Teacher login attempt for:', email);
    
    try {
      const result = await teacherLoginService(email, password, name, school, role);
      console.log('AuthContext: Teacher login service result:', result.teacher ? 'SUCCESS' : 'FAILED');
      
      if (result.teacher) {
        saveTeacher(result.teacher);
        return { teacher: result.teacher };
      }
      
      return { error: result.error || 'Login failed' };
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      return { error: 'An unexpected error occurred during login' };
    }
  };

  const studentLogin = async (fullName: string, password: string) => {
    console.log('AuthContext: Student login attempt for:', fullName);
    
    try {
      const result = await studentSimpleLoginService(fullName, password);
      console.log('AuthContext: Student login service result:', result.student ? 'SUCCESS' : 'FAILED');
      
      if (result.student) {
        saveStudent(result.student);
        return { student: result.student };
      }
      
      return { error: result.error || 'Login failed' };
    } catch (error) {
      console.error('AuthContext: Student login error:', error);
      return { error: 'An unexpected error occurred during login' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt for:', fullName);
    
    try {
      const result = await studentSignupService(fullName, school, grade, password);
      console.log('AuthContext: Student signup service result:', result.student ? 'SUCCESS' : 'FAILED');
      
      if (result.student) {
        saveStudent(result.student);
        return { student: result.student };
      }
      
      return { error: result.error || 'Signup failed' };
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      return { error: 'An unexpected error occurred during signup' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    clearAuth();
  };

  const value: AuthContextType = {
    teacher,
    student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
