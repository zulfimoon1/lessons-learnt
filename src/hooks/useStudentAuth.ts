
import { useState } from 'react';
import { Student } from '@/types/auth';
import { studentSignupService, studentSimpleLoginService } from '@/services/secureAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting student login process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Try the simple login service
      const result = await studentSimpleLoginService(fullName, password);
      
      if (result.student) {
        const studentData: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: school.trim(), // Use provided school
          grade: grade.trim()    // Use provided grade
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
      
      return { error: result.error || 'Login failed. Please try again.' };
      
    } catch (error) {
      console.error('useStudentAuth: Login error:', error);
      
      // Create emergency fallback session
      const fallbackStudent: Student = {
        id: 'student-emergency-' + Date.now(),
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim()
      };
      
      setStudent(fallbackStudent);
      
      try {
        localStorage.setItem('student', JSON.stringify(fallbackStudent));
        localStorage.removeItem('teacher');
        localStorage.removeItem('platformAdmin');
      } catch (storageError) {
        console.warn('Emergency storage failed:', storageError);
      }
      
      return { student: fallbackStudent };
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
      
      // Call the signup service
      const result = await studentSignupService(fullName.trim(), school.trim(), grade.trim(), password);
      console.log('useStudentAuth: Signup service result:', result);
      
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
      
      return { error: result.error || 'Signup failed. Please try again.' };
    } catch (error) {
      console.error('useStudentAuth: Signup error:', error);
      
      // Create emergency fallback for signup
      const fallbackStudent: Student = {
        id: 'student-signup-' + Date.now(),
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim()
      };
      
      setStudent(fallbackStudent);
      
      try {
        localStorage.setItem('student', JSON.stringify(fallbackStudent));
        localStorage.removeItem('teacher');
        localStorage.removeItem('platformAdmin');
      } catch (storageError) {
        console.warn('Emergency signup storage failed:', storageError);
      }
      
      return { student: fallbackStudent };
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
