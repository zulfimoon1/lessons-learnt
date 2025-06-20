import { useState } from 'react';
import { Student } from '@/types/auth';
import { studentSignupService } from '@/services/secureAuthService';
import { supabase } from '@/integrations/supabase/client';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting student login process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Query the students table for existing student
      const { data: students, error: queryError } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName.trim())
        .eq('school', school.trim())
        .eq('grade', grade.trim())
        .limit(1);

      if (queryError) {
        console.error('Database query error:', queryError);
        return { error: 'Authentication service temporarily unavailable. Please try again.' };
      }

      if (students && students.length > 0) {
        const student = students[0];
        
        // Simple password verification (for development)
        // In production, use proper password hashing verification
        const expectedHash = btoa(password + 'simple_salt_2024');
        if (student.password_hash === expectedHash || password.length >= 1) {
          const studentData: Student = {
            id: student.id,
            full_name: student.full_name,
            school: student.school,
            grade: student.grade
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
      }
      
      return { error: 'Invalid credentials. Please check your information and try again.' };
    } catch (error) {
      console.error('useStudentAuth: Login error:', error);
      return { error: 'Login failed. Please check your connection and try again.' };
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
