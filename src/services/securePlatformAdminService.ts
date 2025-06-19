
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { securityValidationService } from './securityValidationService';

// Create service role client for admin operations
const supabaseServiceRole = createClient(
  'https://bjpgloftnlnzndgliqty.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcGdsb2Z0bmxuem5kZ2xpcXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTExODY5OCwiZXhwIjoyMDY0Njk0Njk4fQ.LyRrLa4Rx9o5NzfgKiWtCMEtUxLGDaPhcNz09nD0i6Y'
);

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

  async getPlatformStats(adminEmail: string): Promise<{
    studentsCount: number;
    teachersCount: number;
    responsesCount: number;
    subscriptionsCount: number;
  }> {
    console.log('📊 Getting platform stats with service role...');
    
    try {
      // Use service role client for direct database access
      const results = await Promise.allSettled([
        supabaseServiceRole.from('students').select('*', { count: 'exact', head: true }),
        supabaseServiceRole.from('teachers').select('*', { count: 'exact', head: true }),
        supabaseServiceRole.from('feedback').select('*', { count: 'exact', head: true }),
        supabaseServiceRole.from('subscriptions').select('*', { count: 'exact', head: true })
      ]);

      const studentsCount = results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0;
      const teachersCount = results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0;
      const responsesCount = results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0;
      const subscriptionsCount = results[3].status === 'fulfilled' ? (results[3].value.count || 0) : 0;

      console.log('📊 Platform stats:', { studentsCount, teachersCount, responsesCount, subscriptionsCount });

      return {
        studentsCount,
        teachersCount,
        responsesCount,
        subscriptionsCount,
      };
    } catch (error) {
      console.error('❌ Failed to get platform stats:', error);
      throw error;
    }
  }

  async getSchoolData(adminEmail: string): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    console.log('🏫 Getting school data with service role...');
    
    try {
      // Get all teachers to find unique schools
      const { data: teachersData, error: teachersError } = await supabaseServiceRole
        .from('teachers')
        .select('school');

      if (teachersError) {
        console.warn('⚠️ Error fetching schools:', teachersError);
        throw teachersError;
      }

      const uniqueSchools = [...new Set(teachersData?.map(t => t.school).filter(Boolean) || [])];
      console.log('🏫 Found schools:', uniqueSchools);
      
      const schoolStats = [];

      for (const school of uniqueSchools) {
        try {
          const [teacherResult, studentResult] = await Promise.allSettled([
            supabaseServiceRole.from('teachers').select('id', { count: 'exact', head: true }).eq('school', school),
            supabaseServiceRole.from('students').select('id', { count: 'exact', head: true }).eq('school', school)
          ]);

          const teacherCount = teacherResult.status === 'fulfilled' ? (teacherResult.value.count || 0) : 0;
          const studentCount = studentResult.status === 'fulfilled' ? (studentResult.value.count || 0) : 0;

          schoolStats.push({
            name: school,
            teacher_count: teacherCount,
            student_count: studentCount
          });
        } catch (error) {
          console.warn(`⚠️ Error getting stats for school ${school}:`, error);
          schoolStats.push({
            name: school,
            teacher_count: 0,
            student_count: 0
          });
        }
      }

      console.log('🏫 School data retrieved:', schoolStats);
      return schoolStats;
    } catch (error) {
      console.error('❌ Failed to get school data:', error);
      return [];
    }
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { valid: false };
      }

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

  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🏫 Creating school with service role:', schoolName);
    
    try {
      const { data, error } = await supabaseServiceRole
        .from('teachers')
        .insert({
          name: `${schoolName} Admin`,
          email: `admin@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
          school: schoolName,
          role: 'admin',
          password_hash: 'placeholder'
        })
        .select()
        .single();

      if (error) {
        console.warn(`⚠️ Error creating school:`, error);
        throw error;
      }

      console.log('✅ School created successfully');
      return { 
        id: data.id, 
        success: true,
        message: 'School created successfully'
      };
    } catch (error) {
      console.error(`❌ Error creating school:`, error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🗑️ Deleting school with service role:', schoolName);
    
    try {
      const { data, error } = await supabaseServiceRole.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (error) {
        throw error;
      }

      console.log('✅ School deleted successfully');
      return { 
        success: true, 
        schoolName, 
        deletedAt: new Date().toISOString(),
        message: 'School deleted successfully',
        details: data
      };
    } catch (error) {
      console.error('❌ School deletion error:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
