
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, TeacherProfile, AuthContextType } from '@/types/auth';
import { signUpWithSupabase, signInWithSupabase, signOutWithSupabase, fetchUserProfile } from '@/services/secureAuthService';

const SecureAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('SecureAuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when authenticated
          setTimeout(async () => {
            const result = await fetchUserProfile(session.user.id);
            if (result.profile) {
              setProfile(result.profile);
              setTeacherProfile(null);
            } else if (result.teacherProfile) {
              setTeacherProfile(result.teacherProfile);
              setProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
          setTeacherProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then((result) => {
          if (result.profile) {
            setProfile(result.profile);
            setTeacherProfile(null);
          } else if (result.teacherProfile) {
            setTeacherProfile(result.teacherProfile);
            setProfile(null);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('SecureAuthProvider: Sign up attempt');
    const result = await signUpWithSupabase(email, password, userData);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    console.log('SecureAuthProvider: Sign in attempt');
    const result = await signInWithSupabase(email, password);
    return result;
  };

  const signOut = async () => {
    console.log('SecureAuthProvider: Sign out');
    await signOutWithSupabase();
    setUser(null);
    setSession(null);
    setProfile(null);
    setTeacherProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    teacherProfile,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = (): AuthContextType => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
