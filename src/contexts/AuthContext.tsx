
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
    console.log('AuthContext: Teacher login attempt');
    const result = await teacherLoginService(email, password, name, school, role);
    console.log('AuthContext: Teacher login result:', result);
    
    if (result.teacher) {
      console.log('AuthContext: Saving teacher to storage');
      saveTeacher(result.teacher);
    }
    return result;
  };

  const studentLogin = async (fullName: string, password: string) => {
    console.log('AuthContext: Student login attempt');
    const result = await studentSimpleLoginService(fullName, password);
    console.log('AuthContext: Student login result:', result);
    
    if (result.student) {
      console.log('AuthContext: Saving student to storage');
      saveStudent(result.student);
    }
    return result;
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt');
    const result = await studentSignupService(fullName, school, grade, password);
    console.log('AuthContext: Student signup result:', result);
    
    if (result.student) {
      console.log('AuthContext: Saving student to storage');
      saveStudent(result.student);
    }
    return result;
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        student,
        isLoading,
        teacherLogin,
        studentLogin,
        studentSignup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
