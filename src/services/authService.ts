
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from './securePasswordService';

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('=== TEACHER LOGIN SERVICE DEBUG ===');
    console.log('Login attempt for email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');
    console.log('Password length:', password?.length);

    // Query the database for the teacher
    const { data: teacher, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (queryError) {
      console.error('Database query error:', queryError);
      return { error: 'Login failed. Please check your credentials.' };
    }

    if (!teacher) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid credentials' };
    }

    console.log('Teacher found:', {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      hasPasswordHash: !!teacher.password_hash,
      passwordHashLength: teacher.password_hash?.length
    });

    // Verify password
    console.log('Starting password verification...');
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    console.log('Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password verification failed');
      return { error: 'Invalid credentials' };
    }

    console.log('Login successful for teacher:', teacher.name);
    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
        specialization: teacher.specialization,
        license_number: teacher.license_number,
        is_available: teacher.is_available
      }
    };

  } catch (error) {
    console.error('Teacher login service error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('Teacher signup attempt:', { name, email, school, role });
    
    // This would typically create a new teacher account
    // For now, return an error as signup should be handled by admins
    return { error: 'Teacher signup is not available. Please contact your administrator.' };
    
  } catch (error) {
    console.error('Teacher signup service error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
