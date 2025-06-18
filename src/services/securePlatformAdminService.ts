
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

  async setAdminContext(adminEmail: string): Promise<void> {
    try {
      console.log('🔧 Setting admin context for:', adminEmail);
      
      // Use the updated RPC function that handles platform admin context
      const { error } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (error) {
        console.warn('⚠️ Failed to set admin context via RPC:', error);
      } else {
        console.log('✅ Admin context set successfully via RPC');
      }
    } catch (error) {
      console.warn('⚠️ Failed to set admin context:', error);
      // Continue anyway - the RLS policies should handle direct email check
    }
  }

  async executeSecureQuery<T>(
    adminEmail: string,
    queryFn: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T> {
    console.log('🔍 Executing secure query for:', adminEmail);
    
    // Always set admin context first and wait for it
    await this.setAdminContext(adminEmail);
    
    // Add a small delay to ensure context is properly set
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  async getPlatformStats(adminEmail: string): Promise<{
    studentsCount: number;
    teachersCount: number;
    responsesCount: number;
    subscriptionsCount: number;
  }> {
    console.log('📊 Getting platform stats...');
    
    return this.executeSecureQuery(
      adminEmail,
      async () => {
        // Ensure admin context is set before each query
        await this.setAdminContext(adminEmail);
        
        // Use Promise.allSettled to prevent one failure from breaking everything
        const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.allSettled([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('teachers').select('id', { count: 'exact', head: true }),
          supabase.from('feedback').select('id', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true })
        ]);

        const studentsCount = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
        const teachersCount = teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0;
        const responsesCount = feedbackResult.status === 'fulfilled' ? (feedbackResult.value.count || 0) : 0;
        const subscriptionsCount = subscriptionsResult.status === 'fulfilled' ? (subscriptionsResult.value.count || 0) : 0;

        console.log('📊 Platform stats:', { studentsCount, teachersCount, responsesCount, subscriptionsCount });

        return {
          studentsCount,
          teachersCount,
          responsesCount,
          subscriptionsCount,
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

  async getSchoolData(adminEmail: string): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    console.log('🏫 Getting school data...');
    
    return this.executeSecureQuery(
      adminEmail,
      async () => {
        // Ensure admin context is set
        await this.setAdminContext(adminEmail);
        
        // Get data with error handling
        const [teachersResult, studentsResult] = await Promise.allSettled([
          supabase
            .from('teachers')
            .select('school')
            .not('school', 'ilike', '%platform%')
            .not('school', 'ilike', '%admin%'),
          supabase
            .from('students')
            .select('school')
            .not('school', 'ilike', '%platform%')
            .not('school', 'ilike', '%admin%')
        ]);

        const teachersData = teachersResult.status === 'fulfilled' ? teachersResult.value.data || [] : [];
        const studentsData = studentsResult.status === 'fulfilled' ? studentsResult.value.data || [] : [];

        // Get unique schools
        const allSchools = new Set([
          ...teachersData.map(t => t.school),
          ...studentsData.map(s => s.school)
        ]);

        // Count teachers and students per school
        const schoolData = Array.from(allSchools).map(school => {
          const teacherCount = teachersData.filter(t => t.school === school).length;
          const studentCount = studentsData.filter(s => s.school === school).length;
          
          return {
            name: school,
            teacher_count: teacherCount,
            student_count: studentCount
          };
        });

        console.log('🏫 School data:', schoolData);
        return schoolData;
      },
      []
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
        // Set admin context for validation
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

  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🏫 Creating school:', schoolName);
    
    return this.executeSecureQuery(
      adminEmail,
      async () => {
        // Ensure admin context is set before operation
        await this.setAdminContext(adminEmail);
        
        // Generate admin email for the school
        const adminSchoolEmail = 'admin@' + schoolName.toLowerCase().replace(/\s+/g, '') + '.edu';
        
        // Insert admin teacher for the school directly
        const { data, error } = await supabase
          .from('teachers')
          .insert({
            name: schoolName + ' Administrator',
            email: adminSchoolEmail,
            school: schoolName,
            role: 'admin',
            password_hash: '$2b$12$LQv3c1yX1/Y6GdE9e5Q8M.QmK5J5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qu'
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ School creation failed:', error);
          
          if (error.message?.includes('duplicate key')) {
            throw new Error('School administrator already exists');
          } else if (error.message?.includes('permission denied')) {
            throw new Error('Database permission denied - please check permissions');
          } else {
            throw new Error(`Failed to create school: ${error.message}`);
          }
        }
        
        console.log('✅ School created successfully:', data);
        return { id: data.id, success: true };
      }
    );
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🗑️ Deleting school:', schoolName);
    
    return this.executeSecureQuery(
      adminEmail,
      async () => {
        // Ensure admin context is set before operation
        await this.setAdminContext(adminEmail);
        
        // Use the platform admin delete function
        const { data, error } = await supabase
          .rpc('platform_admin_delete_school', {
            school_name_param: schoolName,
            admin_email_param: adminEmail
          });

        if (error) {
          console.error('❌ School deletion failed:', error);
          throw new Error(`Failed to delete school: ${error.message}`);
        }

        console.log('✅ School deleted:', { schoolName, data });
        return { success: true, schoolName, deletedAt: new Date().toISOString(), data };
      }
    );
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
