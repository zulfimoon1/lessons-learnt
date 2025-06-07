
import { useState, useEffect } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin';
}

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

export const useAuthStorage = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthStorage: Initializing auth state');
    
    try {
      // Load from localStorage on mount
      const savedTeacher = localStorage.getItem('teacher');
      const savedStudent = localStorage.getItem('student');
      
      if (savedTeacher) {
        try {
          const teacherData = JSON.parse(savedTeacher);
          console.log('useAuthStorage: Loaded teacher from storage:', teacherData);
          setTeacher(teacherData);
        } catch (error) {
          console.error('useAuthStorage: Error parsing teacher data:', error);
          localStorage.removeItem('teacher');
        }
      }
      
      if (savedStudent) {
        try {
          const studentData = JSON.parse(savedStudent);
          console.log('useAuthStorage: Loaded student from storage:', studentData);
          setStudent(studentData);
        } catch (error) {
          console.error('useAuthStorage: Error parsing student data:', error);
          localStorage.removeItem('student');
        }
      }
    } catch (error) {
      console.error('useAuthStorage: Error during initialization:', error);
      // Clear all data on error
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
    } finally {
      setIsLoading(false);
      console.log('useAuthStorage: Initialization complete');
    }
  }, []);

  const saveTeacher = (teacherData: Teacher) => {
    console.log('useAuthStorage: Saving teacher to storage:', teacherData);
    try {
      setTeacher(teacherData);
      setStudent(null); // Clear student when teacher logs in
      localStorage.setItem('teacher', JSON.stringify(teacherData));
      localStorage.removeItem('student');
      console.log('useAuthStorage: Teacher saved successfully');
    } catch (error) {
      console.error('useAuthStorage: Error saving teacher:', error);
    }
  };

  const saveStudent = (studentData: Student) => {
    console.log('useAuthStorage: Saving student to storage:', studentData);
    try {
      setStudent(studentData);
      setTeacher(null); // Clear teacher when student logs in
      localStorage.setItem('student', JSON.stringify(studentData));
      localStorage.removeItem('teacher');
      console.log('useAuthStorage: Student saved successfully');
    } catch (error) {
      console.error('useAuthStorage: Error saving student:', error);
    }
  };

  const clearAuth = () => {
    console.log('useAuthStorage: Clearing all auth data');
    try {
      setTeacher(null);
      setStudent(null);
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
      console.log('useAuthStorage: Auth data cleared successfully');
    } catch (error) {
      console.error('useAuthStorage: Error clearing auth data:', error);
    }
  };

  return {
    teacher,
    student,
    isLoading,
    saveTeacher,
    saveStudent,
    clearAuth
  };
};
