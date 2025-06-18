
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('SupabaseAuth: Setting up auth state listener');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SupabaseAuth: Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear previous profile data
        setTeacher(null);
        setStudent(null);
        
        // Fetch user profile data if authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SupabaseAuth: Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('SupabaseAuth: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('SupabaseAuth: Fetching profile for user:', userId);
      
      // Try to find teacher profile first
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();

      if (teacherData && !teacherError) {
        console.log('SupabaseAuth: Found teacher profile');
        const teacherProfile: Teacher = {
          id: teacherData.id,
          name: teacherData.name,
          email: teacherData.email,
          school: teacherData.school,
          role: teacherData.role as 'teacher' | 'admin' | 'doctor',
          specialization: teacherData.specialization,
          license_number: teacherData.license_number,
          is_available: teacherData.is_available
        };
        setTeacher(teacherProfile);
        setIsLoading(false);
        return;
      }

      // Try to find student profile
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single();

      if (studentData && !studentError) {
        console.log('SupabaseAuth: Found student profile');
        const studentProfile: Student = {
          id: studentData.id,
          full_name: studentData.full_name,
          school: studentData.school,
          grade: studentData.grade
        };
        setStudent(studentProfile);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('SupabaseAuth: Error fetching user profile:', error);
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('SupabaseAuth: Starting signup for:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        console.error('SupabaseAuth: Signup error:', error);
        return { error: error.message };
      }

      if (data.user) {
        console.log('SupabaseAuth: Signup successful');
        return {};
      }

      return { error: 'Signup failed' };
    } catch (error) {
      console.error('SupabaseAuth: Unexpected signup error:', error);
      return { error: 'An unexpected error occurred during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SupabaseAuth: Starting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SupabaseAuth: Signin error:', error);
        return { error: error.message };
      }

      if (data.user) {
        console.log('SupabaseAuth: Signin successful');
        return {};
      }

      return { error: 'Signin failed' };
    } catch (error) {
      console.error('SupabaseAuth: Unexpected signin error:', error);
      return { error: 'An unexpected error occurred during signin' };
    }
  };

  const signOut = async () => {
    try {
      console.log('SupabaseAuth: Signing out');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setTeacher(null);
      setStudent(null);
    } catch (error) {
      console.error('SupabaseAuth: Signout error:', error);
    }
  };

  const value: SupabaseAuthContextType = {
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

export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
