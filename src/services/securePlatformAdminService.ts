
import { supabase } from '@/integrations/supabase/client';
import { securityValidationService } from './securityValidationService';
import bcrypt from 'bcryptjs';

export interface SecureAdminLoginData {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
}

class SecurePlatformAdminService {
  private readonly ADMIN_RATE_LIMIT_ATTEMPTS = 5;
  private readonly ADMIN_RATE_LIMIT_WINDOW = 900000; // 15 minutes

  async authenticateAdmin(loginData: SecureAdminLoginData): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    console.log('🔐 SECURE ADMIN AUTHENTICATION ATTEMPT for:', loginData.email);
    
    try {
      // Basic email validation
      if (!loginData.email || !loginData.password) {
        return { success: false, error: 'Email and password are required' };
      }

      // First set the platform admin context
      console.log('🔍 Setting platform admin context...');
      
      const { error: contextError } = await supabase
        .rpc('set_platform_admin_context', {
          admin_email: loginData.email.toLowerCase().trim()
        });

      if (contextError) {
        console.error('❌ Context setting error:', contextError);
        return { success: false, error: 'Authentication context error' };
      }

      // Now fetch the admin user directly
      console.log('🔍 Fetching admin user...');
      
      const { data: adminData, error: fetchError } = await supabase
        .from('teachers')
        .select('id, email, name, role, school, password_hash')
        .eq('email', loginData.email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (fetchError || !adminData) {
        console.error('❌ No admin user found:', fetchError);
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('✅ Admin user found:', adminData.email);

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(loginData.password, adminData.password_hash);

      if (!isValidPassword) {
        console.error('❌ Invalid password for admin');
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('✅ Platform admin authentication successful');

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
      console.error('💥 Error in admin authentication:', error);
      return { 
        success: false, 
        error: 'Authentication system error. Please try again.' 
      };
    }
  }

  async createSecureAdminPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Input validation
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { success: false, error: 'Invalid email format' };
      }

      // Password strength validation
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long' };
      }

      console.log('🔐 Creating secure password hash...');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const { error } = await supabase
        .from('teachers')
        .update({ password_hash: passwordHash })
        .eq('email', emailValidation.sanitizedValue)
        .eq('role', 'admin');

      if (error) {
        console.error('❌ Error updating admin password:', error);
        return { success: false, error: 'Failed to update password' };
      }

      console.log('✅ Admin password updated successfully');
      return { success: true };

    } catch (error) {
      console.error('💥 Error updating admin password:', error);
      return { success: false, error: 'System error updating password' };
    }
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { valid: false };
      }

      const { data: adminUser, error } = await supabase
        .from('teachers')
        .select('id, email, name, role, school')
        .eq('email', emailValidation.sanitizedValue)
        .eq('role', 'admin')
        .single();

      if (error || !adminUser) {
        return { valid: false };
      }

      return {
        valid: true,
        admin: adminUser as AdminUser
      };

    } catch (error) {
      console.error('Error validating admin session:', error);
      return { valid: false };
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
