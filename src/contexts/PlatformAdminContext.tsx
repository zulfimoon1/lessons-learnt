
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
}

interface PlatformAdminContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  validateSession: () => Promise<void>;
}

const PlatformAdminContext = createContext<PlatformAdminContextType | undefined>(undefined);

export const usePlatformAdmin = () => {
  const context = useContext(PlatformAdminContext);
  if (context === undefined) {
    throw new Error('usePlatformAdmin must be used within a PlatformAdminProvider');
  }
  return context;
};

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load admin from localStorage on mount
  useEffect(() => {
    const loadStoredAdmin = async () => {
      try {
        const storedAdmin = localStorage.getItem('platform_admin');
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          setAdmin(adminData);
          setIsAuthenticated(true);
          console.log('🔐 Admin session restored:', adminData.email);
        }
      } catch (error) {
        console.error('Error loading stored admin session:', error);
        localStorage.removeItem('platform_admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 PLATFORM ADMIN LOGIN:', email);
    setIsLoading(true);
    
    try {
      // Simple admin authentication using hardcoded credentials for now
      if (email === 'zulfimoon1@gmail.com' && password === 'admin123') {
        const adminData: AdminUser = {
          id: '1',
          email: email,
          name: 'Platform Admin',
          role: 'admin',
          school: 'Platform'
        };
        
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('platform_admin', JSON.stringify(adminData));
        
        console.log('✅ Platform admin login successful');
        return { success: true };
      } else {
        console.error('❌ Platform admin login failed');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('💥 Platform admin login error:', error);
      return { success: false, error: 'Authentication system error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🔓 Platform admin logout');
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('platform_admin');
  };

  const validateSession = async () => {
    // Simple session validation
    if (!admin?.email) {
      logout();
    }
  };

  const value: PlatformAdminContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    validateSession,
  };

  return (
    <PlatformAdminContext.Provider value={value}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
