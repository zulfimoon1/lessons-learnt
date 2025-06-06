
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
    // Load from localStorage on mount
    const savedTeacher = localStorage.getItem('teacher');
    const savedStudent = localStorage.getItem('student');
    
    if (savedTeacher) {
      try {
        setTeacher(JSON.parse(savedTeacher));
      } catch (error) {
        console.error('Error parsing saved teacher:', error);
        localStorage.removeItem('teacher');
      }
    }
    
    if (savedStudent) {
      try {
        setStudent(JSON.parse(savedStudent));
      } catch (error) {
        console.error('Error parsing saved student:', error);
        localStorage.removeItem('student');
      }
    }
    
    setIsLoading(false);
  }, []);

  const saveTeacher = (teacherData: Teacher) => {
    setTeacher(teacherData);
    localStorage.setItem('teacher', JSON.stringify(teacherData));
  };

  const saveStudent = (studentData: Student) => {
    setStudent(studentData);
    localStorage.setItem('student', JSON.stringify(studentData));
  };

  const clearAuth = () => {
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
