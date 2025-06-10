
import { useState } from 'react';
import { Student } from '@/types/auth';
import { studentSimpleLoginService, studentSignupService } from '@/services/authService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting login process', { fullName });
      
      if (!fullName || !password) {
        return { error: 'Full name and password are required.' };
      }
      
      const result = await studentSimpleLoginService(fullName, password);
      console.log('useStudentAuth: Service result', { 
        success: !!result.student, 
        error: result.error 
      });
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          localStorage.removeItem('teacher');
          console.log('useStudentAuth: Student data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to localStorage:', storageError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useStudentAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting signup process', { fullName, school, grade });
      
      if (!fullName || !school || !grade || !password) {
        return { error: 'All fields are required for signup.' };
      }
      
      const result = await studentSignupService(fullName, school, grade, password);
      console.log('useStudentAuth: Service result', { 
        success: !!result.student, 
        error: result.error 
      });
      
      if (result.student) {
        setStudent(result.student);
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(result.student));
          localStorage.removeItem('teacher');
          console.log('useStudentAuth: Student data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to localStorage:', storageError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useStudentAuth: Unexpected error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setStudent(null);
    try {
      localStorage.removeItem('student');
    } catch (error) {
      console.error('useStudentAuth: Error clearing student data:', error);
    }
  };

  const restoreFromStorage = () => {
    try {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent);
        if (parsedStudent && parsedStudent.id && parsedStudent.full_name) {
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
