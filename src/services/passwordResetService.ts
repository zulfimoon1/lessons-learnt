
import { supabase } from '@/integrations/supabase/client';

export interface PasswordResetResult {
  success: boolean;
  temporary_password?: string;
  message: string;
  student_id?: string;
}

export interface PasswordChangeResult {
  success: boolean;
  message: string;
}

export const passwordResetService = {
  /**
   * Teacher resets a student's password
   */
  async resetStudentPassword(
    studentName: string,
    studentSchool: string,
    studentGrade: string,
    teacherId: string
  ): Promise<PasswordResetResult> {
    try {
      const { data, error } = await supabase.rpc('teacher_reset_student_password', {
        student_name_param: studentName.trim(),
        student_school_param: studentSchool,
        student_grade_param: studentGrade.trim(),
        teacher_id_param: teacherId
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data[0] as PasswordResetResult;
      }

      return {
        success: false,
        message: 'No response received from server'
      };
    } catch (error) {
      console.error('Password reset service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  /**
   * Student changes password after reset
   */
  async changePasswordAfterReset(
    studentId: string,
    newPassword: string
  ): Promise<PasswordChangeResult> {
    try {
      const { data, error } = await supabase.rpc('student_change_password_after_reset', {
        student_id_param: studentId,
        new_password: newPassword
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data[0] as PasswordChangeResult;
      }

      return {
        success: false,
        message: 'No response received from server'
      };
    } catch (error) {
      console.error('Password change service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  /**
   * Check if student needs to change password
   */
  async checkPasswordChangeRequired(studentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('needs_password_change')
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('Error checking password change requirement:', error);
        return false;
      }

      return data?.needs_password_change || false;
    } catch (error) {
      console.error('Service error checking password change requirement:', error);
      return false;
    }
  }
};
