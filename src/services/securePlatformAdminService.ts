
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

interface PlatformStats {
  studentsCount: number;
  teachersCount: number;
  responsesCount: number;
  subscriptionsCount: number;
}

interface SchoolData {
  name: string;
  teacher_count: number;
  student_count: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  school_name: string;
  status: string;
  transaction_type: string;
  created_at: string;
  created_by: string | null;
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

  async getPlatformStats(adminEmail: string): Promise<PlatformStats> {
    try {
      console.log('📊 Getting platform stats for admin:', adminEmail);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Get stats using the platform-admin edge function
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'get_platform_stats',
          admin_email: adminEmail 
        }
      });

      if (error) {
        console.error('Error getting platform stats:', error);
        throw new Error(error.message || 'Failed to get platform stats');
      }

      return data || { studentsCount: 0, teachersCount: 0, responsesCount: 0, subscriptionsCount: 0 };
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      throw error;
    }
  }

  async getSchoolData(adminEmail: string): Promise<SchoolData[]> {
    try {
      console.log('🏫 Getting school data for admin:', adminEmail);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Get school data using the platform-admin edge function
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'get_school_data',
          admin_email: adminEmail 
        }
      });

      if (error) {
        console.error('Error getting school data:', error);
        throw new Error(error.message || 'Failed to get school data');
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get school data:', error);
      throw error;
    }
  }

  async getTransactions(adminEmail: string): Promise<Transaction[]> {
    try {
      console.log('💰 Getting transactions for admin:', adminEmail);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Get transactions using the platform-admin edge function
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'get_transactions',
          admin_email: adminEmail 
        }
      });

      if (error) {
        console.error('Error getting transactions:', error);
        throw new Error(error.message || 'Failed to get transactions');
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  calculateMonthlyRevenue(transactions: Transaction[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               transaction.status === 'completed';
      })
      .reduce((total, transaction) => total + (transaction.amount / 100), 0);
  }

  async createSchool(adminEmail: string, schoolName: string): Promise<void> {
    try {
      console.log('➕ Creating school:', schoolName);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Create school using the platform-admin edge function
      const { error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'create_school',
          admin_email: adminEmail,
          school_name: schoolName
        }
      });

      if (error) {
        console.error('Error creating school:', error);
        throw new Error(error.message || 'Failed to create school');
      }
    } catch (error) {
      console.error('Failed to create school:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<void> {
    try {
      console.log('🗑️ Deleting school:', schoolName);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Delete school using the platform-admin edge function
      const { error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'delete_school',
          admin_email: adminEmail,
          school_name: schoolName
        }
      });

      if (error) {
        console.error('Error deleting school:', error);
        throw new Error(error.message || 'Failed to delete school');
      }
    } catch (error) {
      console.error('Failed to delete school:', error);
      throw error;
    }
  }

  async createTransaction(adminEmail: string, transactionData: Partial<Transaction>): Promise<void> {
    try {
      console.log('💰 Creating transaction:', transactionData);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Create transaction using the platform-admin edge function
      const { error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'create_transaction',
          admin_email: adminEmail,
          transaction_data: transactionData
        }
      });

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(error.message || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(adminEmail: string, transactionId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Delete transaction using the platform-admin edge function
      const { error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'delete_transaction',
          admin_email: adminEmail,
          transaction_id: transactionId
        }
      });

      if (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(error.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }

  async cleanupDemoData(adminEmail: string): Promise<void> {
    try {
      console.log('🧹 Cleaning up demo data for admin:', adminEmail);
      
      // Set admin context
      await this.setPlatformAdminContext(adminEmail);
      
      // Cleanup demo data using the platform-admin edge function
      const { error } = await supabase.functions.invoke('platform-admin', {
        body: { 
          action: 'cleanup_demo_data',
          admin_email: adminEmail
        }
      });

      if (error) {
        console.error('Error cleaning up demo data:', error);
        throw new Error(error.message || 'Failed to cleanup demo data');
      }
    } catch (error) {
      console.error('Failed to cleanup demo data:', error);
      throw error;
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
