
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const enhancedTeacherLogin = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data: teachers } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email);

    if (!teachers || teachers.length === 0) {
      return { success: false, error: 'Teacher not found' };
    }

    const teacher = teachers[0];
    const isValidPassword = await bcrypt.compare(password, teacher.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    return { 
      success: true, 
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      }
    };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

export const enhancedStudentLogin = async (fullName: string, password: string): Promise<AuthResult> => {
  try {
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .ilike('full_name', fullName);

    if (!students || students.length === 0) {
      return { success: false, error: 'Student not found' };
    }

    const student = students[0];
    const isValidPassword = await bcrypt.compare(password, student.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    return { 
      success: true, 
      user: {
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
      }
    };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};
