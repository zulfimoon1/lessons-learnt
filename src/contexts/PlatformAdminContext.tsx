
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformAdmin, platformAdminLoginService } from '@/services/platformAdminService';
import { enhancedSecureSessionService } from '@/services/enhancedSecureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

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
    console.log('PlatformAdminProvider: Starting initialization...');
    
    const restoreAdminSession = async () => {
      try {
        // Check for stored admin data
        const adminData = localStorage.getItem('platformAdmin');
        if (adminData) {
          try {
            const parsedAdmin = JSON.parse(adminData);
            if (parsedAdmin && parsedAdmin.id && parsedAdmin.email) {
              console.log('PlatformAdminProvider: Restoring admin session for:', parsedAdmin.email);
              setAdmin(parsedAdmin);
            } else {
              console.log('PlatformAdminProvider: Invalid admin data found, clearing');
              localStorage.removeItem('platformAdmin');
            }
          } catch (parseError) {
            console.error('PlatformAdminProvider: Error parsing admin data:', parseError);
            localStorage.removeItem('platformAdmin');
          }
        } else {
          console.log('PlatformAdminProvider: No admin session found');
        }
      } catch (error) {
        console.error('PlatformAdminProvider: Session restoration error:', error);
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
      
      if (result && 'admin' in result && result.admin) {
        console.log('PlatformAdminProvider: Login successful');
        setAdmin(result.admin);
        
        // Store admin data
        try {
          localStorage.setItem('platformAdmin', JSON.stringify(result.admin));
          
          logUserSecurityEvent({
            type: 'login_success',
            userId: result.admin.id,
            timestamp: new Date().toISOString(),
            details: `Platform admin login successful: ${email}`,
            userAgent: navigator.userAgent
          });
        } catch (storageError) {
          console.error('PlatformAdminProvider: Storage error:', storageError);
        }
        
        return { admin: result.admin };
      } else if (result && 'error' in result) {
        console.log('PlatformAdminProvider: Login failed:', result.error);
        
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Platform admin login failed: ${email}`,
          userAgent: navigator.userAgent
        });
        
        return { error: result.error };
      } else {
        console.log('PlatformAdminProvider: Unexpected result format');
        return { error: 'Login failed. Please try again.' };
      }
    } catch (error) {
      console.error('PlatformAdminProvider: Login error:', error);
      
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Platform admin login error: ${error}`,
        userAgent: navigator.userAgent
      });
      
      return { error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('PlatformAdminProvider: Logout initiated');
    
    // Log the logout event
    if (admin) {
      logUserSecurityEvent({
        type: 'logout',
        userId: admin.id,
        timestamp: new Date().toISOString(),
        details: `Platform admin logged out: ${admin.email}`,
        userAgent: navigator.userAgent
      });
    }
    
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
