
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface AuthContextType {
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  teacherLogin: (email: string, password: string) => Promise<{ error?: string; teacher?: Teacher }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const teacherLogin = async (email: string, password: string) => {
    try {
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !teachers) {
        return { error: 'Invalid email or password' };
      }

      if (teachers.password_hash !== password) {
        return { error: 'Invalid email or password' };
      }

      const teacherData = {
        id: teachers.id,
        name: teachers.name,
        email: teachers.email,
        school: teachers.school,
        role: teachers.role as 'teacher' | 'admin'
      };

      setTeacher(teacherData);
      localStorage.setItem('teacher', JSON.stringify(teacherData));
      return { teacher: teacherData };
    } catch (error) {
      return { error: 'Login failed. Please try again.' };
    }
  };

  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName)
        .eq('school', school)
        .eq('grade', grade)
        .single();

      if (error || !students) {
        return { error: 'Student not found. Please check your details or sign up.' };
      }

      if (students.password_hash !== password) {
        return { error: 'Invalid password' };
      }

      const studentData = {
        id: students.id,
        full_name: students.full_name,
        school: students.school,
        grade: students.grade
      };

      setStudent(studentData);
      localStorage.setItem('student', JSON.stringify(studentData));
      return { student: studentData };
    } catch (error) {
      return { error: 'Login failed. Please try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      const { data: newStudent, error } = await supabase
        .from('students')
        .insert({
          full_name: fullName,
          school: school,
          grade: grade,
          password_hash: password
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'A student with this name already exists in this school and grade.' };
        }
        return { error: 'Signup failed. Please try again.' };
      }

      const studentData = {
        id: newStudent.id,
        full_name: newStudent.full_name,
        school: newStudent.school,
        grade: newStudent.grade
      };

      setStudent(studentData);
      localStorage.setItem('student', JSON.stringify(studentData));
      return { student: studentData };
    } catch (error) {
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        student,
        isLoading,
        teacherLogin,
        studentLogin,
        studentSignup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
