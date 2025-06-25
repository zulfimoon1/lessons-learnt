
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

class SecureAdminAuthService {
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AdminAuthResult> {
    console.log('🔐 Secure admin authentication attempt:', credentials.email);
    
    try {
      // Rate limiting
      const rateLimitKey = `admin_auth:${credentials.email}`;
      if (!centralizedValidationService.checkRateLimit(rateLimitKey)) {
        await centralizedValidationService.logSecurityEvent({
          type: 'rate_limit_exceeded',
          details: `Admin authentication rate limit exceeded for ${credentials.email}`,
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
          details: `Invalid email format in admin login: ${credentials.email}`,
          severity: 'medium'
        });
        return { success: false, error: 'Invalid email format' };
      }

      if (!passwordValidation.isValid) {
        await centralizedValidationService.logSecurityEvent({
          type: 'form_validation_failed',
          details: `Invalid password format in admin login`,
          severity: 'medium'
        });
        return { success: false, error: 'Invalid password format' };
      }

      // Set admin context first
      await this.setPlatformAdminContext(credentials.email);
      
      // Query database for admin user
      const { data: adminData, error } = await supabase
        .from('teachers')
        .select('id, name, email, school, role')
        .eq('email', credentials.email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (error || !adminData) {
        await centralizedValidationService.logSecurityEvent({
          type: 'unauthorized_access',
          details: `Admin login failed - user not found: ${credentials.email}`,
          severity: 'high'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // In a real implementation, you would verify the password hash here
      // For now, we'll use a simple check
      if (credentials.password !== 'admin123') {
        await centralizedValidationService.logSecurityEvent({
          type: 'unauthorized_access',
          details: `Admin login failed - invalid password for: ${credentials.email}`,
          severity: 'high'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      await centralizedValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: adminData.id,
        details: `Successful admin login for ${credentials.email}`,
        severity: 'low'
      });

      return {
        success: true,
        admin: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          school: adminData.school
        }
      };

    } catch (error) {
      console.error('Admin authentication error:', error);
      
      await centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Admin authentication system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      console.log('🔍 Validating admin session for:', email);
      
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
        console.log('❌ Admin session validation failed - user not found');
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
      console.error('Admin session validation error:', error);
      return { valid: false };
    }
  }
}

export const secureAdminAuthService = new SecureAdminAuthService();
