
import { useState, useEffect, useCallback } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  is_available?: boolean;
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
    let isMounted = true;
    
    const initializeAuth = () => {
      console.log('useAuthStorage: Initializing auth state');
      
      try {
        const savedTeacher = localStorage.getItem('teacher');
        const savedStudent = localStorage.getItem('student');
        
        if (isMounted) {
          if (savedTeacher) {
            try {
              const teacherData = JSON.parse(savedTeacher);
              console.log('useAuthStorage: Loaded teacher from storage');
              setTeacher(teacherData);
            } catch (error) {
              console.error('useAuthStorage: Error parsing teacher data:', error);
              localStorage.removeItem('teacher');
            }
          }
          
          if (savedStudent) {
            try {
              const studentData = JSON.parse(savedStudent);
              console.log('useAuthStorage: Loaded student from storage');
              setStudent(studentData);
            } catch (error) {
              console.error('useAuthStorage: Error parsing student data:', error);
              localStorage.removeItem('student');
            }
          }
          
          setIsLoading(false);
          console.log('useAuthStorage: Initialization complete');
        }
      } catch (error) {
        console.error('useAuthStorage: Error during initialization:', error);
        if (isMounted) {
          localStorage.removeItem('teacher');
          localStorage.removeItem('student');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveTeacher = useCallback((teacherData: Teacher) => {
    console.log('useAuthStorage: Saving teacher to storage');
    try {
      setTeacher(teacherData);
      setStudent(null);
      localStorage.setItem('teacher', JSON.stringify(teacherData));
      localStorage.removeItem('student');
      console.log('useAuthStorage: Teacher saved successfully');
    } catch (error) {
      console.error('useAuthStorage: Error saving teacher:', error);
    }
  }, []);

  const saveStudent = useCallback((studentData: Student) => {
    console.log('useAuthStorage: Saving student to storage');
    try {
      setStudent(studentData);
      setTeacher(null);
      localStorage.setItem('student', JSON.stringify(studentData));
      localStorage.removeItem('teacher');
      console.log('useAuthStorage: Student saved successfully');
    } catch (error) {
      console.error('useAuthStorage: Error saving student:', error);
    }
  }, []);

  const clearAuth = useCallback(() => {
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
  }, []);

  return {
    teacher,
    student,
    isLoading,
    saveTeacher,
    saveStudent,
    clearAuth
  };
};
