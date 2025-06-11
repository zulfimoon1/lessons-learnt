
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
  isAuthenticated: boolean;
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
    console.log('🔄 Initializing platform admin provider...');
    
    const checkSession = () => {
      try {
        const adminData = localStorage.getItem('platformAdmin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          console.log('✅ Found existing admin session:', parsedAdmin.email);
          setAdmin(parsedAdmin);
        } else {
          console.log('❌ No existing admin session');
        }
      } catch (error) {
        console.error('❌ Session check failed:', error);
        localStorage.removeItem('platformAdmin');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string; admin?: PlatformAdmin }> => {
    console.log('🔐 Starting platform admin login for:', email);
    setIsLoading(true);
    
    try {
      // First, set the platform admin context for this session
      console.log('🔧 Setting platform admin context...');
      
      // Query teachers table for admin users directly
      const { data: teachers, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin');

      if (queryError) {
        console.error('❌ Database query error:', queryError);
        setIsLoading(false);
        return { error: 'Database connection failed' };
      }

      if (!teachers || teachers.length === 0) {
        console.log('❌ No admin found with email:', email);
        setIsLoading(false);
        return { error: 'Invalid admin credentials' };
      }

      const teacher = teachers[0];
      console.log('🔍 Found admin user:', teacher.name);
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, teacher.password_hash);
      
      if (!passwordMatch) {
        console.log('❌ Password verification failed');
        setIsLoading(false);
        return { error: 'Invalid password' };
      }

      const adminUser: PlatformAdmin = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        school: teacher.school
      };
      
      console.log('✅ Platform admin login successful for:', adminUser.email);
      
      // Store session
      setAdmin(adminUser);
      localStorage.setItem('platformAdmin', JSON.stringify(adminUser));
      
      setIsLoading(false);
      return { admin: adminUser };
      
    } catch (error) {
      console.error('❌ Platform admin login error:', error);
      setIsLoading(false);
      return { error: 'Authentication failed' };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out platform admin');
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
  };

  const isAuthenticated = admin !== null;

  const value = {
    admin,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <PlatformAdminContext.Provider value={value}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
