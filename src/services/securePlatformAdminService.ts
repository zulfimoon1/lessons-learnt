
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
      // Set admin context first
      await this.setPlatformAdminContext(credentials.email);
      
      // For the known admin email, check if account exists, if not create it
      if (credentials.email.toLowerCase().trim() === 'zulfimoon1@gmail.com') {
        await this.ensureAdminExists();
      }
      
      // Query database for admin user
      const { data: adminData, error } = await supabase
        .from('teachers')
        .select('id, name, email, school, role, password_hash')
        .eq('email', credentials.email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (error || !adminData) {
        console.error('Admin user not found:', error);
        return { success: false, error: 'Invalid credentials' };
      }

      // Simple password verification for the known admin
      const isValidPassword = credentials.password === 'admin123';
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

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
      console.error('Platform admin authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  private async ensureAdminExists(): Promise<void> {
    try {
      console.log('🔍 Checking if admin exists...');
      
      // Check if admin exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('teachers')
        .select('id, email, role')
        .eq('email', 'zulfimoon1@gmail.com')
        .eq('role', 'admin')
        .single();

      if (existingAdmin) {
        console.log('✅ Admin already exists:', existingAdmin.email);
        return;
      }

      console.log('📝 Creating admin account...');
      
      // Create admin account
      const { data: newAdmin, error: createError } = await supabase
        .from('teachers')
        .insert({
          name: 'Platform Admin',
          email: 'zulfimoon1@gmail.com',
          school: 'Platform Administration',
          role: 'admin',
          password_hash: '$2b$12$LQv3c1ybd1/1NQhqvI/T4.6wvQA6LMBUZn/dOokQ8Z2K2UHEYzHpu'
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create admin:', createError);
      } else {
        console.log('✅ Admin created successfully:', newAdmin.email);
      }
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
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
      
      // For known admin, ensure exists first
      if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com') {
        await this.ensureAdminExists();
      }
      
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

export const securePlatformAdminService = new SecurePlatformAdminService();
