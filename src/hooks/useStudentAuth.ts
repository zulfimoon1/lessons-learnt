import { useState } from 'react';
import { Student } from '@/types/auth';
import { studentSimpleLoginService, studentSignupService } from '@/services/authService';
import { secureSessionService } from '@/services/secureSessionService';

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
        success: 'student' in result && !!result.student, 
        error: 'error' in result ? result.error : undefined 
      });
      
      if ('student' in result && result.student) {
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
        
        // Store student data securely
        try {
          secureSessionService.securelyStoreUserData('student', studentData);
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student data saved securely');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student data to secure storage:', storageError);
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
      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters long' };
      }
      
      const result = await studentSignupService(fullName.trim(), school.trim(), grade.trim(), password);
      console.log('useStudentAuth: Signup service result:', { 
        success: 'student' in result && !!result.student, 
        error: 'error' in result ? result.error : undefined 
      });
      
      if ('student' in result && result.student) {
        const studentData: Student = {
          id: (result.student as any).id,
          full_name: (result.student as any).full_name,
          school: (result.student as any).school,
          grade: (result.student as any).grade
        };
        
        setStudent(studentData);
        
        // Store student data securely
        try {
          secureSessionService.securelyStoreUserData('student', studentData);
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Student signup data saved securely');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save student signup data to secure storage:', storageError);
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
      secureSessionService.clearSession('student');
      sessionStorage.clear();
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
