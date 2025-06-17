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

      const adminEmail = loginData.email.toLowerCase().trim();
      
      // Handle the specific admin account
      if (adminEmail === 'zulfimoon1@gmail.com') {
        console.log('🔍 Authenticating platform admin...');
        
        try {
          // First try to fetch existing admin without setting context
          let { data: existingAdmin, error: fetchError } = await supabase
            .from('teachers')
            .select('id, email, name, role, school, password_hash')
            .eq('email', adminEmail)
            .eq('role', 'admin')
            .maybeSingle();

          console.log('📊 Fetch result:', { existingAdmin: !!existingAdmin, fetchError });

          // If admin doesn't exist, try to create it
          if (!existingAdmin && !fetchError) {
            console.log('🔄 Creating admin account...');
            
            try {
              // Hash the password
              const hashedPassword = await bcrypt.hash('admin123', 12);
              
              // Try inserting the admin account
              const { data: insertResult, error: insertError } = await supabase
                .from('teachers')
                .insert({
                  name: 'Platform Admin',
                  email: adminEmail,
                  school: 'Platform Administration',
                  role: 'admin',
                  password_hash: hashedPassword
                })
                .select()
                .single();

              if (insertError) {
                console.error('❌ Failed to create admin account:', insertError);
                return { success: false, error: 'Failed to create admin account. Please contact support.' };
              }

              existingAdmin = insertResult;
              console.log('✅ Admin account created successfully');
            } catch (createError) {
              console.error('❌ Error creating admin:', createError);
              return { success: false, error: 'Failed to create admin account' };
            }
          }

          // If we still don't have an admin account, there's a problem
          if (!existingAdmin) {
            console.error('❌ Could not find or create admin account');
            return { success: false, error: 'Admin account not available' };
          }

          // Verify password
          console.log('🔍 Verifying password...');
          const isValidPassword = await bcrypt.compare(loginData.password, existingAdmin.password_hash);

          if (!isValidPassword) {
            console.error('❌ Invalid password for admin');
            return { success: false, error: 'Invalid credentials' };
          }

          // Set platform admin context after successful authentication
          console.log('🔍 Setting platform admin context...');
          const { error: contextError } = await supabase
            .rpc('set_platform_admin_context', {
              admin_email: adminEmail
            });

          if (contextError) {
            console.warn('⚠️ Context setting warning:', contextError);
            // Don't fail authentication if context setting fails
          }

          console.log('✅ Platform admin authentication successful');

          return {
            success: true,
            admin: {
              id: existingAdmin.id,
              email: existingAdmin.email,
              name: existingAdmin.name,
              role: existingAdmin.role,
              school: existingAdmin.school
            }
          };

        } catch (authError) {
          console.error('💥 Error during admin authentication:', authError);
          return { 
            success: false, 
            error: 'Authentication system error. Please try again.' 
          };
        }
      }

      return { success: false, error: 'Invalid credentials' };

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
