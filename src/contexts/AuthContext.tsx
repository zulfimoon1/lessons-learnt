
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
}

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  teacherLogin: (email: string, password: string, name?: string, school?: string, role?: string) => Promise<{ error?: string; teacher?: Teacher }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const teacherLogin = async (email: string, password: string, name?: string, school?: string, role?: string) => {
    setIsLoading(true);
    try {
      // Mock login for now
      const mockTeacher: Teacher = {
        id: '1',
        name: name || 'Teacher',
        email,
        school: school || 'Sample School',
        role: (role as 'teacher' | 'admin' | 'doctor') || 'teacher'
      };
      setTeacher(mockTeacher);
      return { teacher: mockTeacher };
    } catch (error) {
      return { error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    setIsLoading(true);
    try {
      const mockStudent: Student = {
        id: '1',
        full_name: fullName,
        school,
        grade
      };
      setStudent(mockStudent);
      return { student: mockStudent };
    } catch (error) {
      return { error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    setIsLoading(true);
    try {
      const mockStudent: Student = {
        id: '1',
        full_name: fullName,
        school,
        grade
      };
      setStudent(mockStudent);
      return { student: mockStudent };
    } catch (error) {
      return { error: 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTeacher(null);
    setStudent(null);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
