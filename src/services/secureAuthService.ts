
import { supabase } from '@/integrations/supabase/client';
import { Profile, TeacherProfile } from '@/types/auth';

export const signUpWithSupabase = async (
  email: string,
  password: string,
  userData: {
    user_type: 'student' | 'teacher';
    full_name?: string;
    name?: string;
    school: string;
    grade?: string;
    role?: 'teacher' | 'admin' | 'doctor';
    specialization?: string;
  }
) => {
  try {
    console.log('Signing up user with Supabase Auth:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return { error: error.message };
    }

    console.log('Signup successful:', data);
    return { user: data.user };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { error: 'An unexpected error occurred during signup.' };
  }
};

export const signInWithSupabase = async (email: string, password: string) => {
  try {
    console.log('Signing in user with Supabase Auth:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { error: error.message };
    }

    console.log('Sign in successful:', data);
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Unexpected sign in error:', error);
    return { error: 'An unexpected error occurred during sign in.' };
  }
};

export const signOutWithSupabase = async () => {
  try {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    console.log('Sign out successful');
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    throw error;
  }
};

export const fetchUserProfile = async (userId: string): Promise<{ profile?: Profile; teacherProfile?: TeacherProfile; error?: string }> => {
  try {
    console.log('Fetching user profile for:', userId);
    
    // Try to fetch student profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return { error: profileError.message };
    }

    if (profile) {
      console.log('Student profile found:', profile);
      return { profile };
    }

    // If no student profile, try teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (teacherError && teacherError.code !== 'PGRST116') {
      console.error('Error fetching teacher profile:', teacherError);
      return { error: teacherError.message };
    }

    if (teacherProfile) {
      console.log('Teacher profile found:', teacherProfile);
      return { teacherProfile };
    }

    console.log('No profile found for user');
    return {};
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return { error: 'Failed to fetch user profile' };
  }
};
