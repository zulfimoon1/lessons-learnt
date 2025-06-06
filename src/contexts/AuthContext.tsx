
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
      console.log('AuthContext: Teacher login service result:', result);
      
      if (result.teacher) {
        console.log('AuthContext: Saving teacher to storage:', result.teacher);
        saveTeacher(result.teacher);
        console.log('AuthContext: Teacher saved successfully');
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
      console.log('AuthContext: Student login service result:', result);
      
      if (result.student) {
        console.log('AuthContext: Saving student to storage:', result.student);
        saveStudent(result.student);
        console.log('AuthContext: Student saved successfully');
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
      console.log('AuthContext: Student signup service result:', result);
      
      if (result.student) {
        console.log('AuthContext: Saving student to storage after signup:', result.student);
        saveStudent(result.student);
        console.log('AuthContext: Student saved after signup successfully');
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

  console.log('AuthContext: Providing context with values:', { 
    hasTeacher: !!teacher, 
    hasStudent: !!student, 
    isLoading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
