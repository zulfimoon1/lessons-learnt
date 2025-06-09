
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

    // The teacher profile will be created automatically by the handle_new_user trigger
    // So we just need to return success
    console.log('secureTeacherSignup: Success - profile will be created by trigger');
    return { success: true };
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

    // The student profile will be created automatically by the handle_new_user trigger
    console.log('secureStudentSignup: Success - profile will be created by trigger');
    return { success: true };
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
