
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
}

export interface StudentStatistics {
  school: string;
  total_students: number;
  student_response_rate: number;
}

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    console.log('Attempting login for email:', email);
    
    const { data: admin, error } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Database query result:', { admin, error });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Invalid email or password' };
    }

    if (!admin) {
      console.log('No admin found with this email');
      return { error: 'Invalid email or password' };
    }

    // For now, using simple password comparison
    // In production, you should use proper password hashing
    if (admin.password_hash !== password) {
      console.log('Password mismatch');
      return { error: 'Invalid email or password' };
    }

    console.log('Login successful for admin:', admin.name);

    const adminData: PlatformAdmin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return { admin: adminData };
  } catch (error) {
    console.error('Login service error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

// Helper function to create a test admin account
export const createTestAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_admins')
      .insert([
        {
          name: 'Test Admin',
          email: 'admin@test.com',
          password_hash: 'admin123' // In production, this should be properly hashed
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating test admin:', error);
      return { error: error.message };
    }

    console.log('Test admin created successfully:', data);
    return { success: true, admin: data };
  } catch (error) {
    console.error('Error in createTestAdmin:', error);
    return { error: 'Failed to create test admin' };
  }
};

// Function to get student statistics by school
export const getStudentStatistics = async () => {
  try {
    // Get count of students per school
    const { data: schoolData, error: schoolError } = await supabase
      .from('students')
      .select('school')
      .count()
      .group('school');
      
    if (schoolError) {
      console.error('Error fetching student statistics:', schoolError);
      return { error: schoolError.message };
    }

    console.log('Student count data:', schoolData);
    
    // Transform the data to match our expected format
    const studentCountBySchool = schoolData.map(item => ({
      school: item.school,
      count: parseInt(item.count)
    }));

    // Get count of feedback responses per school
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select(`
        class_schedule_id,
        class_schedules!inner (
          school
        )
      `);

    if (feedbackError) {
      console.error('Error fetching feedback data:', feedbackError);
      return { error: feedbackError.message };
    }

    // Process the data to get response counts by school
    const responseCounts: Record<string, number> = {};
    feedbackData.forEach((feedback) => {
      const school = (feedback.class_schedules as any).school;
      responseCounts[school] = (responseCounts[school] || 0) + 1;
    });

    // Combine the data
    const statistics: StudentStatistics[] = studentCountBySchool.map((item) => {
      const totalStudents = item.count;
      const totalResponses = responseCounts[item.school] || 0;
      const responseRate = totalStudents > 0 ? (totalResponses / totalStudents) * 100 : 0;
      
      return {
        school: item.school,
        total_students: totalStudents,
        student_response_rate: parseFloat(responseRate.toFixed(1))
      };
    });

    return { statistics };
  } catch (error) {
    console.error('Error in getStudentStatistics:', error);
    return { error: 'Failed to fetch student statistics' };
  }
};
