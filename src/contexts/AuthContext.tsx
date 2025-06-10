
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student } from '@/types/auth';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';

interface AuthContextType {
  // Teacher state
  teacher: Teacher | null;
  teacherLogin: (email: string, password: string) => Promise<{ teacher?: Teacher; error?: string }>;
  teacherLogout: () => void;
  
  // Student state
  student: Student | null;
  studentLogin: (fullName: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentLogout: () => void;
  
  // General state
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    teacher,
    login: teacherLoginHook,
    logout: teacherLogoutHook,
    restoreFromStorage: restoreTeacher,
    setTeacher
  } = useTeacherAuth();

  const {
    student,
    login: studentLoginHook,
    signup: studentSignupHook,
    logout: studentLogoutHook,
    restoreFromStorage: restoreStudent,
    setStudent
  } = useStudentAuth();

  // Initialize auth state from storage
  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    
    const initializeAuth = () => {
      const hasTeacher = restoreTeacher();
      const hasStudent = restoreStudent();
      
      console.log('AuthContext: Restored from storage', { hasTeacher, hasStudent });
      setIsLoading(false);
    };

    initializeAuth();
  }, [restoreTeacher, restoreStudent]);

  const teacherLogin = async (email: string, password: string) => {
    console.log('AuthContext: Teacher login attempt');
    setIsLoading(true);
    
    try {
      const result = await teacherLoginHook(email, password);
      console.log('AuthContext: Teacher login result', result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const studentLogin = async (fullName: string, password: string) => {
    console.log('AuthContext: Student login attempt');
    setIsLoading(true);
    
    try {
      const result = await studentLoginHook(fullName, password);
      console.log('AuthContext: Student login result', result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt');
    setIsLoading(true);
    
    try {
      const result = await studentSignupHook(fullName, school, grade, password);
      console.log('AuthContext: Student signup result', result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const teacherLogout = () => {
    console.log('AuthContext: Teacher logout');
    teacherLogoutHook();
    setStudent(null); // Clear any student session too
  };

  const studentLogout = () => {
    console.log('AuthContext: Student logout');
    studentLogoutHook();
    setTeacher(null); // Clear any teacher session too
  };

  const value: AuthContextType = {
    teacher,
    teacherLogin,
    teacherLogout,
    student,
    studentLogin,
    studentSignup,
    studentLogout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
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
