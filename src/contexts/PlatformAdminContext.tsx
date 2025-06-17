
import React, { createContext, useContext, useState, useEffect } from 'react';
import { securePlatformAdminService } from '@/services/securePlatformAdminService';
import { supabase } from '@/integrations/supabase/client';

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

  // Load admin from localStorage on mount
  useEffect(() => {
    const loadStoredAdmin = async () => {
      try {
        const storedAdmin = localStorage.getItem('platform_admin');
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          
          // Validate the stored session
          const validation = await securePlatformAdminService.validateAdminSession(adminData.email);
          if (validation.valid && validation.admin) {
            setAdmin(validation.admin);
            setIsAuthenticated(true);
            console.log('🔐 Admin session restored:', adminData.email);
          } else {
            // Clear invalid session
            localStorage.removeItem('platform_admin');
            console.log('🔒 Invalid admin session cleared');
          }
        }
      } catch (error) {
        console.error('Error loading stored admin session:', error);
        localStorage.removeItem('platform_admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 PLATFORM ADMIN LOGIN:', email);
    setIsLoading(true);
    
    try {
      // Ensure the admin account exists first
      await ensureAdminAccountExists();

      const result = await securePlatformAdminService.authenticateAdmin({ email, password });
      
      if (result.success && result.admin) {
        setAdmin(result.admin);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('platform_admin', JSON.stringify(result.admin));
        
        console.log('✅ Platform admin login successful');
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

  const ensureAdminAccountExists = async () => {
    try {
      console.log('🔍 Ensuring admin account exists...');
      
      // Check if admin exists
      const { data: existingAdmin, error } = await supabase
        .from('teachers')
        .select('id, email, role')
        .eq('email', 'zulfimoon1@gmail.com')
        .eq('role', 'admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin:', error);
        return;
      }

      if (!existingAdmin) {
        console.log('🔄 Creating missing admin account...');
        
        // Import bcrypt dynamically
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);

        const { error: insertError } = await supabase
          .from('teachers')
          .insert({
            name: 'Platform Admin',
            email: 'zulfimoon1@gmail.com',
            school: 'Platform Administration',
            role: 'admin',
            password_hash: hashedPassword
          });

        if (insertError) {
          console.error('Error creating admin:', insertError);
        } else {
          console.log('✅ Admin account created successfully');
        }
      } else {
        console.log('✅ Admin account already exists');
      }
    } catch (error) {
      console.error('Error ensuring admin account:', error);
    }
  };

  const logout = () => {
    console.log('🔓 Platform admin logout');
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('platform_admin');
  };

  const validateSession = async () => {
    if (!admin?.email) return;
    
    try {
      const validation = await securePlatformAdminService.validateAdminSession(admin.email);
      if (!validation.valid) {
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
