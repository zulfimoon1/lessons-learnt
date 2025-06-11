
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

// Real database login function
const databaseLogin = async (email: string, password: string) => {
  console.log('🔐 Database login attempt:', email);
  
  try {
    // Query the teachers table for admin users
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin');

    if (error) {
      console.error('❌ Database query error:', error);
      return { error: 'Database error occurred' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ No admin found with email:', email);
      return { error: 'Invalid credentials' };
    }

    const teacher = teachers[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, teacher.password_hash);
    
    if (!passwordMatch) {
      console.log('❌ Password mismatch');
      return { error: 'Invalid credentials' };
    }

    const admin: PlatformAdmin = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      school: teacher.school
    };
    
    console.log('✅ Login successful for:', admin.name);
    return { admin };
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const PlatformAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 PlatformAdminProvider initializing...');
    
    // Check for stored session
    try {
      const adminData = localStorage.getItem('platformAdmin');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        console.log('🔄 Restoring admin session:', parsedAdmin);
        setAdmin(parsedAdmin);
      }
    } catch (error) {
      console.error('❌ Session restoration error:', error);
      localStorage.removeItem('platformAdmin');
    }
    
    setIsLoading(false);
    console.log('✅ PlatformAdminProvider ready');
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Processing login for:', email);
      
      const result = await databaseLogin(email, password);
      
      if (result.admin) {
        console.log('✅ Setting admin state');
        setAdmin(result.admin);
        localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
        return { admin: result.admin };
      } else {
        console.log('❌ Login failed:', result.error);
        return { error: result.error };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('🚪 Logout initiated');
    setAdmin(null);
    localStorage.removeItem('platformAdmin');
  };

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
