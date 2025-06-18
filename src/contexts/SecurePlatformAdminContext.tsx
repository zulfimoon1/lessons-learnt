
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

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
}

const SecurePlatformAdminContext = createContext<PlatformAdminContextType | undefined>(undefined);

export const useSecurePlatformAdmin = () => {
  const context = useContext(SecurePlatformAdminContext);
  if (context === undefined) {
    throw new Error('useSecurePlatformAdmin must be used within a SecurePlatformAdminProvider');
  }
  return context;
};

export const SecurePlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { teacher, signIn, signOut, isLoading: authLoading } = useSupabaseAuth();

  useEffect(() => {
    if (authLoading) return;

    // Check if current user is a platform admin
    if (teacher && teacher.role === 'admin') {
      const adminData: AdminUser = {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: teacher.role,
        school: teacher.school
      };
      
      setAdmin(adminData);
      setIsAuthenticated(true);
    } else {
      setAdmin(null);
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, [teacher, authLoading]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setIsLoading(false);
        return { success: false, error: result.error };
      }

      // The useEffect will handle setting admin state once teacher loads
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Authentication system error' };
    }
  };

  const logout = () => {
    signOut();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value: PlatformAdminContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <SecurePlatformAdminContext.Provider value={value}>
      {children}
    </SecurePlatformAdminContext.Provider>
  );
};
