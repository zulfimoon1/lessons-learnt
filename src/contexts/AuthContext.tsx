import React, { createContext, useContext, useState, useEffect } from 'react';
import { consolidatedAuthService } from '@/services/consolidatedAuthService';

interface Student {
  id: string;
  fullName: string;
  school: string;
  grade: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
}

interface AuthContextType {
  student: Student | null;
  teacher: Teacher | null;
  isLoading: boolean;
  loginStudent: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  loginTeacher: (email: string, password: string) => Promise<{ teacher?: Teacher; error?: string }>;
  signupStudent: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  signupTeacher: (name: string, email: string, school: string, password: string, role?: string) => Promise<{ teacher?: Teacher; error?: string }>;
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
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = consolidatedAuthService.getCurrentUser();
        console.log('🔐 AuthContext: Checking current user:', currentUser);
        
        if (currentUser && currentUser.userType === 'student') {
          setStudent({
            id: currentUser.id,
            fullName: currentUser.fullName || '',
            school: currentUser.school,
            grade: currentUser.role // For students, role contains grade
          });
        } else if (currentUser && (currentUser.userType === 'teacher' || currentUser.userType === 'admin')) {
          setTeacher({
            id: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            school: currentUser.school,
            role: currentUser.role
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginStudent = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await consolidatedAuthService.secureLogin({
        fullName,
        school,
        grade,
        password,
        userType: 'student'
      });

      if (result.success && result.user) {
        const studentData = {
          id: result.user.id,
          fullName: result.user.fullName || fullName,
          school: result.user.school,
          grade: grade
        };
        setStudent(studentData);
        return { student: studentData };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Student login error:', error);
      return { error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginTeacher = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await consolidatedAuthService.secureLogin({
        email,
        password,
        school: 'unknown', // Will be populated from database
        userType: 'teacher'
      });

      if (result.success && result.user) {
        const teacherData = {
          id: result.user.id,
          name: result.user.name || '',
          email: result.user.email || email,
          school: result.user.school,
          role: result.user.role
        };
        setTeacher(teacherData);
        return { teacher: teacherData };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signupStudent = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await consolidatedAuthService.secureSignup({
        userType: 'student',
        fullName,
        school,
        grade,
        password
      });

      if (result.success && result.user) {
        const studentData = {
          id: result.user.id,
          fullName: result.user.fullName || fullName,
          school: result.user.school,
          grade: grade
        };
        setStudent(studentData);
        return { student: studentData };
      } else {
        return { error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Student signup error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signupTeacher = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
    try {
      setIsLoading(true);
      const result = await consolidatedAuthService.secureSignup({
        userType: 'teacher',
        name,
        email,
        school,
        role,
        password
      });

      if (result.success && result.user) {
        const teacherData = {
          id: result.user.id,
          name: result.user.name || name,
          email: result.user.email || email,
          school: result.user.school,
          role: result.user.role
        };
        setTeacher(teacherData);
        return { teacher: teacherData };
      } else {
        return { error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    consolidatedAuthService.logout();
    setStudent(null);
    setTeacher(null);
  };

  const value: AuthContextType = {
    student,
    teacher,
    isLoading,
    loginStudent,
    loginTeacher,
    signupStudent,
    signupTeacher,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
