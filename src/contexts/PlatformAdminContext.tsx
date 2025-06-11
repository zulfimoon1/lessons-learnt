
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

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

// Simple hardcoded login for testing - this bypasses all the authentication complexity
const testLogin = async (email: string, password: string) => {
  console.log('Test login attempt:', email, password);
  
  // Simple test credentials
  if (email === 'admin@test.com' && password === 'admin123') {
    const admin: PlatformAdmin = {
      id: '1',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      school: 'Test School'
    };
    return { admin };
  }
  
  return { error: 'Invalid credentials' };
};

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('PlatformAdminProvider: Initializing...');
    
    // Check for stored session
    try {
      const adminData = localStorage.getItem('platformAdmin');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        console.log('PlatformAdminProvider: Restoring session:', parsedAdmin);
        setAdmin(parsedAdmin);
      }
    } catch (error) {
      console.error('PlatformAdminProvider: Session restoration error:', error);
      localStorage.removeItem('platformAdmin');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('PlatformAdminProvider: Login attempt for:', email);
      
      const result = await testLogin(email, password);
      
      if (result.admin) {
        console.log('PlatformAdminProvider: Login successful');
        setAdmin(result.admin);
        localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
        return { admin: result.admin };
      } else {
        console.log('PlatformAdminProvider: Login failed:', result.error);
        return { error: result.error };
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
  };

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
