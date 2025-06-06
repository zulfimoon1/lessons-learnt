
import { useState, useEffect } from 'react';
import { Teacher, Student } from '@/types/auth';

export const useAuthStorage = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const teacherData = localStorage.getItem('teacher');
    const studentData = localStorage.getItem('student');
    
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
    } else if (studentData) {
      setStudent(JSON.parse(studentData));
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
