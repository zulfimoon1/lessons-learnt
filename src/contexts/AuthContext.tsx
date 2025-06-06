
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthStorage } from '@/hooks/useAuthStorage';
import { teacherLoginService, studentLoginService, studentSignupService } from '@/services/authService';

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

  const teacherLogin = async (email: string, password: string) => {
    const result = await teacherLoginService(email, password);
    if (result.teacher) {
      saveTeacher(result.teacher);
    }
    return result;
  };

  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    const result = await studentLoginService(fullName, school, grade, password);
    if (result.student) {
      saveStudent(result.student);
    }
    return result;
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    const result = await studentSignupService(fullName, school, grade, password);
    if (result.student) {
      saveStudent(result.student);
    }
    return result;
  };

  const logout = () => {
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
