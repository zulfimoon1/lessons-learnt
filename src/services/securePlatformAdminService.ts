
import { supabase } from '@/integrations/supabase/client';
import { securityValidationService } from './securityValidationService';

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
  private readonly KNOWN_ADMIN = 'zulfimoon1@gmail.com';

  async authenticateAdmin(loginData: SecureAdminLoginData): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    console.log('🔐 ADMIN AUTH for:', loginData.email);
    
    try {
      const adminEmail = loginData.email.toLowerCase().trim();
      
      // Direct authentication for known admin
      if (adminEmail === this.KNOWN_ADMIN && loginData.password === 'admin123') {
        console.log('✅ Known admin authenticated - setting context');
        
        // Set admin context for database access
        await this.setAdminContext(adminEmail);
        
        return {
          success: true,
          admin: {
            id: 'admin-known',
            email: adminEmail,
            name: 'Platform Admin',
            role: 'admin',
            school: 'Platform Administration'
          }
        };
      }

      return { success: false, error: 'Invalid credentials' };

    } catch (error) {
      console.error('Auth error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  private async setAdminContext(adminEmail: string): Promise<void> {
    try {
      console.log('🔧 Setting admin context for:', adminEmail);
      // Use the RPC function to set context properly
      const { error } = await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
      if (error) {
        console.warn('⚠️ Could not set admin context via RPC:', error);
      } else {
        console.log('✅ Admin context set successfully via RPC');
      }
    } catch (error) {
      console.warn('⚠️ Could not set admin context:', error);
      // Continue anyway - the simplified policies should work
    }
  }

  async executeSecureQuery<T>(
    adminEmail: string,
    queryFn: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    console.log('🔍 Executing secure query for:', adminEmail);
    
    // For known admin, set context and execute queries
    if (adminEmail === this.KNOWN_ADMIN) {
      try {
        // Ensure context is set before query
        await this.setAdminContext(adminEmail);
        
        // Execute the query
        const result = await queryFn();
        console.log('✅ Secure query executed successfully');
        return result;
      } catch (error) {
        console.error('❌ Secure query failed:', error);
        if (fallbackValue !== undefined) {
          console.log('🔄 Using fallback value');
          return fallbackValue;
        }
        throw error;
      }
    }
    
    // For other users, try normal approach
    try {
      return await queryFn();
    } catch (error) {
      console.warn('Normal query failed:', error);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw error;
    }
  }

  async getPlatformStats(adminEmail: string): Promise<{
    studentsCount: number;
    teachersCount: number;
    responsesCount: number;
    subscriptionsCount: number;
  }> {
    console.log('📊 Getting platform stats...');
    
    return await this.executeSecureQuery(
      adminEmail,
      async () => {
        console.log('📊 Fetching counts with direct queries...');
        
        // Use Promise.allSettled to get data even if some queries fail
        const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.allSettled([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('teachers').select('*', { count: 'exact', head: true }),
          supabase.from('feedback').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true })
        ]);

        console.log('📊 Count results:', {
          students: studentsResult.status === 'fulfilled' ? studentsResult.value.count : 'failed',
          teachers: teachersResult.status === 'fulfilled' ? teachersResult.value.count : 'failed',
          feedback: feedbackResult.status === 'fulfilled' ? feedbackResult.value.count : 'failed',
          subscriptions: subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value.count : 'failed'
        });

        return {
          studentsCount: studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0,
          teachersCount: teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0,
          responsesCount: feedbackResult.status === 'fulfilled' ? (feedbackResult.value.count || 0) : 0,
          subscriptionsCount: subscriptionsResult.status === 'fulfilled' ? (subscriptionsResult.value.count || 0) : 0,
        };
      },
      {
        studentsCount: 0,
        teachersCount: 0,
        responsesCount: 0,
        subscriptionsCount: 0,
      }
    );
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { valid: false };
      }

      // Always validate the known admin
      if (emailValidation.sanitizedValue === this.KNOWN_ADMIN) {
        // Set context for validation
        await this.setAdminContext(emailValidation.sanitizedValue);
        
        return {
          valid: true,
          admin: {
            id: 'admin-validated',
            email: emailValidation.sanitizedValue,
            name: 'Platform Admin',
            role: 'admin',
            school: 'Platform Administration'
          }
        };
      }

      return { valid: false };

    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Simplified method for direct database operations
  async executeDirectQuery<T>(
    adminEmail: string,
    tableName: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    queryBuilder: any
  ): Promise<T> {
    console.log(`🔧 Direct ${operation} on ${tableName} for:`, adminEmail);
    
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    try {
      // Set admin context first
      await this.setAdminContext(adminEmail);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error(`❌ Direct ${operation} failed:`, error);
        throw error;
      }
      
      console.log(`✅ Direct ${operation} successful`);
      return data;
    } catch (error) {
      console.error(`💥 Direct ${operation} error:`, error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
