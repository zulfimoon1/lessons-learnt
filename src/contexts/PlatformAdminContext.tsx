
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
    const adminData = localStorage.getItem('platformAdmin');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await platformAdminLoginService(email, password);
    if (result.admin) {
      setAdmin(result.admin);
      localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
    }
    return result;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
  };

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
