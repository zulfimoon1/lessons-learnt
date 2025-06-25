import { supabase } from '@/integrations/supabase/client';
import { secureAuthenticationService } from './secureAuthenticationService';

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
  // Remove hardcoded credentials and use database authentication
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AuthResult> {
    console.log('🔐 Secure admin authentication attempt:', credentials.email);
    
    try {
      // Use the secure authentication service
      const result = await secureAuthenticationService.authenticateAdmin(
        credentials.email, 
        credentials.password
      );

      if (result.success && result.user) {
        // Set platform admin context in database
        await this.setPlatformAdminContext(credentials.email);
        
        return {
          success: true,
          admin: result.user
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Platform admin authentication error:', error);
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

  // Set secure platform admin context
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
      const { data, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (error) throw error;

      const schoolCounts = data.reduce((acc: any, teacher: any) => {
        const school = teacher.school;
        if (school) {
          acc[school] = (acc[school] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(schoolCounts).map(([name, count]) => ({
        name,
        teacher_count: count
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
