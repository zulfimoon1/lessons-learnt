
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

export const teacherLoginService = async (email: string, password: string) => {
  try {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !teachers) {
      return { error: 'Invalid email or password' };
    }

    if (teachers.password_hash !== password) {
      return { error: 'Invalid email or password' };
    }

    const teacherData: Teacher = {
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
      school: (teachers as any).school || 'Default School',
      role: ((teachers as any).role as 'teacher' | 'admin') || 'teacher'
    };

    return { teacher: teacherData };
  } catch (error) {
    return { error: 'Login failed. Please try again.' };
  }
};

export const studentLoginService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName)
      .eq('school', school)
      .eq('grade', grade)
      .single();

    if (error || !students) {
      return { error: 'Student not found. Please check your details or sign up.' };
    }

    if (students.password_hash !== password) {
      return { error: 'Invalid password' };
    }

    const studentData: Student = {
      id: students.id,
      full_name: students.full_name,
      school: students.school,
      grade: students.grade
    };

    return { student: studentData };
  } catch (error) {
    return { error: 'Login failed. Please try again.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        full_name: fullName,
        school: school,
        grade: grade,
        password_hash: password
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'A student with this name already exists in this school and grade.' };
      }
      return { error: 'Signup failed. Please try again.' };
    }

    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    return { student: studentData };
  } catch (error) {
    return { error: 'Signup failed. Please try again.' };
  }
};
