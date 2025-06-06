
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
    console.log('PlatformAdminProvider: Checking for stored admin data');
    const adminData = localStorage.getItem('platformAdmin');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        console.log('PlatformAdminProvider: Found stored admin:', parsedAdmin);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error('PlatformAdminProvider: Error parsing stored admin data:', error);
        localStorage.removeItem('platformAdmin');
      }
    } else {
      console.log('PlatformAdminProvider: No stored admin data found');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('PlatformAdminProvider: Login attempt for:', email);
    const result = await platformAdminLoginService(email, password);
    if (result.admin) {
      console.log('PlatformAdminProvider: Login successful, setting admin:', result.admin);
      setAdmin(result.admin);
      localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
    } else {
      console.log('PlatformAdminProvider: Login failed:', result.error);
    }
    return result;
  };

  const logout = () => {
    console.log('PlatformAdminProvider: Logging out');
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
  };

  console.log('PlatformAdminProvider: Current state - admin:', admin, 'isLoading:', isLoading);

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
