
import { useState } from 'react';
import { Student } from '@/types/auth';
import { enhancedSecureStudentLogin, enhancedSecureStudentSignup } from '@/services/enhancedSecureAuthService';
import { secureSessionService } from '@/services/secureSessionService';
import { secureRateLimitService } from '@/services/secureRateLimitService';
import { enhancedValidateInput } from '@/services/enhancedInputValidation';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting enhanced secure login process');
      
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(fullName);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      const gradeValidation = enhancedValidateInput.validateGrade(grade);
      if (!gradeValidation.isValid) {
        return { error: gradeValidation.message };
      }

      // Check rate limiting
      const identifier = `${fullName}-${school}-${grade}`;
      const rateLimitCheck = await secureRateLimitService.checkRateLimit(identifier, 'student-login');
      
      if (!rateLimitCheck.allowed) {
        await secureRateLimitService.recordFailedAttempt(identifier, 'student-login', { reason: 'rate_limit' });
        return { error: rateLimitCheck.message };
      }

      // Apply progressive delay
      const delay = await secureRateLimitService.getProgressiveDelay(identifier, 'student-login');
      if (delay > 1000) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await enhancedSecureStudentLogin(fullName, school, grade, password);
      console.log('useStudentAuth: Enhanced secure service result', { 
        success: !!result.user, 
        error: result.error 
      });
      
      if (result.user) {
        const studentData: Student = {
          id: result.user.id,
          full_name: result.user.fullName,
          school: result.user.school,
          grade: result.user.grade
        };
        
        setStudent(studentData);
        
        // Securely store student data using enhanced session service
        try {
          secureSessionService.securelyStoreUserData('student', studentData);
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student data saved securely');
          
          // Record successful login
          await secureRateLimitService.recordSuccessfulAttempt(identifier, 'student-login');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to secure storage:', storageError);
        }
        
        return { student: studentData };
      } else {
        // Record failed attempt
        await secureRateLimitService.recordFailedAttempt(identifier, 'student-login', { reason: 'invalid_credentials' });
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('useStudentAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting enhanced secure signup process');
      
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(fullName);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      const gradeValidation = enhancedValidateInput.validateGrade(grade);
      if (!gradeValidation.isValid) {
        return { error: gradeValidation.message };
      }

      // Enhanced password validation
      const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.message };
      }

      // Check rate limiting for signups
      const identifier = `${fullName}-${school}`;
      const rateLimitCheck = await secureRateLimitService.checkRateLimit(identifier, 'student-signup', {
        maxAttempts: 3,
        windowMinutes: 60
      });
      
      if (!rateLimitCheck.allowed) {
        return { error: rateLimitCheck.message };
      }
      
      const result = await enhancedSecureStudentSignup(fullName, school, grade, password);
      console.log('useStudentAuth: Enhanced secure signup service result', { 
        success: !!result.user, 
        error: result.error 
      });
      
      if (result.user) {
        const studentData: Student = {
          id: result.user.id,
          full_name: result.user.fullName,
          school: result.user.school,
          grade: result.user.grade
        };
        
        setStudent(studentData);
        
        // Securely store student data using enhanced session service
        try {
          secureSessionService.securelyStoreUserData('student', studentData);
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student signup data saved securely');
          
          // Record successful signup
          await secureRateLimitService.recordSuccessfulAttempt(identifier, 'student-signup');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student signup data to secure storage:', storageError);
        }
        
        return { student: studentData };
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('useStudentAuth: Unexpected signup error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setStudent(null);
    try {
      localStorage.removeItem('student');
      secureSessionService.clearSession('student');
      sessionStorage.clear(); // Clear all session data for security
    } catch (error) {
      console.error('useStudentAuth: Error clearing student data:', error);
    }
  };

  const restoreFromStorage = () => {
    try {
      // Try secure storage first
      const savedStudent = secureSessionService.securelyRetrieveUserData('student');
      if (savedStudent && savedStudent.id && savedStudent.full_name && savedStudent.school && savedStudent.grade) {
        setStudent(savedStudent);
        return true;
      }
      
      // Fallback to regular localStorage for backward compatibility
      const legacyStudent = localStorage.getItem('student');
      if (legacyStudent) {
        const parsedStudent = JSON.parse(legacyStudent);
        if (parsedStudent && parsedStudent.id && parsedStudent.full_name && parsedStudent.school && parsedStudent.grade) {
          setStudent(parsedStudent);
          // Migrate to secure storage
          secureSessionService.securelyStoreUserData('student', parsedStudent);
          localStorage.removeItem('student');
          return true;
        } else {
          localStorage.removeItem('student');
        }
      }
    } catch (error) {
      console.error('useStudentAuth: Error restoring student from storage:', error);
      localStorage.removeItem('student');
      secureSessionService.clearSession('student');
    }
    return false;
  };

  return {
    student,
    login,
    signup,
    logout,
    restoreFromStorage,
    setStudent
  };
};
