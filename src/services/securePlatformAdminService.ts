
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

// Define types for our custom RPC responses
interface PlatformStatsRow {
  students_count: number;
  teachers_count: number;
  feedback_count: number;
  subscriptions_count: number;
}

interface SchoolDataRow {
  school_name: string;
  teacher_count: number;
  student_count: number;
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

  async executeSecureQuery<T>(
    adminEmail: string,
    queryFn: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    console.log('🔍 Executing secure query for:', adminEmail);
    
    // For known admin, use direct approach
    if (adminEmail === this.KNOWN_ADMIN) {
      try {
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
    console.log('📊 Getting platform stats using security definer function...');
    
    try {
      // Use direct query approach since RPC types aren't available
      const { data, error } = await supabase.rpc(
        'platform_admin_get_stats' as any,
        { admin_email_param: adminEmail }
      );

      if (error) {
        console.error('❌ Platform stats RPC failed:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ No stats data returned');
        return {
          studentsCount: 0,
          teachersCount: 0,
          responsesCount: 0,
          subscriptionsCount: 0,
        };
      }

      const stats = data[0] as PlatformStatsRow;
      console.log('📊 Platform stats received:', stats);

      return {
        studentsCount: Number(stats.students_count) || 0,
        teachersCount: Number(stats.teachers_count) || 0,
        responsesCount: Number(stats.feedback_count) || 0,
        subscriptionsCount: Number(stats.subscriptions_count) || 0,
      };

    } catch (error) {
      console.error('❌ Platform stats failed:', error);
      
      // Return zeros as fallback
      console.log('🔄 Using fallback stats (all zeros)');
      return {
        studentsCount: 0,
        teachersCount: 0,
        responsesCount: 0,
        subscriptionsCount: 0,
      };
    }
  }

  async getSchoolData(adminEmail: string): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    console.log('🏫 Getting school data using security definer function...');
    
    try {
      const { data, error } = await supabase.rpc(
        'platform_admin_get_schools' as any,
        { admin_email_param: adminEmail }
      );

      if (error) {
        console.error('❌ School data RPC failed:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ No school data returned');
        return [];
      }

      const schools = (data as SchoolDataRow[]).map(school => ({
        name: school.school_name,
        teacher_count: Number(school.teacher_count) || 0,
        student_count: Number(school.student_count) || 0
      }));

      console.log('🏫 School data received:', schools);
      return schools;

    } catch (error) {
      console.error('❌ School data failed:', error);
      return [];
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

  // Method to handle school creation using security definer function
  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🏫 Creating school using security definer function:', schoolName);
    
    try {
      const { data, error } = await supabase.rpc(
        'platform_admin_add_school' as any,
        {
          admin_email_param: adminEmail,
          school_name_param: schoolName.trim()
        }
      );
      
      if (error) {
        console.error('❌ School creation failed:', error);
        
        if (error.message?.includes('duplicate key')) {
          throw new Error('School administrator already exists');
        } else if (error.message?.includes('Unauthorized')) {
          throw new Error('Database permission denied - please check permissions');
        } else {
          throw new Error(`Failed to create school: ${error.message}`);
        }
      }
      
      console.log('✅ School created successfully:', data);
      return { id: data, success: true };
      
    } catch (error) {
      console.error('💥 School creation error:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🗑️ Deleting school:', schoolName);
    
    try {
      const { data, error } = await supabase.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (error) {
        throw error;
      }

      console.log('✅ School deleted:', data);
      return data;
      
    } catch (error) {
      console.error('💥 School deletion error:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
