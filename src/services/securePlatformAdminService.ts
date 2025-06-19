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
      console.log('🔧 Setting enhanced platform admin context for:', adminEmail);
      
      const { error: rpcError } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (rpcError) {
        console.warn('⚠️ RPC context setting warning:', rpcError);
      } else {
        console.log('✅ Platform admin context set via RPC successfully');
      }
      
      // Minimal wait for context to be applied
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
        this.getCountWithTimeout('students'),
        this.getCountWithTimeout('teachers'),
        this.getCountWithTimeout('feedback'),
        this.getCountWithTimeout('subscriptions')
      ]);

      const studentsCount = results[0].status === 'fulfilled' ? results[0].value : 0;
      const teachersCount = results[1].status === 'fulfilled' ? results[1].value : 0;
      const responsesCount = results[2].status === 'fulfilled' ? results[2].value : 0;
      const subscriptionsCount = results[3].status === 'fulfilled' ? results[3].value : 0;

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

  private async getCountWithTimeout(tableName: string): Promise<number> {
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout getting count for ${tableName}`)), 5000)
    );

    try {
      console.log(`📊 Getting count for ${tableName}`);
      
      await this.ensureAdminContext(this.KNOWN_ADMIN);
      
      let count = 0;
      let error = null;
      
      const queryPromise = (async () => {
        switch (tableName) {
          case 'students': {
            const result = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true });
            count = result.count || 0;
            error = result.error;
            break;
          }
          case 'teachers': {
            const result = await supabase
              .from('teachers')
              .select('*', { count: 'exact', head: true });
            count = result.count || 0;
            error = result.error;
            break;
          }
          case 'feedback': {
            const result = await supabase
              .from('feedback')
              .select('*', { count: 'exact', head: true });
            count = result.count || 0;
            error = result.error;
            break;
          }
          case 'subscriptions': {
            const result = await supabase
              .from('subscriptions')
              .select('*', { count: 'exact', head: true });
            count = result.count || 0;
            error = result.error;
            break;
          }
          default:
            return 0;
        }
        
        if (error) {
          console.warn(`⚠️ Error querying ${tableName}:`, error);
          throw error;
        }
        
        console.log(`✅ Successfully got count for ${tableName}: ${count}`);
        return count;
      })();

      return await Promise.race([queryPromise, timeout]);
    } catch (error) {
      console.error(`❌ Error getting count for ${tableName}:`, error);
      throw error;
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

      const schoolStats = await this.getSchoolsWithTimeout();
      
      console.log('🏫 School data retrieved:', schoolStats);
      return schoolStats;
    } catch (error) {
      console.error('❌ Failed to get school data:', error);
      throw error;
    }
  }

  private async getSchoolsWithTimeout(): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout getting school data')), 8000)
    );

    const schoolQuery = async () => {
      console.log('🔄 Getting school data');
      
      await this.ensureAdminContext(this.KNOWN_ADMIN);
      
      const { data: teachersData, error: teachersError } = await supabase
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
        } catch (error) {
          console.warn(`⚠️ Error getting stats for school ${school}:`, error);
          schoolStats.push({
            name: school,
            teacher_count: 0,
            student_count: 0
          });
        }
      }

      return schoolStats;
    };

    try {
      return await Promise.race([schoolQuery(), timeout]);
    } catch (error) {
      console.error(`❌ Error in getSchoolsWithTimeout:`, error);
      throw error;
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

      const result = await this.createSchoolWithRetry(schoolName);
      
      console.log('✅ School created successfully');
      return result;
    } catch (error) {
      console.error('❌ School creation error:', error);
      throw error;
    }
  }

  private async createSchoolWithRetry(schoolName: string): Promise<any> {
    try {
      console.log(`🔄 Creating school: ${schoolName}`);
      
      await this.ensureAdminContext(this.KNOWN_ADMIN);
      
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
        console.warn(`⚠️ Error creating school:`, error);
        throw error;
      }

      return { 
        id: data.id, 
        success: true,
        message: 'School created successfully'
      };
    } catch (error) {
      console.error(`❌ Error in createSchoolWithRetry:`, error);
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
