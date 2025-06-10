
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
    console.log('PlatformAdminProvider: Starting secure initialization...');
    
    const restoreSecureAdminSession = async () => {
      try {
        const session = await enhancedSecureSessionService.getSession();
        
        if (session && session.userType === 'admin') {
          const adminData = localStorage.getItem('platformAdmin');
          if (adminData) {
            const parsedAdmin = JSON.parse(adminData);
            if (parsedAdmin && parsedAdmin.id === session.userId) {
              console.log('PlatformAdminProvider: Restoring secure admin session');
              setAdmin(parsedAdmin);
              await enhancedSecureSessionService.refreshSession(session);
            } else {
              console.log('PlatformAdminProvider: Invalid admin session data');
              enhancedSecureSessionService.clearSession();
            }
          }
        } else {
          console.log('PlatformAdminProvider: No valid admin session found');
          localStorage.removeItem('platformAdmin');
        }
      } catch (error) {
        console.error('PlatformAdminProvider: Session restoration error:', error);
        enhancedSecureSessionService.clearSession();
      }
    };

    restoreSecureAdminSession();
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('PlatformAdminProvider: Secure login attempt for:', email);
      
      const result = await platformAdminLoginService(email, password);
      
      if (result.admin && !result.error) {
        console.log('PlatformAdminProvider: Login successful');
        setAdmin(result.admin);
        
        // Create secure session
        await enhancedSecureSessionService.createSession(result.admin.id, 'admin', result.admin.school);
        
        // Store admin data securely
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
      } else {
        console.log('PlatformAdminProvider: Login failed:', result.error);
        
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Platform admin login failed: ${email}`,
          userAgent: navigator.userAgent
        });
        
        return { error: result.error };
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
    console.log('PlatformAdminProvider: Secure logout initiated');
    
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
    enhancedSecureSessionService.clearSession();
    
    console.log('PlatformAdminProvider: Secure logout complete');
  };

  console.log('PlatformAdminProvider: Current secure state - admin:', !!admin, 'isLoading:', isLoading);

  return (
    <PlatformAdminContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </PlatformAdminContext.Provider>
  );
};
