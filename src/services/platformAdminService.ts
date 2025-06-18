
import { supabase } from '@/integrations/supabase/client';
import { securePlatformAdminService } from './securePlatformAdminService';

// Export types for components
export type { StudentStatistics, TeacherStatistics, PlatformStatistics } from '@/types/adminTypes';

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

// Enhanced password reset function
export const resetAdminPassword = async (email: string, newPassword: string = 'admin123') => {
  console.log('🔄 Password reset requested for:', email);
  
  // For the known admin, always return success since we're using hardcoded auth
  if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com') {
    return { 
      success: true, 
      message: '✅ Admin password is ready! Use "admin123" to log in.' 
    };
  }
  
  return { 
    success: false, 
    message: '❌ Password reset is only available for the platform administrator.' 
  };
};

// Enhanced test function using secure service
export const testPasswordVerification = async (email: string = 'zulfimoon1@gmail.com', password: string = 'admin123') => {
  console.log('🔍 Testing password verification for:', email);
  const result = await securePlatformAdminService.authenticateAdmin({ email, password });
  
  if (result.success) {
    return { 
      success: true, 
      message: '🎉 Admin authentication test successful! You can now log in.' 
    };
  } else {
    return { 
      success: false,
      message: result.error || '❌ Authentication test failed. Check your credentials.'
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
