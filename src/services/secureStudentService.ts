
import { supabase } from '@/integrations/supabase/client';
import { StudentStatistics } from '@/types/adminTypes';

class SecureStudentService {
  private async validateAdminAccess(adminEmail: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('role')
        .eq('email', adminEmail)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        console.error('Admin validation failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating admin access:', error);
      return false;
    }
  }

  async getStudentStatistics(adminEmail: string): Promise<StudentStatistics> {
    const isValidAdmin = await this.validateAdminAccess(adminEmail);
    
    if (!isValidAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Set platform admin context for secure database access
      await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });

      const { data: totalStudentsData } = await supabase.rpc('get_platform_stats', { stat_type: 'students' });
      const totalStudents = totalStudentsData?.[0]?.count || 0;

      // Calculate active students (those who have submitted feedback in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeStudentsData } = await supabase
        .from('feedback')
        .select('student_id', { count: 'exact' })
        .gte('submitted_at', thirtyDaysAgo.toISOString())
        .not('student_id', 'is', null);

      const activeStudents = activeStudentsData?.length || 0;

      // Calculate students who joined this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: newStudentsData } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .gte('created_at', oneWeekAgo.toISOString());

      const studentsThisWeek = newStudentsData?.length || 0;

      // Get top performing schools by student count
      const { data: schoolsData } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);

      const schoolCounts = schoolsData?.reduce((acc: { [key: string]: number }, student) => {
        acc[student.school] = (acc[student.school] || 0) + 1;
        return acc;
      }, {}) || {};

      const topPerformingSchools = Object.entries(schoolCounts)
        .map(([school, studentCount]) => ({ school, studentCount: studentCount as number }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);

      return {
        totalStudents: Number(totalStudents),
        activeStudents,
        studentsThisWeek,
        averageGrade: 'Mixed', // Placeholder since grades vary by school
        topPerformingSchools
      };

    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw new Error('Failed to fetch student statistics');
    }
  }
}

export const secureStudentService = new SecureStudentService();
