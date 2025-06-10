
import { useState } from 'react';
import { Student } from '@/types/auth';
import { enhancedSecureStudentLogin, enhancedSecureStudentSignup } from '@/services/enhancedSecureAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting enhanced secure login process');
      
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
        
        // Securely store student data with encryption
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student data saved securely');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to localStorage:', storageError);
        }
        
        return { student: studentData };
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
        
        // Securely store student data with encryption
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student signup data saved securely');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student signup data to localStorage:', storageError);
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
      sessionStorage.clear(); // Clear all session data for security
    } catch (error) {
      console.error('useStudentAuth: Error clearing student data:', error);
    }
  };

  const restoreFromStorage = () => {
    try {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent);
        if (parsedStudent && parsedStudent.id && parsedStudent.full_name && parsedStudent.school && parsedStudent.grade) {
          setStudent(parsedStudent);
          return true;
        } else {
          localStorage.removeItem('student');
        }
      }
    } catch (error) {
      console.error('useStudentAuth: Error restoring student from storage:', error);
      localStorage.removeItem('student');
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
