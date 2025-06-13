
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
      console.log('🔍 Checking admin session...');
      const adminData = localStorage.getItem('platformAdmin');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        console.log('✅ Found stored admin session:', parsed.email);
        setAdmin(parsed);
        setIsAuthenticated(true);
        await setAdminContext(parsed.email);
      } else {
        console.log('❌ No stored admin session found');
      }
    } catch (error) {
      console.error('❌ Error checking admin session:', error);
      localStorage.removeItem('platformAdmin');
    } finally {
      setIsLoading(false);
    }
  };

  const setAdminContext = async (email: string) => {
    try {
      console.log('🔧 Setting admin context for:', email);
      await supabase.rpc('set_platform_admin_context', { admin_email: email });
      console.log('✅ Admin context set successfully');
    } catch (error) {
      console.error('❌ Error setting admin context:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🚀 === PLATFORM ADMIN LOGIN ATTEMPT ===');
      console.log('📧 Email:', email);

      // Import the login service dynamically
      const { platformAdminLoginService } = await import('@/services/platformAdminService');
      const result = await platformAdminLoginService(email, password);
      
      console.log('📊 Login service result:', result);
      
      if ('error' in result && result.error) {
        console.error('❌ Login failed:', result.error);
        return { success: false, error: result.error };
      }

      if (!('admin' in result && result.admin)) {
        console.error('❌ No admin data in result');
        return { success: false, error: 'Authentication failed' };
      }

      const adminData = {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role
      };
      
      console.log('✅ Setting admin data:', adminData);
      setAdmin(adminData);
      setIsAuthenticated(true);
      localStorage.setItem('platformAdmin', JSON.stringify(adminData));
      
      // Set admin context for database operations
      await setAdminContext(adminData.email);
      
      console.log('🎉 Login successful!');
      return { success: true };
    } catch (error) {
      console.error('💥 Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out platform admin');
      localStorage.removeItem('platformAdmin');
      setAdmin(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('❌ Logout error:', error);
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
