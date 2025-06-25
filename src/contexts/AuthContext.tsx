
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Teacher, Student } from '@/types/auth';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Legacy properties for backward compatibility
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  teacherLogin: (email: string, password: string, name?: string, school?: string, role?: 'teacher' | 'admin' | 'doctor') => Promise<{ teacher?: Teacher; error?: string }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  logout: () => void;
  setTeacher: (teacher: Teacher | null) => void;
  setStudent: (student: Student | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderInnerProps {
  children: ReactNode;
}

const AuthProviderInner: React.FC<AuthProviderInnerProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the existing auth hooks for backward compatibility
  const teacherAuth = useTeacherAuth();
  const studentAuth = useStudentAuth();

  useEffect(() => {
    // Restore from storage on initialization
    teacherAuth.restoreFromStorage();
    studentAuth.restoreFromStorage();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Clear local auth states on Supabase signout
        teacherAuth.logout();
        studentAuth.logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      teacherAuth.logout();
      studentAuth.logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const logout = () => {
    teacherAuth.logout();
    studentAuth.logout();
    signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    // Legacy compatibility
    teacher: teacherAuth.teacher,
    student: studentAuth.student,
    isLoading: loading,
    teacherLogin: teacherAuth.login,
    studentLogin: studentAuth.login,
    studentSignup: studentAuth.signup,
    logout,
    setTeacher: teacherAuth.setTeacher,
    setStudent: studentAuth.setStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
