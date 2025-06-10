
import { useState } from 'react';
import { Teacher } from '@/types/auth';
import { enhancedSecureTeacherLogin, enhancedSecureTeacherSignup } from '@/services/enhancedSecureAuthService';
import { secureSessionService } from '@/services/secureSessionService';
import { secureRateLimitService } from '@/services/secureRateLimitService';
import { enhancedValidateInput } from '@/services/enhancedInputValidation';

export const useTeacherAuth = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('useTeacherAuth: Starting enhanced secure login process with email:', email);
      
      // Enhanced input validation
      const emailValidation = enhancedValidateInput.validateEmail(email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.message };
      }

      // Check rate limiting
      const rateLimitCheck = await secureRateLimitService.checkRateLimit(email, 'teacher-login');
      
      if (!rateLimitCheck.allowed) {
        await secureRateLimitService.recordFailedAttempt(email, 'teacher-login', { reason: 'rate_limit' });
        return { error: rateLimitCheck.message };
      }

      // Apply progressive delay
      const delay = await secureRateLimitService.getProgressiveDelay(email, 'teacher-login');
      if (delay > 1000) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await enhancedSecureTeacherLogin(email, password);
      console.log('useTeacherAuth: Enhanced secure service result', { 
        success: !!result.teacher, 
        error: result.error 
      });
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        try {
          secureSessionService.securelyStoreUserData('teacher', result.teacher);
          localStorage.removeItem('student');
          console.log('useTeacherAuth: Teacher data saved successfully');
          
          // Record successful login
          await secureRateLimitService.recordSuccessfulAttempt(email, 'teacher-login');
        } catch (storageError) {
          console.warn('useTeacherAuth: Failed to save teacher data to localStorage:', storageError);
        }
      } else {
        // Record failed attempt
        await secureRateLimitService.recordFailedAttempt(email, 'teacher-login', { reason: 'invalid_credentials' });
      }
      
      return result;
    } catch (error) {
      console.error('useTeacherAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (name: string, email: string, school: string, password: string, role: 'teacher' | 'admin' | 'doctor' = 'teacher') => {
    try {
      console.log('useTeacherAuth: Starting enhanced secure signup process for:', name);
      
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(name);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const emailValidation = enhancedValidateInput.validateEmail(email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      // Enhanced password validation
      const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.message };
      }

      // Check rate limiting for signups
      const rateLimitCheck = await secureRateLimitService.checkRateLimit(email, 'teacher-signup', {
        maxAttempts: 3,
        windowMinutes: 60
      });
      
      if (!rateLimitCheck.allowed) {
        return { error: rateLimitCheck.message };
      }
      
      const result = await enhancedSecureTeacherSignup(name, email, school, password, role);
      console.log('useTeacherAuth: Enhanced secure signup service result', { 
        success: !!result.teacher, 
        error: result.error 
      });
      
      if (result.teacher) {
        setTeacher(result.teacher);
        // Securely store teacher data
        try {
          secureSessionService.securelyStoreUserData('teacher', result.teacher);
          localStorage.removeItem('student');
          console.log('useTeacherAuth: Teacher signup data saved successfully');
          
          // Record successful signup
          await secureRateLimitService.recordSuccessfulAttempt(email, 'teacher-signup');
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
