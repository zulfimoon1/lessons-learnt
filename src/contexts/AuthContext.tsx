
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  school_name: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  student: Student | null;
  schoolAdmin: SchoolAdmin | null;
  isLoading: boolean;
  teacherLogin: (email: string, password: string) => Promise<{ error?: string; teacher?: Teacher }>;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string; student?: Student }>;
  schoolAdminLogin: (email: string, password: string) => Promise<{ error?: string; schoolAdmin?: SchoolAdmin }>;
  schoolAdminSignup: (email: string, password: string, name: string, schoolName: string) => Promise<{ error?: string; schoolAdmin?: SchoolAdmin }>;
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
  const [schoolAdmin, setSchoolAdmin] = useState<SchoolAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const teacherData = localStorage.getItem('teacher');
    const studentData = localStorage.getItem('student');
    const schoolAdminData = localStorage.getItem('schoolAdmin');
    
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
    } else if (studentData) {
      setStudent(JSON.parse(studentData));
    } else if (schoolAdminData) {
      setSchoolAdmin(JSON.parse(schoolAdminData));
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
        email: teachers.email
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

  const schoolAdminLogin = async (email: string, password: string) => {
    try {
      const { data: admins, error } = await supabase
        .from('school_admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !admins) {
        return { error: 'Invalid email or password' };
      }

      if (admins.password_hash !== password) {
        return { error: 'Invalid email or password' };
      }

      const adminData = {
        id: admins.id,
        name: admins.name,
        email: admins.email,
        school_name: admins.school_name
      };

      setSchoolAdmin(adminData);
      localStorage.setItem('schoolAdmin', JSON.stringify(adminData));
      return { schoolAdmin: adminData };
    } catch (error) {
      return { error: 'Login failed. Please try again.' };
    }
  };

  const schoolAdminSignup = async (email: string, password: string, name: string, schoolName: string) => {
    try {
      const { data: newAdmin, error } = await supabase
        .from('school_admins')
        .insert({
          email: email,
          password_hash: password,
          name: name,
          school_name: schoolName
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'An admin with this email already exists.' };
        }
        return { error: 'Signup failed. Please try again.' };
      }

      const adminData = {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        school_name: newAdmin.school_name
      };

      setSchoolAdmin(adminData);
      localStorage.setItem('schoolAdmin', JSON.stringify(adminData));
      return { schoolAdmin: adminData };
    } catch (error) {
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    setStudent(null);
    setSchoolAdmin(null);
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
    localStorage.removeItem('schoolAdmin');
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        student,
        schoolAdmin,
        isLoading,
        teacherLogin,
        studentLogin,
        studentSignup,
        schoolAdminLogin,
        schoolAdminSignup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
