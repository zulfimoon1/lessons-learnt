
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
      console.log('AuthContext teacherLogin: Starting login process', { name, school });
      
      // For the simple login system, we need name and school
      if (!name || !school) {
        return { error: 'Name and school are required for login.' };
      }
      
      // Use teacherSimpleLoginService with name and school for simple login
      const result = await teacherSimpleLoginService(name, password, school);
      console.log('AuthContext teacherLogin: Service result', result);
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        try {
          localStorage.setItem('teacher', JSON.stringify(result.teacher));
          console.log('AuthContext teacherLogin: Teacher data saved successfully');
        } catch (storageError) {
          console.warn('Failed to save teacher data to localStorage');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Teacher login error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const studentLogin = async (fullName: string, password: string) => {
    try {
      console.log('AuthContext studentLogin: Starting login process', { fullName });
      
      if (!fullName || !password) {
        return { error: 'Full name and password are required.' };
      }
      
      const result = await studentSimpleLoginService(fullName, password);
      console.log('AuthContext studentLogin: Service result', result);
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          console.log('AuthContext studentLogin: Student data saved successfully');
        } catch (storageError) {
          console.warn('Failed to save student data to localStorage');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Student login error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('AuthContext studentSignup: Starting signup process', { fullName, school, grade });
      
      if (!fullName || !school || !grade || !password) {
        return { error: 'All fields are required for signup.' };
      }
      
      const result = await studentSignupService(fullName, school, grade, password);
      console.log('AuthContext studentSignup: Service result', result);
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          console.log('AuthContext studentSignup: Student data saved successfully');
        } catch (storageError) {
          console.warn('Failed to save student data to localStorage');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Student signup error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    console.log('AuthContext logout: Clearing auth data');
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
