
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PlatformAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface PlatformAdminContextType {
  admin: PlatformAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const PlatformAdminContext = createContext<PlatformAdminContextType | undefined>(undefined);

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAdminSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkIfUserIsAdmin(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkIfUserIsAdmin(session.user);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfUserIsAdmin = async (user: User) => {
    try {
      console.log('=== CHECKING ADMIN STATUS ===');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);

      // Check if user exists in teachers table with admin role
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id, name, email, role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Teacher query result:', { teacherData, teacherError });

      if (teacherError) {
        console.error('Error checking admin status:', teacherError);
        setAdmin(null);
        setIsAuthenticated(false);
        return;
      }

      if (teacherData) {
        console.log('Admin found:', teacherData);
        setAdmin({
          id: teacherData.id,
          email: teacherData.email,
          name: teacherData.name,
          role: teacherData.role
        });
        setIsAuthenticated(true);
      } else {
        console.log('User is not an admin');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error in checkIfUserIsAdmin:', error);
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('=== ADMIN LOGIN ATTEMPT ===');
      console.log('Email:', email);

      // First check if user exists in teachers table with admin role
      const { data: adminData, error: adminCheckError } = await supabase
        .from('teachers')
        .select('id, name, email, role, password_hash')
        .eq('email', email)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Admin check result:', { adminData, adminCheckError });

      if (adminCheckError) {
        console.error('Error checking admin credentials:', adminCheckError);
        return { success: false, error: 'Database error occurred' };
      }

      if (!adminData) {
        console.log('Admin not found with email:', email);
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Auth result:', { authData, authError });

      if (authError) {
        console.error('Auth error:', authError);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        await checkIfUserIsAdmin(authData.user);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <PlatformAdminContext.Provider value={value}>
      {children}
    </PlatformAdminContext.Provider>
  );
};

export const usePlatformAdmin = () => {
  const context = useContext(PlatformAdminContext);
  if (context === undefined) {
    throw new Error('usePlatformAdmin must be used within a PlatformAdminProvider');
  }
  return context;
};
