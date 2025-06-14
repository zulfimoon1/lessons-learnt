
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
  private readonly ADMIN_RATE_LIMIT_ATTEMPTS = 3;
  private readonly ADMIN_RATE_LIMIT_WINDOW = 900000; // 15 minutes

  async authenticateAdmin(loginData: SecureAdminLoginData): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    console.log('🔐 SECURE ADMIN AUTHENTICATION ATTEMPT');
    
    try {
      // Rate limiting check
      const rateLimitKey = `admin_login_${loginData.email}`;
      if (!securityValidationService.checkRateLimit(rateLimitKey, this.ADMIN_RATE_LIMIT_ATTEMPTS, this.ADMIN_RATE_LIMIT_WINDOW)) {
        await securityValidationService.logSecurityEvent(
          'rate_limit_exceeded',
          loginData.email,
          'Admin login rate limit exceeded',
          'high'
        );
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }

      // Input validation
      const emailValidation = securityValidationService.validateInput(loginData.email, 'email');
      if (!emailValidation.isValid) {
        await securityValidationService.logSecurityEvent(
          'form_validation_failed',
          loginData.email,
          `Admin email validation failed: ${emailValidation.errors.join(', ')}`,
          'medium'
        );
        return { success: false, error: 'Invalid email format' };
      }

      const passwordValidation = securityValidationService.validateInput(loginData.password, 'password', { minLength: 1, maxLength: 128 });
      if (!passwordValidation.isValid) {
        await securityValidationService.logSecurityEvent(
          'form_validation_failed',
          loginData.email,
          'Admin password validation failed',
          'medium'
        );
        return { success: false, error: 'Invalid password format' };
      }

      console.log('🔍 Looking up admin in database...');
      
      // Fetch admin user from database
      const { data: adminUser, error: fetchError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', emailValidation.sanitizedValue)
        .eq('role', 'admin')
        .single();

      if (fetchError || !adminUser) {
        await securityValidationService.logSecurityEvent(
          'unauthorized_access',
          loginData.email,
          'Admin login attempt with non-existent user',
          'medium'
        );
        console.error('❌ Admin user not found:', fetchError);
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('✅ Admin user found, verifying password...');

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(loginData.password, adminUser.password_hash);

      if (!isValidPassword) {
        await securityValidationService.logSecurityEvent(
          'unauthorized_access',
          loginData.email,
          'Admin login with invalid password',
          'high'
        );
        console.error('❌ Invalid password for admin');
        return { success: false, error: 'Invalid credentials' };
      }

      console.log('✅ Admin authentication successful');
      
      await securityValidationService.logSecurityEvent(
        'unauthorized_access', // Using closest available type for successful login
        loginData.email,
        'Successful admin login',
        'low'
      );

      return {
        success: true,
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          school: adminUser.school
        }
      };

    } catch (error) {
      console.error('💥 Error in admin authentication:', error);
      await securityValidationService.logSecurityEvent(
        'suspicious_activity',
        loginData.email,
        `Admin authentication system error: ${error}`,
        'high'
      );
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

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        return { success: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
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
      await securityValidationService.logSecurityEvent(
        'unauthorized_access', // Using closest available type for admin action
        email,
        'Admin password updated successfully',
        'medium'
      );

      return { success: true };

    } catch (error) {
      console.error('💥 Error updating admin password:', error);
      return { success: false, error: 'System error updating password' };
    }
  }

  // Additional secure platform admin methods...
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
