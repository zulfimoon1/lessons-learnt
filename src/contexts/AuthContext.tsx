
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { teacherSimpleLoginService, studentSimpleLoginService, studentSignupService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved auth data from localStorage with error handling
    try {
      const savedTeacher = localStorage.getItem('teacher');
      const savedStudent = localStorage.getItem('student');
      
      if (savedTeacher) {
        const parsedTeacher = JSON.parse(savedTeacher);
        // Validate the structure of saved teacher data
        if (parsedTeacher && parsedTeacher.id && parsedTeacher.name) {
          setTeacher(parsedTeacher);
        } else {
          localStorage.removeItem('teacher');
        }
      }
      
      if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent);
        // Validate the structure of saved student data
        if (parsedStudent && parsedStudent.id && parsedStudent.full_name) {
          setStudent(parsedStudent);
        } else {
          localStorage.removeItem('student');
        }
      }
    } catch (error) {
      console.error('Error loading saved authentication data:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role?: 'teacher' | 'admin' | 'doctor'
  ) => {
    try {
      // Use teacherSimpleLoginService with name and school for simple login
      const result = await teacherSimpleLoginService(name || email, password, school || '');
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        localStorage.setItem('teacher', JSON.stringify(result.teacher));
      }
      
      return result;
    } catch (error) {
      console.error('Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const studentLogin = async (fullName: string, password: string) => {
    try {
      const result = await studentSimpleLoginService(fullName, password);
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        localStorage.setItem('student', JSON.stringify(result.student));
      }
      
      return result;
    } catch (error) {
      console.error('Student login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      const result = await studentSignupService(fullName, school, grade, password);
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        localStorage.setItem('student', JSON.stringify(result.student));
      }
      
      return result;
    } catch (error) {
      console.error('Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    setStudent(null);
    
    // Clear stored authentication data
    try {
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
    } catch (error) {
      console.error('Error clearing authentication data:', error);
    }
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
