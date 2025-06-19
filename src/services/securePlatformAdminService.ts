
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
        
        // Set admin context immediately after authentication
        await this.ensureAdminContext(adminEmail);
        
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

  async ensureAdminContext(adminEmail: string): Promise<void> {
    try {
      console.log('🔧 Setting admin context for:', adminEmail);
      
      const { error } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (error) {
        console.warn('⚠️ Context setting warning:', error);
      } else {
        console.log('✅ Admin context set successfully');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn('⚠️ Failed to set admin context:', error);
    }
  }

  async getPlatformStats(adminEmail: string): Promise<{
    studentsCount: number;
    teachersCount: number;
    responsesCount: number;
    subscriptionsCount: number;
  }> {
    console.log('📊 Getting platform stats...');
    
    try {
      await this.ensureAdminContext(adminEmail);
      
      const results = await Promise.allSettled([
        supabase.rpc('get_platform_stats', { stat_type: 'students' }),
        supabase.rpc('get_platform_stats', { stat_type: 'teachers' }),
        supabase.rpc('get_platform_stats', { stat_type: 'feedback' }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true })
      ]);

      let studentsCount = 0;
      let teachersCount = 0;
      let responsesCount = 0;
      let subscriptionsCount = 0;

      if (results[0].status === 'fulfilled' && results[0].value.data?.[0]?.count) {
        studentsCount = Number(results[0].value.data[0].count);
      }
      if (results[1].status === 'fulfilled' && results[1].value.data?.[0]?.count) {
        teachersCount = Number(results[1].value.data[0].count);
      }
      if (results[2].status === 'fulfilled' && results[2].value.data?.[0]?.count) {
        responsesCount = Number(results[2].value.data[0].count);
      }
      if (results[3].status === 'fulfilled') {
        subscriptionsCount = results[3].value.count || 0;
      }

      console.log('📊 Platform stats:', { studentsCount, teachersCount, responsesCount, subscriptionsCount });

      return {
        studentsCount,
        teachersCount,
        responsesCount,
        subscriptionsCount,
      };
    } catch (error) {
      console.error('❌ Failed to get platform stats:', error);
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
    console.log('🏫 Getting school data...');
    
    try {
      await this.ensureAdminContext(adminEmail);

      // Get distinct schools and their counts
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (schoolsError) {
        console.error('❌ Error fetching schools:', schoolsError);
        return [];
      }

      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      const schoolStats = [];

      for (const school of uniqueSchools) {
        const [teacherResult, studentResult] = await Promise.allSettled([
          supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school', school),
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('school', school)
        ]);

        const teacherCount = teacherResult.status === 'fulfilled' ? (teacherResult.value.count || 0) : 0;
        const studentCount = studentResult.status === 'fulfilled' ? (studentResult.value.count || 0) : 0;

        schoolStats.push({
          name: school,
          teacher_count: teacherCount,
          student_count: studentCount
        });
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
        await this.ensureAdminContext(emailValidation.sanitizedValue);
        
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

    console.log('🏫 Creating school:', schoolName);
    
    try {
      await this.ensureAdminContext(adminEmail);

      // Create a teacher entry for the new school to establish it in the system
      const { data, error } = await supabase
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
        throw error;
      }

      console.log('✅ School created successfully');
      return { 
        id: data.id, 
        success: true,
        message: 'School created successfully'
      };
    } catch (error) {
      console.error('❌ School creation error:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🗑️ Deleting school:', schoolName);
    
    try {
      await this.ensureAdminContext(adminEmail);

      // Use the platform admin delete function
      const { data, error } = await supabase.rpc('platform_admin_delete_school', {
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
