
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
    
    // Since platform_admins table doesn't exist, we'll use a fallback approach
    // For now, we'll check against teacher_profiles for admin access
    const { data: admin, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
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
      .from('teacher_profiles')
      .insert([
        {
          name: 'Test Admin',
          email: 'admin@test.com',
          password_hash: 'admin123', // In production, this should be properly hashed
          role: 'admin',
          school: 'Platform Admin'
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
    // Get all students from profiles table with role 'student'
    const { data: allStudents, error: studentError } = await supabase
      .from('profiles')
      .select('school')
      .eq('role', 'student');
      
    if (studentError) {
      console.error('Error fetching students:', studentError);
      return { error: studentError.message };
    }

    console.log('All students data:', allStudents);
    
    // Count students by school manually
    const studentCounts: Record<string, number> = {};
    allStudents?.forEach((student) => {
      if (student.school) {
        studentCounts[student.school] = (studentCounts[student.school] || 0) + 1;
      }
    });

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
    feedbackData?.forEach((feedback) => {
      const school = (feedback.class_schedules as any).school;
      if (school) {
        responseCounts[school] = (responseCounts[school] || 0) + 1;
      }
    });

    // Combine the data
    const statistics: StudentStatistics[] = Object.entries(studentCounts).map(([school, totalStudents]) => {
      const totalResponses = responseCounts[school] || 0;
      const responseRate = totalStudents > 0 ? (totalResponses / totalStudents) * 100 : 0;
      
      return {
        school: school,
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
