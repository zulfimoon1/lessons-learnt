
import { useState, useEffect } from 'react';
import { consolidatedAuthService } from '@/services/consolidatedAuthService';
import { secureSessionService } from '@/services/secureSessionService';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
}

export const useTeacherAuth = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = consolidatedAuthService.getCurrentUser();
        if (currentUser && currentUser.userType === 'teacher') {
          setTeacher({
            id: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            school: currentUser.school,
            role: currentUser.role
          });
        }
      } catch (error) {
        console.error('Teacher auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureLogin({
        email,
        password,
        school: 'unknown', // Will be populated from database
        userType: 'teacher'
      });

      if (result.success && result.user) {
        setTeacher({
          id: result.user.id,
          name: result.user.name || '',
          email: result.user.email || email,
          school: result.user.school,
          role: result.user.role
        });
        return { teacher: result.user };
      } else {
        return { error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
    try {
      setIsLoading(true);

      const result = await consolidatedAuthService.secureSignup({
        userType: 'teacher',
        name,
        email,
        school,
        role,
        password
      });

      if (result.success && result.user) {
        setTeacher({
          id: result.user.id,
          name: result.user.name || name,
          email: result.user.email || email,
          school: result.user.school,
          role: result.user.role
        });
        return { teacher: result.user };
      } else {
        return { error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    consolidatedAuthService.logout();
    setTeacher(null);
  };

  const getCurrentUser = (): Teacher | null => {
    const session = secureSessionService.getSecureSession();
    if (!session || session.userType !== 'teacher') return null;

    const currentUser = consolidatedAuthService.getCurrentUser();
    if (currentUser && currentUser.userType === 'teacher') {
      return {
        id: currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        school: currentUser.school,
        role: currentUser.role
      };
    }
    return null;
  };

  const updateProfile = async (updates: Partial<Teacher>) => {
    try {
      setIsLoading(true);
      
      if (teacher) {
        const updatedTeacher = { ...teacher, ...updates };
        setTeacher(updatedTeacher);
        return { success: true };
      }
      
      return { error: 'No teacher logged in' };
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
    teacher,
    isLoading,
    login,
    signup,
    logout,
    getCurrentUser,
    updateProfile,
    isAuthenticated
  };
};
