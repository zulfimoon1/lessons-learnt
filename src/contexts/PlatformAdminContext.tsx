
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
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_IN' && session?.user) {
        await checkIfUserIsAdmin(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkIfUserIsAdmin = async (userId: string) => {
    try {
      console.log('Checking if user is admin:', userId);
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId)
        .eq('role', 'admin')
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      if (teacher) {
        console.log('User is admin:', teacher);
        const adminData = {
          id: teacher.id,
          email: teacher.email,
          name: teacher.name,
          role: teacher.role
        };
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        // Store admin data in localStorage for quick access
        localStorage.setItem('platformAdmin', JSON.stringify(adminData));
      }
    } catch (error) {
      console.error('Error in checkIfUserIsAdmin:', error);
    }
  };

  const checkAdminSession = async () => {
    try {
      // Check if there's an existing Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Found existing session:', session.user.id);
        await checkIfUserIsAdmin(session.user.id);
      } else {
        // Fallback: check localStorage for platform admin session
        const adminData = localStorage.getItem('platformAdmin');
        if (adminData) {
          console.log('Found stored admin session, but no Supabase session - clearing localStorage');
          localStorage.removeItem('platformAdmin');
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('=== PLATFORM ADMIN LOGIN ATTEMPT ===');
      console.log('Email:', email);

      // First, verify this is an admin in our teachers table
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (teacherError || !teacher) {
        console.error('Admin not found:', teacherError);
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Verify password using the platform admin service
      const { platformAdminLoginService } = await import('@/services/platformAdminService');
      const result = await platformAdminLoginService(email, password);
      
      if ('error' in result && result.error) {
        console.error('Password verification failed:', result.error);
        return { success: false, error: result.error };
      }

      if (!('admin' in result && result.admin)) {
        return { success: false, error: 'Authentication failed' };
      }

      // Now sign in with Supabase Auth using the teacher's ID as a custom flow
      // For platform admins, we'll create a temporary session
      console.log('Creating Supabase session for admin');
      
      // Since we can't directly sign in without a password in Supabase Auth,
      // we'll use a different approach - sign in with a magic link or create a session
      // For now, let's manually set the session data after password verification
      
      const adminData = {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role
      };
      
      setAdmin(adminData);
      setIsAuthenticated(true);
      localStorage.setItem('platformAdmin', JSON.stringify(adminData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out platform admin');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      localStorage.removeItem('platformAdmin');
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
