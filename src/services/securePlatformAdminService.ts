
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
      console.log('🔧 Setting enhanced admin context for:', adminEmail);
      
      // Use the new enhanced admin context function
      const { error: rpcError } = await supabase.rpc('set_zulfimoon_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (rpcError) {
        console.warn('⚠️ RPC context setting warning:', rpcError);
      } else {
        console.log('✅ Enhanced admin context set via RPC successfully');
      }
      
      // Wait longer for context to propagate - increased to 2000ms for reliability
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      
      // Use direct queries with enhanced retry logic
      const results = await Promise.allSettled([
        this.getCountWithRetry('students'),
        this.getCountWithRetry('teachers'),
        this.getCountWithRetry('feedback'),
        this.getCountWithRetry('subscriptions')
      ]);

      let studentsCount = 0;
      let teachersCount = 0;
      let responsesCount = 0;
      let subscriptionsCount = 0;

      if (results[0].status === 'fulfilled') {
        studentsCount = results[0].value;
      }
      if (results[1].status === 'fulfilled') {
        teachersCount = results[1].value;
      }
      if (results[2].status === 'fulfilled') {
        responsesCount = results[2].value;
      }
      if (results[3].status === 'fulfilled') {
        subscriptionsCount = results[3].value;
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

  private async getCountWithRetry(tableName: string, maxRetries: number = 5): Promise<number> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to get count for ${tableName}`);
        
        // Enhanced admin context setting before each query
        await this.ensureAdminContext(this.KNOWN_ADMIN);
        
        // Direct query with proper type handling
        let count = 0;
        let error = null;
        
        switch (tableName) {
          case 'students':
            const studentsResult = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true });
            count = studentsResult.count || 0;
            error = studentsResult.error;
            break;
          case 'teachers':
            const teachersResult = await supabase
              .from('teachers')
              .select('*', { count: 'exact', head: true });
            count = teachersResult.count || 0;
            error = teachersResult.error;
            break;
          case 'feedback':
            const feedbackResult = await supabase
              .from('feedback')
              .select('*', { count: 'exact', head: true });
            count = feedbackResult.count || 0;
            error = feedbackResult.error;
            break;
          case 'subscriptions':
            const subscriptionsResult = await supabase
              .from('subscriptions')
              .select('*', { count: 'exact', head: true });
            count = subscriptionsResult.count || 0;
            error = subscriptionsResult.error;
            break;
          default:
            return 0;
        }
          
        if (error) {
          console.warn(`⚠️ Error querying ${tableName} (attempt ${attempt}):`, error);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        }
        
        console.log(`✅ Successfully got count for ${tableName}: ${count}`);
        return count;
      } catch (error) {
        console.error(`❌ Error getting count for ${tableName} (attempt ${attempt}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    
    return 0;
  }

  async getSchoolData(adminEmail: string): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    console.log('🏫 Getting school data...');
    
    try {
      await this.ensureAdminContext(adminEmail);

      // Use enhanced approach to get schools
      const schoolStats = await this.getSchoolsWithRetry();
      
      console.log('🏫 School data retrieved:', schoolStats);
      return schoolStats;
    } catch (error) {
      console.error('❌ Failed to get school data:', error);
      return [];
    }
  }

  private async getSchoolsWithRetry(maxRetries: number = 5): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to get school data`);
        
        // Enhanced admin context setting
        await this.ensureAdminContext(this.KNOWN_ADMIN);
        
        // Try to get all schools from teachers table
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('school');

        if (teachersError) {
          console.warn(`⚠️ Error fetching schools (attempt ${attempt}):`, teachersError);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          return [];
        }

        const uniqueSchools = [...new Set(teachersData?.map(t => t.school).filter(Boolean) || [])];
        console.log('🏫 Found schools:', uniqueSchools);
        
        const schoolStats = [];

        for (const school of uniqueSchools) {
          try {
            // Enhanced admin context before each school query
            await this.ensureAdminContext(this.KNOWN_ADMIN);
            
            // Get counts for each school
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
      } catch (error) {
        console.error(`❌ Error in getSchoolsWithRetry (attempt ${attempt}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    
    return [];
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

      // Create a teacher entry for the new school with enhanced retry logic
      const result = await this.createSchoolWithRetry(schoolName);
      
      console.log('✅ School created successfully');
      return result;
    } catch (error) {
      console.error('❌ School creation error:', error);
      throw error;
    }
  }

  private async createSchoolWithRetry(schoolName: string, maxRetries: number = 5): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to create school: ${schoolName}`);
        
        // Enhanced admin context setting before creation
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
          console.warn(`⚠️ Error creating school (attempt ${attempt}):`, error);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          throw error;
        }

        return { 
          id: data.id, 
          success: true,
          message: 'School created successfully'
        };
      } catch (error) {
        console.error(`❌ Error in createSchoolWithRetry (attempt ${attempt}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        } else {
          throw error;
        }
      }
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
