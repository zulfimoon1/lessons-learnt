import { useState } from 'react';
import { Student } from '@/types/auth';
import { secureStudentLogin, secureStudentSignup } from '@/services/secureStudentAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting student login process for:', { fullName });
      
      // Basic input validation
      if (!fullName?.trim() || !password?.trim()) {
        return { error: 'Name and password are required' };
      }

      // Use the secure student login service with name-only authentication
      const result = await secureStudentLogin(fullName.trim(), password);
      
      if (result.student) {
        const studentData: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(studentData);
        
        // Store student data in localStorage
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to localStorage:', storageError);
        }
        
        return { student: studentData };
      }
      
      return { error: 'Login failed. Please try again.' };
      
    } catch (error) {
      console.error('useStudentAuth: Login error:', error);
      return { error: error instanceof Error ? error.message : 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting student signup process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Basic password validation
      if (password.length < 4) {
        return { error: 'Password must be at least 4 characters long' };
      }
      
      // Use the secure student signup service
      const result = await secureStudentSignup(fullName.trim(), school.trim(), grade.trim(), password);
      
      if (result.student) {
        const studentData: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(studentData);
        
        // Store student data in localStorage
        try {
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student signup data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student signup data to localStorage:', storageError);
        }
        
        return { student: studentData };
      }
      
      return { error: 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('useStudentAuth: Signup error:', error);
      return { error: error instanceof Error ? error.message : 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setStudent(null);
    try {
      localStorage.removeItem('student');
      sessionStorage.clear();
      // Redirect to homepage after logout
      window.location.href = '/';
    } catch (error) {
      console.error('useStudentAuth: Error clearing student data:', error);
      // Still redirect even if storage clearing fails
      window.location.href = '/';
    }
  };

  const restoreFromStorage = () => {
    try {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const parsedStudent = JSON.parse(savedStudent);
        if (parsedStudent && parsedStudent.id && parsedStudent.full_name && parsedStudent.school && parsedStudent.grade) {
          setStudent(parsedStudent);
          console.log('useStudentAuth: Student session restored successfully');
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
