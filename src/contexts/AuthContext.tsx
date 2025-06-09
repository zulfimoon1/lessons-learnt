
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { teacherLoginService, studentSimpleLoginService, studentSignupService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved auth data from localStorage
    const savedTeacher = localStorage.getItem('teacher');
    const savedStudent = localStorage.getItem('student');
    
    if (savedTeacher) {
      try {
        setTeacher(JSON.parse(savedTeacher));
      } catch (error) {
        console.error('Error parsing saved teacher data:', error);
        localStorage.removeItem('teacher');
      }
    }
    
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (error) {
        console.error('Error parsing saved student data:', error);
        localStorage.removeItem('student');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    // Legacy compatibility - redirect to secure auth
    return { error: 'Please use the new secure authentication system' };
  };

  const signIn = async (email: string, password: string) => {
    // Legacy compatibility - redirect to secure auth
    return { error: 'Please use the new secure authentication system' };
  };

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string, 
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    try {
      const result = await teacherLoginService(email, password, name, school, role);
      
      if (result.teacher) {
        setTeacher(result.teacher);
        localStorage.setItem('teacher', JSON.stringify(result.teacher));
      }
      
      return result;
    } catch (error) {
      console.error('Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const signOut = async () => {
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
  };

  const value: AuthContextType = {
    user: teacher || student,
    profile: student,
    teacherProfile: teacher,
    teacher,
    student,
    isLoading,
    signUp,
    signIn,
    signOut,
    teacherLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
