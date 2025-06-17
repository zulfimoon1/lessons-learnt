
import { useState, useEffect } from 'react';
import { consolidatedAuthService } from '@/services/consolidatedAuthService';
import { secureSessionService } from '@/services/secureSessionService';

interface Student {
  id: string;
  fullName: string;
  school: string;
  grade: string;
}

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = consolidatedAuthService.getCurrentUser();
        if (currentUser && currentUser.userType === 'student') {
          setStudent({
            id: currentUser.id,
            fullName: currentUser.fullName || '',
            school: currentUser.school,
            grade: currentUser.grade || ''
          });
        }
      } catch (error) {
        console.error('Student auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureLogin({
        fullName,
        school,
        grade,
        password,
        userType: 'student'
      });

      if (result.success && result.user) {
        setStudent({
          id: result.user.id,
          fullName: result.user.fullName || fullName,
          school: result.user.school,
          grade: result.user.grade || grade
        });
        return { student: result.user };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Student login error:', error);
      return { error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureSignup({
        userType: 'student',
        fullName,
        school,
        grade,
        password
      });

      if (result.success && result.user) {
        setStudent({
          id: result.user.id,
          fullName: result.user.fullName || fullName,
          school: result.user.school,
          grade: result.user.grade || grade
        });
        return { student: result.user };
      } else {
        return { error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Student signup error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    consolidatedAuthService.logout();
    setStudent(null);
  };

  const getCurrentUser = (): Student | null => {
    const session = secureSessionService.getSecureSession();
    if (!session || session.userType !== 'student') return null;

    const currentUser = consolidatedAuthService.getCurrentUser();
    if (currentUser && currentUser.userType === 'student') {
      return {
        id: currentUser.id,
        fullName: currentUser.fullName || '',
        school: currentUser.school,
        grade: currentUser.grade || ''
      };
    }
    return null;
  };

  const updateProfile = async (updates: Partial<Student>) => {
    try {
      setIsLoading(true);
      
      if (student) {
        const updatedStudent = { ...student, ...updates };
        setStudent(updatedStudent);
        return { success: true };
      }
      
      return { error: 'No student logged in' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = (): boolean => {
    return consolidatedAuthService.isAuthenticated();
  };

  return {
    student,
    isLoading,
    login,
    signup,
    logout,
    getCurrentUser,
    updateProfile,
    isAuthenticated
  };
};
