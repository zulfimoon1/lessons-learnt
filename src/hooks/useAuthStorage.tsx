
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
    console.log('useAuthStorage: Loading auth data from localStorage');
    
    try {
      // Load from localStorage on mount
      const savedTeacher = localStorage.getItem('teacher');
      const savedStudent = localStorage.getItem('student');
      
      if (savedTeacher) {
        const teacherData = JSON.parse(savedTeacher);
        console.log('useAuthStorage: Loaded teacher from storage:', teacherData);
        setTeacher(teacherData);
      }
      
      if (savedStudent) {
        const studentData = JSON.parse(savedStudent);
        console.log('useAuthStorage: Loaded student from storage:', studentData);
        setStudent(studentData);
      }
    } catch (error) {
      console.error('useAuthStorage: Error loading from storage:', error);
      // Clear corrupted data
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
    } finally {
      setIsLoading(false);
      console.log('useAuthStorage: Initialization complete');
    }
  }, []);

  const saveTeacher = (teacherData: Teacher) => {
    console.log('useAuthStorage: Saving teacher to storage:', teacherData);
    setTeacher(teacherData);
    setStudent(null); // Clear student when teacher logs in
    localStorage.setItem('teacher', JSON.stringify(teacherData));
    localStorage.removeItem('student');
  };

  const saveStudent = (studentData: Student) => {
    console.log('useAuthStorage: Saving student to storage:', studentData);
    setStudent(studentData);
    setTeacher(null); // Clear teacher when student logs in
    localStorage.setItem('student', JSON.stringify(studentData));
    localStorage.removeItem('teacher');
  };

  const clearAuth = () => {
    console.log('useAuthStorage: Clearing auth data');
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
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
