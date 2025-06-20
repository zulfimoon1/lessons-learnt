
import { useState } from 'react';
import { Teacher } from '@/types/auth';
import { authenticateTeacher, registerTeacher } from '@/services/properAuthService';

export const useTeacherAuth = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('useTeacherAuth: Starting teacher login process for:', email);
      
      // Enhanced input validation
      if (!email?.trim() || !password?.trim()) {
        return { error: 'Email and password are required' };
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { error: 'Please enter a valid email address' };
      }
      
      // Call the proper authentication service
      const result = await authenticateTeacher(email.trim(), password);
      console.log('useTeacherAuth: Authentication service result:', result);
      
      if (result.teacher) {
        const teacherData: Teacher = {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          school: result.teacher.school,
          role: result.teacher.role
        };
        
        setTeacher(teacherData);
        
        // Store teacher data in localStorage
        try {
          localStorage.setItem('teacher', JSON.stringify(teacherData));
          localStorage.removeItem('student');
          localStorage.removeItem('platformAdmin');
          console.log('useTeacherAuth: Teacher data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher data to localStorage:', storageError);
        }
        
        return { teacher: teacherData };
      }
      
      return { error: result.error || 'Login failed. Please check your credentials.' };
    } catch (error) {
      console.error('useTeacherAuth: Login error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (name: string, email: string, school: string, password: string, role: 'teacher' | 'admin' | 'doctor' = 'teacher') => {
    try {
      console.log('useTeacherAuth: Starting teacher signup process for:', name);
      
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
      if (password.length < 4) {
        return { error: 'Password must be at least 4 characters long' };
      }
      
      // Call the proper registration service
      const result = await registerTeacher(name.trim(), email.trim(), school.trim(), password, role);
      console.log('useTeacherAuth: Registration service result:', result);
      
      if (result.teacher) {
        const teacherData: Teacher = {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          school: result.teacher.school,
          role: result.teacher.role
        };
        
        setTeacher(teacherData);
        
        // Store teacher data in localStorage
        try {
          localStorage.setItem('teacher', JSON.stringify(teacherData));
          localStorage.removeItem('student');
          localStorage.removeItem('platformAdmin');
          console.log('useTeacherAuth: Teacher signup data saved successfully');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher signup data to localStorage:', storageError);
        }
        
        return { teacher: teacherData };
      }
      
      return { error: result.error || 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('useTeacherAuth: Signup error:', error);
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
          console.log('useTeacherAuth: Teacher session restored successfully');
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
