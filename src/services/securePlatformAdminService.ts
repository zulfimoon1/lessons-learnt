import { supabase } from '@/integrations/supabase/client';
import { secureAuthenticationService } from './secureAuthenticationService';
import { securityValidationService } from './securityValidationService';

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
  // Enhanced admin authentication with security logging
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AuthResult> {
    console.log('🔐 Secure admin authentication attempt:', credentials.email);
    
    try {
      // Log authentication attempt
      securityValidationService.logSecurityEvent({
        type: 'admin_login_attempt',
        details: `Admin login attempt for ${credentials.email}`,
        severity: 'medium'
      });

      // Use the secure authentication service
      const result = await secureAuthenticationService.authenticateAdmin(
        credentials.email, 
        credentials.password
      );

      if (result.success && result.user) {
        // Set platform admin context in database
        await this.setPlatformAdminContext(credentials.email);
        
        // Log successful authentication
        securityValidationService.logSecurityEvent({
          type: 'admin_login_success',
          userId: result.user.id,
          details: `Successful admin login for ${credentials.email}`,
          severity: 'low'
        });
        
        return {
          success: true,
          admin: result.user
        };
      } else {
        // Log failed authentication
        securityValidationService.logSecurityEvent({
          type: 'admin_login_failure',
          details: `Failed admin login for ${credentials.email}: ${result.error}`,
          severity: 'high'
        });
        
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Platform admin authentication error:', error);
      
      // Log system error
      securityValidationService.logSecurityEvent({
        type: 'admin_auth_system_error',
        details: `Authentication system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      
      return {
        success: false,
        error: 'Authentication system error'
      };
    }
  }

  // Validate admin session against database
  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      console.log('🔍 Validating admin session for:', email);
      
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

      await this.setPlatformAdminContext(email);
      
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

  // Enhanced platform admin context setting with security logging
  private async setPlatformAdminContext(adminEmail: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_platform_admin_context', {
        admin_email: adminEmail
      });

      if (error) {
        console.error('Failed to set platform admin context:', error);
        securityValidationService.logSecurityEvent({
          type: 'admin_context_failure',
          details: `Failed to set admin context for ${adminEmail}`,
          severity: 'high'
        });
      } else {
        console.log('✅ Platform admin context set successfully');
        securityValidationService.logSecurityEvent({
          type: 'admin_context_set',
          details: `Platform admin context set for ${adminEmail}`,
          severity: 'low'
        });
      }
    } catch (error) {
      console.error('Error setting platform admin context:', error);
      securityValidationService.logSecurityEvent({
        type: 'admin_context_error',
        details: `System error setting admin context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
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

      // Get student counts for each school
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
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  async createSchool(adminEmail: string, schoolName: string) {
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      // For now, we'll just return success since schools are created implicitly
      // when teachers or students are added with a school name
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
      // Use the existing platform_admin_delete_school function
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
    await this.setPlatformAdminContext(adminEmail);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          school_name: transactionData.school_name,
          amount: Math.round(parseFloat(transactionData.amount) * 100), // Convert to cents
          currency: transactionData.currency,
          transaction_type: transactionData.transaction_type,
          status: transactionData.status,
          description: transactionData.description
        })
        .select()
        .single();

      if (error) throw error;
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
      // Clean up demo/test data - implement as needed
      console.log('Demo data cleanup requested by:', adminEmail);
      // Implementation would go here based on specific requirements
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
