
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

export const secureTeacherSignup = async (
  email: string,
  password: string,
  name: string,
  school: string,
  role: 'teacher' | 'admin' | 'doctor' = 'teacher',
  specialization?: string,
  license_number?: string
) => {
  try {
    console.log('secureTeacherSignup: Starting signup for:', email);

    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          user_type: 'teacher',
          name,
          school,
          role,
          specialization
        }
      }
    });

    if (authError) {
      console.error('secureTeacherSignup: Auth error:', authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create user account' };
    }

    // Create teacher profile
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        id: authData.user.id,
        email,
        name,
        school,
        role,
        specialization,
        license_number
      })
      .select()
      .single();

    if (teacherError) {
      console.error('secureTeacherSignup: Teacher profile error:', teacherError);
      return { error: 'Failed to create teacher profile' };
    }

    const teacher: Teacher = {
      id: teacherData.id,
      name: teacherData.name,
      email: teacherData.email,
      school: teacherData.school,
      role: teacherData.role as 'teacher' | 'admin' | 'doctor',
      specialization: teacherData.specialization,
      license_number: teacherData.license_number,
      is_available: teacherData.is_available
    };

    console.log('secureTeacherSignup: Success');
    return { teacher };
  } catch (error) {
    console.error('secureTeacherSignup: Unexpected error:', error);
    return { error: 'An unexpected error occurred during signup' };
  }
};

export const secureStudentSignup = async (
  email: string,
  password: string,
  fullName: string,
  school: string,
  grade: string
) => {
  try {
    console.log('secureStudentSignup: Starting signup for:', email);

    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          user_type: 'student',
          full_name: fullName,
          school,
          grade
        }
      }
    });

    if (authError) {
      console.error('secureStudentSignup: Auth error:', authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create user account' };
    }

    // Create student profile
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        school,
        grade
      })
      .select()
      .single();

    if (studentError) {
      console.error('secureStudentSignup: Student profile error:', studentError);
      return { error: 'Failed to create student profile' };
    }

    const student: Student = {
      id: studentData.id,
      full_name: studentData.full_name,
      school: studentData.school,
      grade: studentData.grade
    };

    console.log('secureStudentSignup: Success');
    return { student };
  } catch (error) {
    console.error('secureStudentSignup: Unexpected error:', error);
    return { error: 'An unexpected error occurred during signup' };
  }
};

export const secureSignIn = async (email: string, password: string) => {
  try {
    console.log('secureSignIn: Starting signin for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('secureSignIn: Signin error:', error);
      return { error: error.message };
    }

    console.log('secureSignIn: Success');
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('secureSignIn: Unexpected error:', error);
    return { error: 'An unexpected error occurred during signin' };
  }
};
