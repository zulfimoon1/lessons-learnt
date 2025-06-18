
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
      
      // Use the enhanced context setting function
      const { error } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });
      
      if (error) {
        console.warn('⚠️ Context setting warning:', error);
      } else {
        console.log('✅ Admin context set successfully');
      }
      
      // Add a short delay to ensure context propagation
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
      // Ensure admin context is set
      await this.ensureAdminContext(adminEmail);
      
      // Direct queries with the new RLS policies
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
      // Ensure admin context is set
      await this.ensureAdminContext(adminEmail);
      
      // Get all teachers and students with the new RLS policies
      const [teachersResult, studentsResult] = await Promise.allSettled([
        supabase.from('teachers').select('school'),
        supabase.from('students').select('school')
      ]);

      let teachersData = [];
      let studentsData = [];

      if (teachersResult.status === 'fulfilled' && teachersResult.value.data) {
        teachersData = teachersResult.value.data.filter(t => 
          t.school && 
          !t.school.toLowerCase().includes('platform') && 
          !t.school.toLowerCase().includes('admin')
        );
      }

      if (studentsResult.status === 'fulfilled' && studentsResult.value.data) {
        studentsData = studentsResult.value.data.filter(s => 
          s.school && 
          !s.school.toLowerCase().includes('platform') && 
          !s.school.toLowerCase().includes('admin')
        );
      }

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

      // Always validate the known admin
      if (emailValidation.sanitizedValue === this.KNOWN_ADMIN) {
        // Ensure admin context for validation
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
      // Ensure admin context
      await this.ensureAdminContext(adminEmail);
      
      // Generate admin email for the school
      const adminSchoolEmail = 'admin@' + schoolName.toLowerCase().replace(/\s+/g, '') + '.edu';
      
      // Insert directly with new RLS policies
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
        } else {
          throw new Error(`Failed to create school: ${error.message}`);
        }
      }
      
      console.log('✅ School created successfully:', data);
      return { id: data.id, success: true };
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
      // Ensure admin context
      await this.ensureAdminContext(adminEmail);
      
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
    } catch (error) {
      console.error('❌ School deletion error:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
