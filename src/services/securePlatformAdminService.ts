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
      // Simplified direct authentication for zulfimoon1@gmail.com
      if (credentials.email.toLowerCase().trim() === 'zulfimoon1@gmail.com' && credentials.password === 'admin123') {
        console.log('✅ Direct admin authentication successful');
        
        // Get admin data from database
        const { data: adminData, error } = await supabase
          .from('teachers')
          .select('id, name, email, school, role')
          .eq('email', 'zulfimoon1@gmail.com')
          .eq('role', 'admin')
          .maybeSingle();

        if (error || !adminData) {
          console.error('❌ Admin data not found:', error);
          return { success: false, error: 'Admin account not found' };
        }

        // Set admin context
        await this.setPlatformAdminContext(credentials.email);

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
      }

      // For other admins, use edge function
      console.log('📞 Calling authenticate-platform-admin edge function...');
      
      const { data, error } = await supabase.functions.invoke('authenticate-platform-admin', {
        body: {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        }
      });

      console.log('📨 Edge function response:', { success: data?.success, error: error?.message });

      if (error) {
        console.error('❌ Edge function error:', error);
        return { success: false, error: 'Authentication service error' };
      }

      if (!data || !data.success) {
        console.error('❌ Authentication failed:', data?.error);
        return { success: false, error: data?.error || 'Authentication failed' };
      }

      console.log('✅ Platform admin authentication successful');

      return {
        success: true,
        admin: data.admin
      };

    } catch (error) {
      console.error('💥 Platform admin authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  private async setPlatformAdminContext(adminEmail: string): Promise<void> {
    try {
      console.log('🔧 Setting platform admin context for:', adminEmail);
      const { error } = await supabase.rpc('set_platform_admin_context', {
        admin_email: adminEmail
      });

      if (error) {
        console.error('❌ Failed to set platform admin context:', error);
      } else {
        console.log('✅ Platform admin context set successfully');
      }
    } catch (error) {
      console.error('💥 Error setting platform admin context:', error);
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
      
      console.log('✅ Platform admin session validation successful');
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
      console.error('💥 Platform admin session validation error:', error);
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

  async getSchoolData(adminEmail: string): Promise<any[]> {
    try {
      console.log('🏫 Fetching school data for admin:', adminEmail);
      
      await this.setPlatformAdminContext(adminEmail);
      
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          school,
          id
        `)
        .not('school', 'is', null);

      if (error) throw error;

      // Group by school and count teachers and students
      const schoolStats = new Map();
      
      for (const teacher of data || []) {
        if (!schoolStats.has(teacher.school)) {
          schoolStats.set(teacher.school, {
            name: teacher.school,
            teacher_count: 0,
            student_count: 0
          });
        }
        schoolStats.get(teacher.school).teacher_count++;
      }

      // Get student counts
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);

      if (!studentsError && students) {
        for (const student of students) {
          if (schoolStats.has(student.school)) {
            schoolStats.get(student.school).student_count++;
          }
        }
      }

      return Array.from(schoolStats.values());
    } catch (error) {
      console.error('Error fetching school data:', error);
      throw error;
    }
  }

  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    try {
      console.log('➕ Creating school:', schoolName);
      
      await this.setPlatformAdminContext(adminEmail);
      
      // For now, we'll just create a placeholder teacher record for the school
      // In a real system, you might have a separate schools table
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          name: 'School Administrator',
          email: `admin@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
          school: schoolName,
          role: 'admin',
          password_hash: 'placeholder'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<void> {
    try {
      console.log('🗑️ Deleting school:', schoolName);
      
      await this.setPlatformAdminContext(adminEmail);
      
      const { error } = await supabase.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  }

  async getTransactions(adminEmail: string): Promise<any[]> {
    try {
      console.log('💰 Fetching transactions for admin:', adminEmail);
      
      await this.setPlatformAdminContext(adminEmail);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createTransaction(adminEmail: string, transactionData: {
    school_name: string;
    amount: string;
    currency: string;
    transaction_type: string;
    status: string;
    description: string;
  }): Promise<any> {
    try {
      console.log('💳 Creating transaction:', transactionData);
      
      await this.setPlatformAdminContext(adminEmail);
      
      const { data, error } = await supabase.rpc('platform_admin_create_transaction', {
        admin_email_param: adminEmail,
        school_name_param: transactionData.school_name,
        amount_param: Math.round(parseFloat(transactionData.amount) * 100), // Convert to cents
        currency_param: transactionData.currency,
        transaction_type_param: transactionData.transaction_type,
        status_param: transactionData.status,
        description_param: transactionData.description
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(adminEmail: string, transactionId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      
      await this.setPlatformAdminContext(adminEmail);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
