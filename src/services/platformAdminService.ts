
import { supabase } from '@/integrations/supabase/client';
import { securePlatformAdminService } from './securePlatformAdminService';

// Legacy service - now using secure implementation
export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

// Redirect to secure service
export const platformAdminLoginService = async (email: string, password: string) => {
  console.log('⚠️ Using legacy platformAdminLoginService - redirecting to secure service');
  const result = await securePlatformAdminService.authenticateAdmin({ email, password });
  
  if (result.success && result.admin) {
    return { admin: result.admin };
  } else {
    return { error: result.error };
  }
};

// Redirect password reset to secure service
export const resetAdminPassword = async (email: string, newPassword: string = 'admin123') => {
  console.log('⚠️ Using legacy resetAdminPassword - redirecting to secure service');
  return await securePlatformAdminService.createSecureAdminPassword(email, newPassword);
};

// Enhanced test function using secure service
export const testPasswordVerification = async (email: string = 'zulfimoon1@gmail.com', password: string = 'admin123') => {
  console.log('⚠️ Using legacy testPasswordVerification - redirecting to secure service');
  const result = await securePlatformAdminService.authenticateAdmin({ email, password });
  
  if (result.success) {
    return { 
      success: true, 
      message: '🎉 Admin authentication test successful!' 
    };
  } else {
    return { 
      error: result.error || 'Authentication test failed' 
    };
  }
};

// Add admin security utilities
export const adminSecurityUtils = {
  getSecurityMetrics: async () => {
    try {
      // Mock security metrics for now - in production, fetch from security service
      return {
        loginAttempts: 12,
        suspiciousActivities: 3,
        blockedIPs: 7,
        lastSecurityScan: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }
};
