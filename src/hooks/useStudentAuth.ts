import { useState } from 'react';
import { Student } from '@/types/auth';
import { studentSimpleLoginService, studentSignupService } from '@/services/secureAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting login process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Call the service with just fullName and password
      const result = await studentSimpleLoginService(fullName.trim(), password.trim());
      console.log('useStudentAuth: Login service result:', { 
        success: !!result.student, 
        hasError: 'error' in result 
      });
      
      if (result.student) {
        // Verify the student data matches the provided school and grade
        if (result.student.school !== school.trim() || result.student.grade !== grade.trim()) {
          console.log('useStudentAuth: School/grade mismatch:', {
            expected: { school: school.trim(), grade: grade.trim() },
            actual: { school: result.student.school, grade: result.student.grade }
          });
          return { error: 'Invalid credentials. Please check your school and grade information.' };
        }

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
      
      return { error: 'error' in result ? result.error : 'Login failed. Please check your credentials.' };
    } catch (error) {
      console.error('useStudentAuth: Unexpected error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
    }
  };

  const signup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting signup process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Basic password validation
      if (password.length < 4) {
        return { error: 'Password must be at least 4 characters long' };
      }
      
      const result = await studentSignupService(fullName.trim(), school.trim(), grade.trim(), password);
      console.log('useStudentAuth: Signup service result:', { 
        success: !!result.student, 
        hasError: 'error' in result 
      });
      
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
      
      return { error: 'error' in result ? result.error : 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('useStudentAuth: Unexpected signup error:', error);
      return { error: 'Signup failed. Please check your connection and try again.' };
    }
  };

  const logout = () => {
    setStudent(null);
    try {
      localStorage.removeItem('student');
      sessionStorage.clear();
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
