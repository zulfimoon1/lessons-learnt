import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from './securePasswordService';
import { ensureDemoAccountHash, isDemoAccount } from './demoAccountManager';

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('=== TEACHER LOGIN SERVICE DEBUG ===');
    console.log('Login attempt for email:', email);

    // For demo accounts, ensure the hash is correct before attempting login
    if (isDemoAccount(email)) {
      console.log('Demo account detected, ensuring hash...');
      const hashResult = await ensureDemoAccountHash(email, undefined, password);
      
      if (!hashResult.success && hashResult.isDemo) {
        console.error('Failed to ensure demo account hash');
        return { error: 'Demo account setup failed. Please try again.' };
      }
    }

    // Query the database for the teacher
    const { data: teacher, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (queryError || !teacher) {
      console.error('Database query error:', queryError);
      return { error: 'Invalid credentials' };
    }

    console.log('Teacher found:', {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role
    });

    // Verify password
    if (!password || !teacher.password_hash) {
      console.error('Missing password or password hash');
      return { error: 'Invalid credentials' };
    }

    console.log('Starting password verification...');
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    console.log('Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password verification failed for email:', email);
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

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('=== STUDENT LOGIN SERVICE DEBUG ===');
    console.log('Login attempt for student:', fullName);

    // For demo accounts, ensure the hash is correct before attempting login
    if (isDemoAccount(undefined, fullName)) {
      console.log('Demo student detected, ensuring hash...');
      const hashResult = await ensureDemoAccountHash(undefined, fullName, password);
      
      if (!hashResult.success && hashResult.isDemo) {
        console.error('Failed to ensure demo student hash');
        return { error: 'Demo account setup failed. Please try again.' };
      }
    }

    // Query the database for the student
    const { data: student, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .single();

    if (queryError || !student) {
      console.error('Database query error:', queryError);
      return { error: 'Invalid credentials' };
    }

    console.log('Student found:', {
      id: student.id,
      full_name: student.full_name,
      school: student.school,
      grade: student.grade
    });

    // Verify password
    if (!password || !student.password_hash) {
      console.error('Missing password or password hash');
      return { error: 'Invalid credentials' };
    }

    console.log('Starting password verification for student...');
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    console.log('Password verification result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password verification failed for student:', fullName);
      return { error: 'Invalid credentials' };
    }

    console.log('Login successful for student:', student.full_name);
    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
      }
    };

  } catch (error) {
    console.error('Student login service error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Student signup attempt:', { fullName, school, grade });
    
    // This would typically create a new student account
    // For now, return an error as signup should be handled by teachers/admins
    return { error: 'Student signup is not available. Please contact your teacher.' };
    
  } catch (error) {
    console.error('Student signup service error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const getCurrentUser = () => {
  try {
    // Check for teacher
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      return JSON.parse(teacherData);
    }

    // Check for student
    const studentData = localStorage.getItem('student');
    if (studentData) {
      return JSON.parse(studentData);
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
