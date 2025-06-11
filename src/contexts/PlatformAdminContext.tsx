
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformAdmin, platformAdminLoginService } from '@/services/platformAdminService';

interface PlatformAdminContextType {
  admin: PlatformAdmin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; admin?: PlatformAdmin }>;
  logout: () => void;
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
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('PlatformAdminProvider: Initializing...');
    
    const restoreAdminSession = () => {
      try {
        const adminData = localStorage.getItem('platformAdmin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          if (parsedAdmin?.id && parsedAdmin?.email) {
            console.log('PlatformAdminProvider: Restoring session for:', parsedAdmin.email);
            setAdmin(parsedAdmin);
          } else {
            console.log('PlatformAdminProvider: Invalid admin data, clearing');
            localStorage.removeItem('platformAdmin');
          }
        } else {
          console.log('PlatformAdminProvider: No stored session found');
        }
      } catch (error) {
        console.error('PlatformAdminProvider: Session restoration error:', error);
        localStorage.removeItem('platformAdmin');
      }
      setIsLoading(false);
    };

    restoreAdminSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('PlatformAdminProvider: Login attempt for:', email);
      
      const result = await platformAdminLoginService(email, password);
      console.log('PlatformAdminProvider: Login service result:', result);
      
      if (result?.admin) {
        console.log('PlatformAdminProvider: Login successful');
        setAdmin(result.admin);
        localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
        return { admin: result.admin };
      } else if (result?.error) {
        console.log('PlatformAdminProvider: Login failed:', result.error);
        return { error: result.error };
      } else {
        console.log('PlatformAdminProvider: Unexpected result format');
        return { error: 'Login failed. Please try again.' };
      }
    } catch (error) {
      console.error('PlatformAdminProvider: Login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('PlatformAdminProvider: Logout initiated');
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
    console.log('PlatformAdminProvider: Logout complete');
  };

  console.log('PlatformAdminProvider: Current state - admin:', !!admin, 'isLoading:', isLoading);

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
