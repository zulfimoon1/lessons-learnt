
import { useState } from 'react';
import { Teacher } from '@/types/auth';
import { teacherEmailLoginService, teacherSignupService } from '@/services/authService';

export const useTeacherAuth = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('useTeacherAuth: Starting login process with email:', email);
      
      const result = await teacherEmailLoginService(email, password);
      console.log('useTeacherAuth: Service result', { 
        success: !!result.teacher, 
        error: result.error 
      });
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        try {
          localStorage.setItem('teacher', JSON.stringify(result.teacher));
          localStorage.removeItem('student');
          console.log('useTeacherAuth: Teacher data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher data to localStorage:', storageError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useTeacherAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (name: string, email: string, school: string, password: string, role: 'teacher' | 'admin' | 'doctor' = 'teacher') => {
    try {
      console.log('useTeacherAuth: Starting signup process for:', name);
      
      const result = await teacherSignupService(name, email, school, password, role);
      console.log('useTeacherAuth: Signup service result', { 
        success: !!result.teacher, 
        error: result.error 
      });
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        try {
          localStorage.setItem('teacher', JSON.stringify(result.teacher));
          localStorage.removeItem('student');
          console.log('useTeacherAuth: Teacher signup data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher signup data to localStorage:', storageError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useTeacherAuth: Unexpected signup error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    try {
      localStorage.removeItem('teacher');
    } catch (error) {
      console.error('useTeacherAuth: Error clearing teacher data:', error);
    }
  };

  const restoreFromStorage = () => {
    try {
      const savedTeacher = localStorage.getItem('teacher');
      if (savedTeacher) {
        const parsedTeacher = JSON.parse(savedTeacher);
        if (parsedTeacher && parsedTeacher.id && parsedTeacher.name) {
          setTeacher(parsedTeacher);
          return true;
        } else {
          localStorage.removeItem('teacher');
        }
      }
    } catch (error) {
      console.error('useTeacherAuth: Error restoring teacher from storage:', error);
      localStorage.removeItem('teacher');
    }
    return false;
  };

  return {
    teacher,
    login,
    signup,
    logout,
    restoreFromStorage,
    setTeacher
  };
};
