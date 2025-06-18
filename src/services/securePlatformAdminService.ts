
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
        console.log('✅ Known admin authenticated');
        
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
      
      // Use RPC to set the context - this bypasses RLS
      const { error } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (error) {
        console.warn('⚠️ RPC context setting failed:', error);
      } else {
        console.log('✅ Admin context set via RPC');
      }
      
      // Also try direct setting as fallback
      const { error: directError } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', adminEmail)
        .eq('role', 'admin')
        .single();
        
      if (!directError) {
        console.log('✅ Direct admin verification successful');
      }
      
    } catch (error) {
      console.warn('⚠️ Context setting error:', error);
    }
  }

  async executeSecureQuery<T>(
    adminEmail: string,
    queryFn: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    console.log('🔍 Executing secure query for:', adminEmail);
    
    // For known admin, bypass RLS entirely using direct queries
    if (adminEmail === this.KNOWN_ADMIN) {
      try {
        await this.setAdminContext(adminEmail);
        const result = await queryFn();
        console.log('✅ Secure query executed successfully');
        return result;
      } catch (error) {
        console.error('❌ Secure query failed:', error);
        
        // If fallback available, use it
        if (fallbackValue !== undefined) {
          console.log('🔄 Using fallback value');
          return fallbackValue;
        }
        
        // For critical failures, throw but with better error message
        if (error instanceof Error && error.message.includes('permission denied')) {
          throw new Error('Database access denied - RLS policy issue');
        }
        
        throw error;
      }
    }
    
    // For other users, normal approach
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
    
    // Use security definer functions to bypass RLS completely
    try {
      await this.setAdminContext(adminEmail);
      
      console.log('📊 Fetching counts using security definer functions...');
      
      // Try to use the security definer functions first
      const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.allSettled([
        supabase.rpc('get_platform_stats', { stat_type: 'students' }),
        supabase.rpc('get_platform_stats', { stat_type: 'teachers' }),
        supabase.rpc('get_platform_stats', { stat_type: 'feedback' }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      ]);

      console.log('📊 RPC results:', {
        students: studentsResult.status === 'fulfilled' ? studentsResult.value : 'failed',
        teachers: teachersResult.status === 'fulfilled' ? teachersResult.value : 'failed',
        feedback: feedbackResult.status === 'fulfilled' ? feedbackResult.value : 'failed',
        subscriptions: subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value : 'failed'
      });

      return {
        studentsCount: studentsResult.status === 'fulfilled' && studentsResult.value.data ? studentsResult.value.data[0]?.count || 0 : 0,
        teachersCount: teachersResult.status === 'fulfilled' && teachersResult.value.data ? teachersResult.value.data[0]?.count || 0 : 0,
        responsesCount: feedbackResult.status === 'fulfilled' && feedbackResult.value.data ? feedbackResult.value.data[0]?.count || 0 : 0,
        subscriptionsCount: subscriptionsResult.status === 'fulfilled' ? (subscriptionsResult.value.count || 0) : 0,
      };

    } catch (error) {
      console.error('❌ Platform stats failed:', error);
      
      // Return zeros as fallback instead of throwing
      console.log('🔄 Using fallback stats (all zeros)');
      return {
        studentsCount: 0,
        teachersCount: 0,
        responsesCount: 0,
        subscriptionsCount: 0,
      };
    }
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { valid: false };
      }

      // Always validate the known admin
      if (emailValidation.sanitizedValue === this.KNOWN_ADMIN) {
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

  // Bypass RLS entirely for admin operations
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
      // Set context first
      await this.setAdminContext(adminEmail);
      
      // Execute query with detailed logging
      console.log(`🔧 Executing ${operation} query...`);
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error(`❌ Direct ${operation} failed:`, error);
        
        // If it's a permission error, try using security definer function
        if (error.message?.includes('permission denied') && operation === 'insert' && tableName === 'teachers') {
          console.log('🔄 Trying security definer approach for teacher insert...');
          
          // For teacher insertion, we'll use a different approach
          throw new Error(`Permission denied for ${operation} on ${tableName}. RLS policy blocking access.`);
        }
        
        throw error;
      }
      
      console.log(`✅ Direct ${operation} successful`);
      return data;
    } catch (error) {
      console.error(`💥 Direct ${operation} error:`, error);
      throw error;
    }
  }

  // New method to handle school creation with better error handling
  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🏫 Creating school:', schoolName);
    
    try {
      await this.setAdminContext(adminEmail);
      
      const adminTeacherEmail = `admin@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`;
      
      // Try direct insert first
      const teacherData = {
        name: `${schoolName} Administrator`,
        email: adminTeacherEmail,
        school: schoolName.trim(),
        role: 'admin',
        password_hash: '$2b$12$LQv3c1yX1/Y6GdE9e5Q8M.QmK5J5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qu'
      };
      
      console.log('🔧 Inserting teacher data:', { ...teacherData, password_hash: '[REDACTED]' });
      
      const { data, error } = await supabase
        .from('teachers')
        .insert(teacherData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ School creation failed:', error);
        
        if (error.code === '23505') {
          throw new Error('School administrator already exists');
        } else if (error.message?.includes('permission denied')) {
          throw new Error('Database permission denied - please check RLS policies');
        } else {
          throw new Error(`Failed to create school: ${error.message}`);
        }
      }
      
      console.log('✅ School created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('💥 School creation error:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
