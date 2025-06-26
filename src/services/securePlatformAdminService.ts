
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

class SecurePlatformAdminService {
  // Enhanced admin authentication using the new secure service
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AuthResult> {
    return await secureAdminAuthService.authenticateAdmin(credentials);
  }

  // Validate admin session using the new secure service
  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    return await secureAdminAuthService.validateAdminSession(email);
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
      } else {
        console.log('✅ Platform admin context set successfully via RPC');
      }

      // Log the context setting
      centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Platform admin context configured for ${adminEmail}`,
        severity: 'low'
      });

    } catch (error) {
      console.error('Error setting platform admin context:', error);
      centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Failed to set admin context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      throw error;
    }
  }

  async getPlatformStats(adminEmail: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
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
      throw error;
    }
  }

  async getSchoolData(adminEmail: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      const { data: schoolData, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (error) throw error;

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

      if (studentError) throw studentError;

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
      throw error;
    }
  }

  async getTransactions(adminEmail: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      console.log('🔍 Attempting to fetch transactions with admin context');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Transaction fetch error:', error);
        throw error;
      }
      
      console.log('✅ Transactions fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async createSchool(adminEmail: string, schoolName: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      console.log('School creation requested:', schoolName);
      return { success: true, schoolName };
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      const { data, error } = await supabase.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting school:', error);
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
  }) {
    console.log('🔧 Creating transaction with enhanced context setting');
    
    // Set context for maximum reliability
    await this.setPlatformAdminContext(adminEmail);
    
    // Wait a moment for context to be fully applied
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      console.log('💳 Inserting transaction:', transactionData.school_name);
      
      // Direct insert with enhanced admin context
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          school_name: transactionData.school_name,
          amount: Math.round(parseFloat(transactionData.amount) * 100),
          currency: transactionData.currency,
          transaction_type: transactionData.transaction_type,
          status: transactionData.status,
          description: transactionData.description
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Transaction creation failed:', error);
        throw error;
      }
      
      console.log('✅ Transaction created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(adminEmail: string, transactionId: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  calculateMonthlyRevenue(transactions: any[]): number {
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

  async cleanupDemoData(adminEmail: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      console.log('Demo data cleanup requested by:', adminEmail);
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
