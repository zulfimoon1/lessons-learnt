
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

export const teacherLoginService = async (
  email: string, 
  password: string,
  name?: string,
  school?: string,
  role?: 'teacher' | 'admin'
) => {
  try {
    // First check if a teacher with this email exists
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email);

    if (queryError) {
      console.error('Error querying teachers:', queryError);
      return { error: 'Login failed. Please try again.' };
    }

    // If no teacher exists with this email, create one (auto-signup)
    if (!teachers || teachers.length === 0) {
      // Ensure we have all required data for signup
      if (!name || !school) {
        return { error: 'Missing required fields for signup.' };
      }

      const { data: newTeacher, error: createError } = await supabase
        .from('teachers')
        .insert({
          email: email,
          password_hash: password, // In production, this should be properly hashed
          name: name,
          school: school,
          role: role || 'teacher'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating teacher:', createError);
        return { error: 'Failed to create account. Please try again.' };
      }

      const teacherData: Teacher = {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        school: newTeacher.school,
        role: ((newTeacher as any).role as 'teacher' | 'admin') || 'teacher'
      };

      return { teacher: teacherData };
    }

    // Otherwise, check password and login
    const teacher = teachers[0];
    if (teacher.password_hash !== password) {
      return { error: 'Invalid email or password' };
    }

    const teacherData: Teacher = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      school: (teacher as any).school || 'Default School',
      role: ((teacher as any).role as 'teacher' | 'admin') || 'teacher'
    };

    return { teacher: teacherData };
  } catch (error) {
    console.error('Teacher login service error:', error);
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
