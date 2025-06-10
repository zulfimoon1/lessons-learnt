
import { useState } from 'react';
import { Student } from '@/types/auth';
import { secureStudentLogin, secureStudentSignup } from '@/services/secureAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting secure login process', { fullName, school, grade });
      
      if (!fullName || !school || !grade || !password) {
        return { error: 'Full name, school, grade, and password are required.' };
      }
      
      const result = await secureStudentLogin(fullName, school, grade, password);
      console.log('useStudentAuth: Secure service result', { 
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
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          console.log('useStudentAuth: Student data saved successfully');
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
      console.log('useStudentAuth: Starting secure signup process', { fullName, school, grade });
      
      if (!fullName || !school || !grade || !password) {
        return { error: 'All fields are required for signup.' };
      }
      
      const result = await secureStudentSignup(fullName, school, grade, password);
      console.log('useStudentAuth: Secure service result', { 
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
        // Securely store student data
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          console.log('useStudentAuth: Student data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to localStorage:', storageError);
        }
        
        return { student: studentData };
      }
      
      return { error: result.error };
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
