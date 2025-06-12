
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
  }, []);

  const checkAdminSession = async () => {
    try {
      // Check localStorage for platform admin session
      const adminData = localStorage.getItem('platformAdmin');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        console.log('Found stored admin session:', parsedAdmin);
        setAdmin(parsedAdmin);
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

      // Import the platformAdminLoginService
      const { platformAdminLoginService } = await import('@/services/platformAdminService');
      
      const result = await platformAdminLoginService(email, password);
      
      // Type guard to check if result has error property
      if ('error' in result && result.error) {
        console.error('Login failed:', result.error);
        return { success: false, error: result.error };
      }

      // Type guard to check if result has admin property
      if ('admin' in result && result.admin) {
        console.log('Login successful, storing admin session');
        
        // Store admin data in localStorage for session persistence
        localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
        
        setAdmin(result.admin);
        setIsAuthenticated(true);
        
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
