import React, { createContext, useContext, useEffect, useState } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { loginTeacher, signupTeacher, loginStudent, signupStudent } from '@/services/authIntegrationService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create a wrapper component that has access to useNavigate
const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken] = useState(() => Math.random().toString(36).substring(2));
  const navigate = useNavigate();

  // Restore session from localStorage on mount
  useEffect(() => {
    console.log('AuthContext: Starting secure initialization...');
    
    try {
      const savedTeacher = localStorage.getItem('teacher');
      const savedStudent = localStorage.getItem('student');
      
      if (savedTeacher) {
        const parsedTeacher = JSON.parse(savedTeacher);
        if (parsedTeacher && parsedTeacher.id) {
          setTeacher(parsedTeacher);
          console.log('🔐 Teacher session restored:', parsedTeacher.email);
        }
      } else if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent);
        if (parsedStudent && parsedStudent.id) {
          setStudent(parsedStudent);
          console.log('🔐 Student session restored:', parsedStudent.full_name);
        }
      }
    } catch (error) {
      console.error('AuthContext: Error restoring session:', error);
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Secure initialization complete');
    }
  }, []);

  const teacherLogin = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Teacher login attempt for:', email);
      const result = await loginTeacher(email, password);
      
      if (result.teacher) {
        setTeacher(result.teacher);
        setStudent(null);
        localStorage.setItem('teacher', JSON.stringify(result.teacher));
        localStorage.removeItem('student');
        console.log('AuthContext: Teacher login successful');
        return { teacher: result.teacher };
      }
      
      console.log('AuthContext: Teacher login failed:', result.error);
      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Teacher authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    }
  };

  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('AuthContext: Student login attempt for:', fullName);
      const result = await loginStudent(fullName, school, grade, password);
      
      if ('student' in result && result.student) {
        setStudent(result.student);
        setTeacher(null);
        localStorage.setItem('student', JSON.stringify(result.student));
        localStorage.removeItem('teacher');
        console.log('AuthContext: Student login successful');
        return { student: result.student };
      }
      
      const errorMessage = 'error' in result ? result.error : 'Login failed. Please try again.';
      console.log('AuthContext: Student login failed:', errorMessage);
      return { error: errorMessage };
    } catch (error) {
      console.error('AuthContext: Student authentication error:', error);
      return { error: 'Authentication failed. Please try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('AuthContext: Student signup attempt for:', fullName);
      const result = await signupStudent(fullName, school, grade, password);
      
      if ('student' in result && result.student) {
        setStudent(result.student);
        setTeacher(null);
        localStorage.setItem('student', JSON.stringify(result.student));
        localStorage.removeItem('teacher');
        console.log('AuthContext: Student signup successful');
        return { student: result.student };
      }
      
      const errorMessage = 'error' in result ? result.error : 'Signup failed. Please try again.';
      return { error: errorMessage };
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Centralized logout initiated');
    try {
      // Clear authentication state
      setTeacher(null);
      setStudent(null);
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
      localStorage.removeItem('platformAdmin');
      
      console.log('AuthContext: Logout successful, navigating to home');
      
      // Centralized navigation handling
      navigate('/', { replace: true });
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Still navigate home even if there's an error
      navigate('/', { replace: true });
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
    csrfToken,
    setTeacher,
    setStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Main provider component that wraps the inner component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};
