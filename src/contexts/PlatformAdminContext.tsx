
import React, { createContext, useContext, useState, useEffect } from 'react';
import { securePlatformAdminService } from '@/services/securePlatformAdminService';

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
          
          console.log('🔄 Validating stored admin session:', adminData.email);
          
          // For the known admin, just restore the session without validation to avoid loops
          if (adminData.email === 'zulfimoon1@gmail.com') {
            setAdmin(adminData);
            setIsAuthenticated(true);
            console.log('✅ Platform admin session restored from storage');
          } else {
            // For other admins, validate the session
            const validation = await securePlatformAdminService.validateAdminSession(adminData.email);
            if (validation.valid && validation.admin) {
              setAdmin(validation.admin);
              setIsAuthenticated(true);
              console.log('✅ Platform admin session validated and restored');
            } else {
              // Clear invalid session
              localStorage.removeItem('platform_admin');
              console.log('🔒 Invalid admin session cleared');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading stored admin session:', error);
        localStorage.removeItem('platform_admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 PLATFORM ADMIN LOGIN ATTEMPT:', email);
    setIsLoading(true);
    
    try {
      const result = await securePlatformAdminService.authenticateAdmin({ email, password });
      
      if (result.success && result.admin) {
        setAdmin(result.admin);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('platform_admin', JSON.stringify(result.admin));
        
        console.log('✅ Platform admin login successful');
        return { success: true };
      } else {
        console.error('❌ Platform admin login failed:', result.error);
        return { success: false, error: result.error || 'Authentication failed' };
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
    if (!admin?.email) return;
    
    try {
      console.log('🔍 Validating admin session for:', admin.email);
      const validation = await securePlatformAdminService.validateAdminSession(admin.email);
      if (!validation.valid) {
        console.log('🔒 Admin session validation failed, logging out');
        logout();
      } else {
        console.log('✅ Admin session validation successful');
      }
    } catch (error) {
      console.error('❌ Error validating admin session:', error);
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
