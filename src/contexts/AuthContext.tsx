
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { teacherSimpleLoginService, studentSimpleLoginService, studentSignupService } from '@/services/authService';

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

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    // Use teacherSimpleLoginService with name and school for simple login
    const result = await teacherSimpleLoginService(name || email, password, school || '');
    
    if (result.teacher) {
      setTeacher(result.teacher);
      localStorage.setItem('teacher', JSON.stringify(result.teacher));
    }
    
    return result;
  };

  const studentLogin = async (fullName: string, password: string) => {
    const result = await studentSimpleLoginService(fullName, password);
    
    if (result.student) {
      setStudent(result.student);
      localStorage.setItem('student', JSON.stringify(result.student));
    }
    
    return result;
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    const result = await studentSignupService(fullName, school, grade, password);
    
    if (result.student) {
      setStudent(result.student);
      localStorage.setItem('student', JSON.stringify(result.student));
    }
    
    return result;
  };

  const logout = () => {
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
