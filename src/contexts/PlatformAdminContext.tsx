
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  }, []);

  const checkAdminSession = async () => {
    try {
      // Check localStorage for platform admin session
      const adminData = localStorage.getItem('platformAdmin');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        setAdmin(parsed);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('platformAdmin');
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
