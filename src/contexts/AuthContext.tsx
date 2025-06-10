
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const teacherAuth = useTeacherAuth();
  const studentAuth = useStudentAuth();

  useEffect(() => {
    console.log('AuthContext: Starting initialization...');
    
    const teacherRestored = teacherAuth.restoreFromStorage();
    const studentRestored = studentAuth.restoreFromStorage();
    
    if (teacherRestored) {
      console.log('AuthContext: Restored teacher from localStorage');
    }
    
    if (studentRestored) {
      console.log('AuthContext: Restored student from localStorage');
    }
    
    console.log('AuthContext: Initialization complete, setting isLoading to false');
    setIsLoading(false);
  }, []);

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    const result = await teacherAuth.login(email, password);
    if (result.teacher && !result.error) {
      studentAuth.setStudent(null);
    }
    return result;
  };

  const studentLogin = async (fullName: string, password: string) => {
    const result = await studentAuth.login(fullName, password);
    if (result.student && !result.error) {
      teacherAuth.setTeacher(null);
    }
    return result;
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    const result = await studentAuth.signup(fullName, school, grade, password);
    if (result.student && !result.error) {
      teacherAuth.setTeacher(null);
    }
    return result;
  };

  const logout = () => {
    console.log('AuthContext logout: Clearing auth data');
    teacherAuth.logout();
    studentAuth.logout();
  };

  const value: AuthContextType = {
    teacher: teacherAuth.teacher,
    student: studentAuth.student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout,
  };

  console.log('AuthContext: Rendering provider with value:', { 
    hasTeacher: !!teacherAuth.teacher, 
    hasStudent: !!studentAuth.student, 
    isLoading 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  console.log('useAuth: Hook called');
  const context = useContext(AuthContext);
  console.log('useAuth: Context value:', { 
    isDefined: context !== undefined,
    hasTeacher: !!context?.teacher,
    hasStudent: !!context?.student,
    isLoading: context?.isLoading 
  });
  
  if (context === undefined) {
    console.error('useAuth: Context is undefined - AuthProvider not found');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
