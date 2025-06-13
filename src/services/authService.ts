
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from './securePasswordService';
import { validateDemoAccountHash } from './demoAccountManager';

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

    // Verify password - ensure we have both password and hash
    if (!password || !teacher.password_hash) {
      console.error('Missing password or password hash');
      return { error: 'Invalid credentials' };
    }

    console.log('Starting password verification...');
    console.log('Password to verify:', password);
    console.log('Hash to verify against:', teacher.password_hash);
    
    // First try normal verification
    let isPasswordValid = await verifyPassword(password, teacher.password_hash);
    console.log('Initial password verification result:', isPasswordValid);

    // If verification fails and this is a demo account, try regenerating the hash
    if (!isPasswordValid && email.includes('demo') && password === 'demo123') {
      console.log('Demo account verification failed, attempting hash regeneration...');
      const demoResult = await validateDemoAccountHash(email, password);
      
      if (demoResult.regenerated) {
        console.log('Hash regenerated, trying verification again...');
        // Get the updated teacher record
        const { data: updatedTeacher } = await supabase
          .from('teachers')
          .select('password_hash')
          .eq('email', email)
          .single();
        
        if (updatedTeacher?.password_hash) {
          isPasswordValid = await verifyPassword(password, updatedTeacher.password_hash);
          console.log('Verification result after hash regeneration:', isPasswordValid);
        }
      }
    }

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
    console.log('Password provided:', password ? 'Yes' : 'No');

    // Query the database for the student
    const { data: student, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .single();

    if (queryError) {
      console.error('Database query error:', queryError);
      return { error: 'Login failed. Please check your credentials.' };
    }

    if (!student) {
      console.log('No student found with name:', fullName);
      return { error: 'Invalid credentials' };
    }

    console.log('Student found:', {
      id: student.id,
      full_name: student.full_name,
      school: student.school,
      grade: student.grade,
      hasPasswordHash: !!student.password_hash
    });

    // Verify password - ensure we have both password and hash
    if (!password || !student.password_hash) {
      console.error('Missing password or password hash');
      return { error: 'Invalid credentials' };
    }

    console.log('Starting password verification for student...');
    let isPasswordValid = await verifyPassword(password, student.password_hash);
    console.log('Initial password verification result:', isPasswordValid);

    // If verification fails and this is a demo student, try regenerating the hash
    if (!isPasswordValid && fullName.includes('Demo') && password === 'demo123') {
      console.log('Demo student verification failed, attempting hash regeneration...');
      const { hashPassword } = await import('./securePasswordService');
      const newHash = await hashPassword(password);
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ password_hash: newHash })
        .eq('full_name', fullName);
      
      if (!updateError) {
        console.log('Hash regenerated for demo student, trying verification again...');
        isPasswordValid = await verifyPassword(password, newHash);
        console.log('Verification result after hash regeneration:', isPasswordValid);
      }
    }

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
