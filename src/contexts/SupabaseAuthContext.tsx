
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to load as teacher first
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();

      if (teacherData) {
        // Properly cast the teacher data with role validation
        const teacherProfile: Teacher = {
          id: teacherData.id,
          name: teacherData.name,
          email: teacherData.email,
          school: teacherData.school,
          role: ['teacher', 'admin', 'doctor'].includes(teacherData.role) 
            ? teacherData.role as 'teacher' | 'admin' | 'doctor'
            : 'teacher', // fallback to teacher if role is invalid
          specialization: teacherData.specialization,
          license_number: teacherData.license_number,
          created_at: teacherData.created_at
        };
        
        setTeacher(teacherProfile);
        setStudent(null);
        return;
      }

      // If not a teacher, try student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single();

      if (studentData) {
        setStudent(studentData);
        setTeacher(null);
        return;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setTeacher(null);
        setStudent(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Signup failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setTeacher(null);
    setStudent(null);
  };

  const value: AuthContextType = {
    user,
    session,
    teacher,
    student,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
