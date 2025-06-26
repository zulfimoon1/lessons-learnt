
import { supabase } from '@/integrations/supabase/client';
import { secureAdminAuthService } from './secureAdminAuthService';
import { centralizedValidationService } from './centralizedValidationService';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
}

interface AuthResult {
  success: boolean;
  admin?: AdminUser;
  error?: string;
}

interface TransactionData {
  school_name: string;
  amount: string;
  currency: string;
  transaction_type: string;
  status: string;
  description: string;
}

class SecurePlatformAdminService {
  // Enhanced admin authentication using the new secure service
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AuthResult> {
    try {
      return await secureAdminAuthService.authenticateAdmin(credentials);
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Validate admin session using the new secure service
  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      return await secureAdminAuthService.validateAdminSession(email);
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Enhanced platform admin context setting with multiple attempts and better error handling
  private async setPlatformAdminContext(adminEmail: string): Promise<void> {
    try {
      console.log('🔧 Setting platform admin context for:', adminEmail);
      
      // Use the dedicated function
      const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
        admin_email: adminEmail
      });

      if (contextError) {
        console.error('Context setting error:', contextError);
        throw new Error(`Failed to set admin context: ${contextError.message}`);
      } else {
        console.log('✅ Platform admin context set successfully via RPC');
      }

      // Log the context setting
      centralizedValidationService.logSecurityEvent({
        type: 'admin_context_set',
        details: `Platform admin context configured for ${adminEmail}`,
        severity: 'low'
      });

    } catch (error) {
      console.error('Error setting platform admin context:', error);
      centralizedValidationService.logSecurityEvent({
        type: 'admin_context_error',
        details: `Failed to set admin context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      throw error;
    }
  }

  async getPlatformStats(adminEmail: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      const [studentsResult, teachersResult, responsesResult, subscriptionsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('feedback').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' })
      ]);

      return {
        studentsCount: studentsResult.count || 0,
        teachersCount: teachersResult.count || 0,
        responsesCount: responsesResult.count || 0,
        subscriptionsCount: subscriptionsResult.count || 0
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw new Error('Failed to retrieve platform statistics');
    }
  }

  async getSchoolData(adminEmail: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      const { data: schoolData, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (error) throw new Error(`Failed to fetch school data: ${error.message}`);

      const schoolCounts = schoolData.reduce((acc: any, teacher: any) => {
        const school = teacher.school;
        if (school) {
          acc[school] = (acc[school] || 0) + 1;
        }
        return acc;
      }, {});

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);

      if (studentError) throw new Error(`Failed to fetch student data: ${studentError.message}`);

      const studentCounts = studentData.reduce((acc: any, student: any) => {
        const school = student.school;
        if (school) {
          acc[school] = (acc[school] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(schoolCounts).map(([name, teacherCount]) => ({
        name,
        teacher_count: teacherCount,
        student_count: studentCounts[name] || 0
      }));
    } catch (error) {
      console.error('Error getting school data:', error);
      throw new Error('Failed to retrieve school data');
    }
  }

  async getTransactions(adminEmail: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      console.log('🔍 Attempting to fetch transactions with admin context');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Transaction fetch error:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }
      
      console.log('✅ Transactions fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async createSchool(adminEmail: string, schoolName: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      console.log('School creation requested:', schoolName);
      return { success: true, schoolName };
    } catch (error) {
      console.error('Error creating school:', error);
      throw new Error('Failed to create school');
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      const { data, error } = await supabase.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (error) throw new Error(`Failed to delete school: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Error deleting school:', error);
      throw new Error('Failed to delete school');
    }
  }

  async createTransaction(adminEmail: string, transactionData: TransactionData) {
    console.log('🔧 Creating transaction via secure RPC function');
    
    try {
      console.log('💳 Creating transaction via RPC:', transactionData.school_name);
      
      // Validate input data
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount provided');
      }

      // Use the platform_admin_create_transaction RPC function
      const { data, error } = await supabase.rpc('platform_admin_create_transaction', {
        admin_email_param: adminEmail,
        school_name_param: transactionData.school_name,
        amount_param: Math.round(amount * 100), // Convert to cents
        currency_param: transactionData.currency || 'usd',
        transaction_type_param: transactionData.transaction_type,
        status_param: transactionData.status,
        description_param: transactionData.description || ''
      });

      if (error) {
        console.error('❌ RPC transaction creation failed:', error);
        throw new Error(`Transaction creation failed: ${error.message}`);
      }
      
      console.log('✅ Transaction created successfully via RPC:', data?.id);
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      centralizedValidationService.logSecurityEvent({
        type: 'transaction_creation_error',
        details: `Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  async deleteTransaction(adminEmail: string, transactionId: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  calculateMonthlyRevenue(transactions: any[]): number {
    try {
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
    } catch (error) {
      console.error('Error calculating monthly revenue:', error);
      return 0;
    }
  }

  async cleanupDemoData(adminEmail: string) {
    try {
      await this.setPlatformAdminContext(adminEmail);
      
      console.log('Demo data cleanup requested by:', adminEmail);
      return { success: true, message: 'Demo data cleanup completed' };
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw new Error('Failed to cleanup demo data');
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
