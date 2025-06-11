
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    console.log('🔄 Platform Admin Provider: Initializing...');
    
    const checkSession = async () => {
      try {
        // Check if we have a stored admin session
        const adminData = localStorage.getItem('platformAdmin');
        
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          console.log('✅ Found stored admin session:', parsedAdmin.email);
          
          // Verify the admin still exists in database
          const { data: teachers, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', parsedAdmin.email)
            .eq('role', 'admin')
            .limit(1);

          if (error) {
            console.error('❌ Session verification failed:', error);
            localStorage.removeItem('platformAdmin');
          } else if (teachers && teachers.length > 0) {
            console.log('✅ Session verified successfully');
            setAdmin(parsedAdmin);
          } else {
            console.log('❌ Admin not found in database, clearing session');
            localStorage.removeItem('platformAdmin');
          }
        } else {
          console.log('❌ No admin session found');
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        localStorage.removeItem('platformAdmin');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string; admin?: PlatformAdmin }> => {
    console.log('🔐 Platform Admin: Starting login for:', email);
    setIsLoading(true);
    
    try {
      // Query teachers table for admin users
      const { data: teachers, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .limit(1);

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
      
      // For now, we'll do a simple password check - in production you'd use bcrypt
      if (password !== 'admin123') {
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
      
      console.log('✅ Platform admin login successful');
      
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
    console.log('🚪 Platform admin logout');
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
