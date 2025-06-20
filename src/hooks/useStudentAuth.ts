
import { useState } from 'react';
import { Student } from '@/types/auth';
import { authenticateStudent, registerStudent } from '@/services/properAuthService';

export const useStudentAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);

  const login = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      console.log('useStudentAuth: Starting student login process for:', { fullName, school, grade });
      
      // Basic input validation
      if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
        return { error: 'All fields are required' };
      }

      // Special handling for demo student
      if (fullName.toLowerCase().includes('demo') && school.toLowerCase().includes('demo') && grade.toLowerCase().includes('5')) {
        console.log('Demo student detected, creating/authenticating demo student');
        const demoStudent: Student = {
          id: 'demo-student-id',
          full_name: 'demo student',
          school: 'demo school',
          grade: 'grade 5'
        };
        
        setStudent(demoStudent);
        
        // Store student data in localStorage
        try {
          localStorage.setItem('student', JSON.stringify(demoStudent));
          localStorage.removeItem('teacher');
          localStorage.removeItem('platformAdmin');
          console.log('useStudentAuth: Demo student data saved successfully');
        } catch (storageError) {
          console.warn('useStudentAuth: Failed to save demo student data to localStorage:', storageError);
        }
        
        return { student: demoStudent };
      }

      // Call the proper authentication service for non-demo students
      const result = await authenticateStudent(fullName, school, grade, password);
      
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
      
      return { error: result.error || 'Login failed. Please try again.' };
      
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
      
      // Call the proper registration service
      const result = await registerStudent(fullName.trim(), school.trim(), grade.trim(), password);
      console.log('useStudentAuth: Registration service result:', result);
      
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
