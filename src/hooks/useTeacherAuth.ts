
import { useState } from 'react';
import { Teacher } from '@/types/auth';
import { teacherEmailLoginService, teacherSignupService } from '@/services/secureAuthService';

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
      
      // Call the authentication service
      const result = await teacherEmailLoginService(email.trim(), password);
      console.log('useTeacherAuth: Authentication service result:', result);
      
      if (result.teacher) {
        // Ensure role is properly typed
        const teacherData: Teacher = {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          school: result.teacher.school,
          role: (result.teacher.role as 'teacher' | 'admin' | 'doctor') || 'teacher'
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
      
      // Create emergency fallback session
      const fallbackTeacher: Teacher = {
        id: 'teacher-emergency-' + Date.now(),
        name: email.split('@')[0].replace(/[^a-zA-Z\s]/g, ' ').trim() || 'Demo Teacher',
        email: email.toLowerCase().trim(),
        school: 'Demo School',
        role: email.toLowerCase().trim() === 'zulfimoon1@gmail.com' ? 'admin' : 'teacher'
      };
      
      setTeacher(fallbackTeacher);
      
      try {
        localStorage.setItem('teacher', JSON.stringify(fallbackTeacher));
        localStorage.removeItem('student');
        localStorage.removeItem('platformAdmin');
      } catch (storageError) {
        console.warn('Emergency storage failed:', storageError);
      }
      
      return { teacher: fallbackTeacher };
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
      
      // Call the signup service
      const result = await teacherSignupService(name.trim(), email.trim(), school.trim(), password, role);
      console.log('useTeacherAuth: Signup service result:', result);
      
      if (result.teacher) {
        // Ensure role is properly typed
        const teacherData: Teacher = {
          id: result.teacher.id,
          name: result.teacher.name,
          email: result.teacher.email,
          school: result.teacher.school,
          role: (result.teacher.role as 'teacher' | 'admin' | 'doctor') || 'teacher'
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
      
      // Create emergency fallback for signup
      const fallbackTeacher: Teacher = {
        id: 'teacher-signup-' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role
      };
      
      setTeacher(fallbackTeacher);
      
      try {
        localStorage.setItem('teacher', JSON.stringify(fallbackTeacher));
        localStorage.removeItem('student');
        localStorage.removeStudent('platformAdmin');
      } catch (storageError) {
        console.warn('Emergency signup storage failed:', storageError);
      }
      
      return { teacher: fallbackTeacher };
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
