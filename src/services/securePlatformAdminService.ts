
import { supabase } from '@/integrations/supabase/client';
import { centralizedValidationService } from './centralizedValidationService';

interface AdminAuthResult {
  success: boolean;
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    school: string;
  };
  error?: string;
}

class SecurePlatformAdminService {
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AdminAuthResult> {
    console.log('🔐 Secure platform admin authentication attempt:', credentials.email);
    
    try {
      // Rate limiting
      const rateLimitKey = `platform_admin_auth:${credentials.email}`;
      if (!centralizedValidationService.checkRateLimit(rateLimitKey)) {
        await centralizedValidationService.logSecurityEvent({
          type: 'rate_limit_exceeded',
          details: `Platform admin authentication rate limit exceeded for ${credentials.email}`,
          severity: 'medium'
        });
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      // Input validation
      const emailValidation = centralizedValidationService.validateEmail(credentials.email);
      const passwordValidation = centralizedValidationService.validatePassword(credentials.password);

      if (!emailValidation.isValid) {
        await centralizedValidationService.logSecurityEvent({
          type: 'form_validation_failed',
          details: `Invalid email format in platform admin login: ${credentials.email}`,
          severity: 'medium'
        });
        return { success: false, error: 'Invalid email format' };
      }

      if (!passwordValidation.isValid) {
        await centralizedValidationService.logSecurityEvent({
          type: 'form_validation_failed',
          details: `Invalid password format in platform admin login`,
          severity: 'medium'
        });
        return { success: false, error: 'Invalid password format' };
      }

      // Set platform admin context
      await this.setPlatformAdminContext(credentials.email);
      
      // Use Edge Function for secure authentication
      const { data, error } = await supabase.functions.invoke('authenticate-platform-admin', {
        body: {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        }
      });

      if (error || !data.success) {
        await centralizedValidationService.logSecurityEvent({
          type: 'unauthorized_access',
          details: `Platform admin login failed: ${data?.error || error?.message}`,
          severity: 'high'
        });
        return { success: false, error: data?.error || 'Authentication failed' };
      }

      await centralizedValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: data.admin.id,
        details: `Successful platform admin login for ${credentials.email}`,
        severity: 'low'
      });

      return {
        success: true,
        admin: data.admin
      };

    } catch (error) {
      console.error('Platform admin authentication error:', error);
      
      await centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Platform admin authentication system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      
      return { success: false, error: 'Authentication system error' };
    }
  }

  private async setPlatformAdminContext(adminEmail: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_platform_admin_context', {
        admin_email: adminEmail
      });

      if (error) {
        console.error('Failed to set platform admin context:', error);
      } else {
        console.log('✅ Platform admin context set successfully');
      }
    } catch (error) {
      console.error('Error setting platform admin context:', error);
    }
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: any }> {
    try {
      console.log('🔍 Validating platform admin session for:', email);
      
      // Set admin context
      await this.setPlatformAdminContext(email);
      
      // Query database to verify admin exists and is active
      const { data: adminData, error } = await supabase
        .from('teachers')
        .select('id, name, email, school, role')
        .eq('email', email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (error || !adminData) {
        console.log('❌ Platform admin session validation failed - user not found');
        return { valid: false };
      }
      
      return {
        valid: true,
        admin: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          school: adminData.school,
          role: adminData.role
        }
      };
    } catch (error) {
      console.error('Platform admin session validation error:', error);
      return { valid: false };
    }
  }

  async changePassword(currentPassword: string, newPassword: string, adminEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Platform admin password change attempt for:', adminEmail);
      
      // Use Edge Function for secure password change
      const { data, error } = await supabase.functions.invoke('change-admin-password', {
        body: {
          email: adminEmail,
          currentPassword,
          newPassword
        }
      });

      if (error || !data.success) {
        return { success: false, error: data?.error || 'Password change failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change system error' };
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
