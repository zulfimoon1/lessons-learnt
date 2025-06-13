import { useState } from 'react';
import { Teacher } from '@/types/auth';
import { teacherEmailLoginService, teacherSignupService } from '@/services/authService';
import { secureSessionService } from '@/services/secureSessionService';

export const useTeacherAuth = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('useTeacherAuth: Starting login process with email:', email);
      
      // Enhanced input validation
      if (!email?.trim() || !password?.trim()) {
        return { error: 'Email and password are required' };
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { error: 'Please enter a valid email address' };
      }
      
      const result = await teacherEmailLoginService(email.trim(), password);
      console.log('useTeacherAuth: Login service result', { 
        success: 'teacher' in result && !!result.teacher, 
        error: 'error' in result ? result.error : undefined 
      });
      
      if ('teacher' in result && result.teacher) {
        // Ensure role is properly typed
        const teacherData: Teacher = {
          ...result.teacher,
          role: result.teacher.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacherData);
        // Securely store teacher data
        try {
          secureSessionService.securelyStoreUserData('teacher', teacherData);
          localStorage.removeItem('student');
          localStorage.removeItem('platformAdmin');
          console.log('useTeacherAuth: Teacher data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher data to localStorage:', storageError);
        }
        
        return { teacher: teacherData };
      }
      
      return { error: 'error' in result ? result.error : 'Login failed. Please check your credentials.' };
    } catch (error) {
      console.error('useTeacherAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (name: string, email: string, school: string, password: string, role: 'teacher' | 'admin' | 'doctor' = 'teacher') => {
    try {
      console.log('useTeacherAuth: Starting signup process for:', name);
      
      // Enhanced input validation
      if (!name?.trim() || !email?.trim() || !school?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { error: 'Please enter a valid email address' };
      }

      // Basic password validation
      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters long' };
      }
      
      const result = await teacherSignupService(name.trim(), email.trim(), school.trim(), password, role);
      console.log('useTeacherAuth: Signup service result', { 
        success: 'teacher' in result && !!result.teacher, 
        error: 'error' in result ? result.error : undefined 
      });
      
      if ('teacher' in result && result.teacher) {
        // Ensure role is properly typed
        const teacherData: Teacher = {
          ...result.teacher,
          role: result.teacher.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacherData);
        // Securely store teacher data
        try {
          secureSessionService.securelyStoreUserData('teacher', teacherData);
          localStorage.removeItem('student');
          localStorage.removeItem('platformAdmin');
          console.log('useTeacherAuth: Teacher signup data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher signup data to localStorage:', storageError);
        }
        
        return { teacher: teacherData };
      }
      
      return { error: 'error' in result ? result.error : 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('useTeacherAuth: Unexpected signup error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    try {
      localStorage.removeItem('teacher');
      secureSessionService.clearSession('teacher');
    } catch (error) {
      console.error('useTeacherAuth: Error clearing teacher data:', error);
    }
  };

  const restoreFromStorage = () => {
    try {
      // Try secure storage first
      const savedTeacher = secureSessionService.securelyRetrieveUserData('teacher');
      if (savedTeacher && savedTeacher.id && savedTeacher.name) {
        setTeacher(savedTeacher);
        return true;
      }
      
      // Fallback to regular localStorage for backward compatibility
      const legacyTeacher = localStorage.getItem('teacher');
      if (legacyTeacher) {
        const parsedTeacher = JSON.parse(legacyTeacher);
        if (parsedTeacher && parsedTeacher.id && parsedTeacher.name) {
          setTeacher(parsedTeacher);
          // Migrate to secure storage
          secureSessionService.securelyStoreUserData('teacher', parsedTeacher);
          localStorage.removeItem('teacher');
          return true;
        } else {
          localStorage.removeItem('teacher');
        }
      }
    } catch (error) {
      console.error('useTeacherAuth: Error restoring teacher from storage:', error);
      localStorage.removeItem('teacher');
      secureSessionService.clearSession('teacher');
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
