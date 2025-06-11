
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

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

const databaseLogin = async (email: string, password: string) => {
  console.log('🔐 Attempting database login for:', email);
  
  try {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin');

    if (error) {
      console.error('❌ Database query error:', error);
      return { error: 'Database connection failed' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ No admin found with email:', email);
      return { error: 'Invalid admin credentials' };
    }

    const teacher = teachers[0];
    console.log('🔍 Found admin:', teacher.name);
    
    const passwordMatch = await bcrypt.compare(password, teacher.password_hash);
    
    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      return { error: 'Invalid password' };
    }

    const admin: PlatformAdmin = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      school: teacher.school
    };
    
    console.log('✅ Admin login successful:', admin.name);
    return { admin };
    
  } catch (error) {
    console.error('❌ Login exception:', error);
    return { error: 'Authentication system error' };
  }
};

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Initializing PlatformAdminProvider...');
    
    const initializeAdmin = () => {
      try {
        const adminData = localStorage.getItem('platformAdmin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          console.log('🔄 Restoring admin session for:', parsedAdmin.email);
          setAdmin(parsedAdmin);
        } else {
          console.log('📭 No stored admin session found');
        }
      } catch (error) {
        console.error('❌ Session restoration failed:', error);
        localStorage.removeItem('platformAdmin');
      } finally {
        setIsLoading(false);
        console.log('✅ Admin provider initialized');
      }
    };

    initializeAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Login attempt for:', email);
    setIsLoading(true);
    
    try {
      const result = await databaseLogin(email, password);
      
      if (result.admin) {
        console.log('✅ Setting admin state for:', result.admin.email);
        setAdmin(result.admin);
        localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
        return { admin: result.admin };
      } else {
        console.log('❌ Login failed:', result.error);
        return { error: result.error };
      }
    } catch (error) {
      console.error('❌ Login process failed:', error);
      return { error: 'System error during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Admin logout initiated');
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
    console.log('✅ Admin session cleared');
  };

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
