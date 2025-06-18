
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';
import { secureSessionService } from '@/services/secureSessionService';
import { inputValidationService } from '@/services/inputValidationService';
import { enhancedRateLimitService } from '@/services/enhancedRateLimitService';
import { secureErrorHandlingService } from '@/services/secureErrorHandlingService';

interface SecureSupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const SecureSupabaseAuthContext = createContext<SecureSupabaseAuthContextType | undefined>(undefined);

export const SecureSupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('SecureSupabaseAuth: Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SecureSupabaseAuth: Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        setTeacher(null);
        setStudent(null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SecureSupabaseAuth: Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('SecureSupabaseAuth: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('SecureSupabaseAuth: Fetching profile for user:', userId);
      
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .single();

      if (teacherData && !teacherError) {
        console.log('SecureSupabaseAuth: Found teacher profile');
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
        
        // Create secure session - map doctor role to admin for session management
        const sessionUserType = teacherProfile.role === 'doctor' ? 'admin' : teacherProfile.role;
        await secureSessionService.createSession(userId, sessionUserType, teacherProfile.school);
        setIsLoading(false);
        return;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single();

      if (studentData && !studentError) {
        console.log('SecureSupabaseAuth: Found student profile');
        const studentProfile: Student = {
          id: studentData.id,
          full_name: studentData.full_name,
          school: studentData.school,
          grade: studentData.grade
        };
        setStudent(studentProfile);
        
        // Create secure session
        await secureSessionService.createSession(userId, 'student', studentProfile.school);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('SecureSupabaseAuth: Error fetching user profile:', error);
      secureErrorHandlingService.handleDatabaseError(error, userId);
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('SecureSupabaseAuth: Starting signup for:', email);
      
      // Input validation
      if (!inputValidationService.validateEmail(email)) {
        return { error: 'Invalid email format' };
      }
      
      const passwordValidation = inputValidationService.validatePassword(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors.join('. ') };
      }
      
      // Rate limiting
      if (!await enhancedRateLimitService.checkRateLimit('signup')) {
        return { error: 'Too many signup attempts. Please try again later.' };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      await enhancedRateLimitService.logAttempt('signup', !error);

      if (error) {
        console.error('SecureSupabaseAuth: Signup error:', error);
        return { error: secureErrorHandlingService.handleAuthError(error) };
      }

      if (data.user) {
        console.log('SecureSupabaseAuth: Signup successful');
        return {};
      }

      return { error: 'Signup failed' };
    } catch (error) {
      console.error('SecureSupabaseAuth: Unexpected signup error:', error);
      return { error: secureErrorHandlingService.handleAuthError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SecureSupabaseAuth: Starting signin for:', email);
      
      // Input validation
      if (!inputValidationService.validateEmail(email)) {
        return { error: 'Invalid email format' };
      }
      
      // Rate limiting
      if (!await enhancedRateLimitService.checkRateLimit('login')) {
        return { error: 'Too many login attempts. Please try again later.' };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      await enhancedRateLimitService.logAttempt('login', !error);

      if (error) {
        console.error('SecureSupabaseAuth: Signin error:', error);
        return { error: secureErrorHandlingService.handleAuthError(error) };
      }

      if (data.user) {
        console.log('SecureSupabaseAuth: Signin successful');
        return {};
      }

      return { error: 'Signin failed' };
    } catch (error) {
      console.error('SecureSupabaseAuth: Unexpected signin error:', error);
      return { error: secureErrorHandlingService.handleAuthError(error) };
    }
  };

  const signOut = async () => {
    try {
      console.log('SecureSupabaseAuth: Signing out');
      secureSessionService.clearSession();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setTeacher(null);
      setStudent(null);
    } catch (error) {
      console.error('SecureSupabaseAuth: Signout error:', error);
      secureErrorHandlingService.handleAuthError(error);
    }
  };

  const value: SecureSupabaseAuthContextType = {
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
    <SecureSupabaseAuthContext.Provider value={value}>
      {children}
    </SecureSupabaseAuthContext.Provider>
  );
};

export const useSecureSupabaseAuth = (): SecureSupabaseAuthContextType => {
  const context = useContext(SecureSupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSecureSupabaseAuth must be used within a SecureSupabaseAuthProvider');
  }
  return context;
};
