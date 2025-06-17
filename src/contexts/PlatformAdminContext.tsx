
import React, { createContext, useContext, useState, useEffect } from 'react';
import { consolidatedAuthService } from '@/services/consolidatedAuthService';

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

  // Load admin from session on mount
  useEffect(() => {
    const loadStoredAdmin = () => {
      try {
        const currentUser = consolidatedAuthService.getCurrentUser();
        console.log('🔐 Checking for existing admin session:', currentUser);
        
        if (currentUser && currentUser.userType === 'admin') {
          setAdmin({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.name || '',
            role: currentUser.role,
            school: currentUser.school
          });
          setIsAuthenticated(true);
          console.log('✅ Admin session restored:', currentUser.email);
        } else {
          console.log('❌ No valid admin session found');
        }
      } catch (error) {
        console.error('Error loading stored admin session:', error);
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
      const result = await consolidatedAuthService.secureLogin({
        email,
        password,
        school: 'Platform Administration', // Will be populated from database
        userType: 'admin'
      });
      
      if (result.success && result.user && result.user.role === 'admin') {
        setAdmin({
          id: result.user.id,
          email: result.user.email || email,
          name: result.user.name || '',
          role: result.user.role,
          school: result.user.school
        });
        setIsAuthenticated(true);
        
        console.log('✅ Platform admin login successful:', result.user.email);
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
    consolidatedAuthService.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const validateSession = async () => {
    if (!admin?.email) return;
    
    try {
      const isAuth = consolidatedAuthService.isAuthenticated();
      if (!isAuth) {
        console.log('🔒 Admin session validation failed, logging out');
        logout();
      }
    } catch (error) {
      console.error('Error validating admin session:', error);
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
