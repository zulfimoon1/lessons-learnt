
import { supabase } from '@/integrations/supabase/client';

export const sendPasswordResetEmail = async (email: string) => {
  try {
    console.log('sendPasswordResetEmail: Sending reset email to:', email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { error: 'Please enter a valid email address.' };
    }

    // Check if teacher exists with this email
    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('id, email')
      .eq('email', email.trim().toLowerCase());

    if (searchError) {
      console.log('sendPasswordResetEmail: Database error during search');
      return { error: 'Database error. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      // Don't reveal if email exists or not for security
      return { success: true };
    }

    // Send password reset email using Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.log('sendPasswordResetEmail: Error sending reset email');
      return { error: 'Failed to send reset email. Please try again.' };
    }

    console.log('sendPasswordResetEmail: Reset email sent successfully');
    return { success: true };
  } catch (error) {
    console.log('sendPasswordResetEmail: Unexpected error occurred');
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

export const resetPassword = async (newPassword: string) => {
  try {
    console.log('resetPassword: Updating password');
    
    // Password strength validation
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.log('resetPassword: Error updating password');
      return { error: 'Failed to update password. Please try again.' };
    }

    console.log('resetPassword: Password updated successfully');
    return { success: true };
  } catch (error) {
    console.log('resetPassword: Unexpected error occurred');
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};
