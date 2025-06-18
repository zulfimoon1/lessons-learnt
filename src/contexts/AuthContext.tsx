
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: 'teacher' | 'admin' | 'doctor';
  specialization?: string;
  license_number?: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  created_at: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  student: Student | null;
  isLoading: boolean;
  teacherLogin: (email: string, password: string, name?: string, school?: string, role?: string) => Promise<{ teacher?: Teacher; error?: string }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ student?: Student; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const checkAuth = () => {
      try {
        const storedTeacher = localStorage.getItem('teacher');
        const storedStudent = localStorage.getItem('student');
        
        if (storedTeacher) {
          setTeacher(JSON.parse(storedTeacher));
        } else if (storedStudent) {
          setStudent(JSON.parse(storedStudent));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('teacher');
        localStorage.removeItem('student');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const teacherLogin = async (email: string, password: string, name?: string, school?: string, role?: string): Promise<{ teacher?: Teacher; error?: string }> => {
    try {
      const { data: teachers } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email);

      if (!teachers || teachers.length === 0) {
        if (name && school && role) {
          // Create new teacher
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash(password, 12);
          
          const { data: newTeacher, error } = await supabase
            .from('teachers')
            .insert([{
              name,
              email,
              school,
              role: role as 'teacher' | 'admin' | 'doctor',
              password_hash: hashedPassword
            }])
            .select()
            .single();

          if (error) {
            return { error: error.message };
          }

          setTeacher(newTeacher);
          localStorage.setItem('teacher', JSON.stringify(newTeacher));
          return { teacher: newTeacher };
        } else {
          return { error: 'Teacher not found' };
        }
      }

      const teacher = teachers[0];
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, teacher.password_hash);

      if (!isValidPassword) {
        return { error: 'Invalid password' };
      }

      setTeacher(teacher);
      localStorage.setItem('teacher', JSON.stringify(teacher));
      return { teacher };
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const studentLogin = async (fullName: string, school: string, grade: string, password: string): Promise<{ student?: Student; error?: string }> => {
    try {
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName)
        .eq('school', school)
        .eq('grade', grade);

      if (!students || students.length === 0) {
        return { error: 'Student not found' };
      }

      const student = students[0];
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, student.password_hash);

      if (!isValidPassword) {
        return { error: 'Invalid password' };
      }

      setStudent(student);
      localStorage.setItem('student', JSON.stringify(student));
      return { student };
    } catch (error) {
      return { error: 'Login failed' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string): Promise<{ student?: Student; error?: string }> => {
    try {
      // Check if student already exists
      const { data: existingStudents } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName)
        .eq('school', school)
        .eq('grade', grade);

      if (existingStudents && existingStudents.length > 0) {
        return { error: 'Student already exists' };
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert([{
          full_name: fullName,
          school,
          grade,
          password_hash: hashedPassword
        }])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setStudent(newStudent);
      localStorage.setItem('student', JSON.stringify(newStudent));
      return { student: newStudent };
    } catch (error) {
      return { error: 'Signup failed' };
    }
  };

  const logout = async (): Promise<void> => {
    setTeacher(null);
    setStudent(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
  };

  return (
    <AuthContext.Provider value={{
      teacher,
      student,
      isLoading,
      teacherLogin,
      studentLogin,
      studentSignup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
