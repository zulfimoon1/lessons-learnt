
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, AuthContextType } from '@/types/auth';
import { teacherEmailLoginService, studentSimpleLoginService, teacherSignupService, studentSignupService } from '@/services/authService';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log('AuthContext: Starting initialization...');
    
    // Simple initialization - just mark as complete
    setIsLoading(false);
    console.log('AuthContext: Initialization complete');
  }, []);

  // Direct login without session complexity
  const teacherLogin = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string,
    role: 'teacher' | 'admin' | 'doctor' = 'teacher'
  ): Promise<{ teacher?: Teacher; error?: string }> => {
    console.log('AuthContext: Teacher login attempt');

    try {
      const result = name && school 
        ? await teacherSignupService(name, email, school, password, role)
        : await teacherEmailLoginService(email, password);

      if (result.error) {
        console.log('AuthContext: Login failed:', result.error);
        return { error: result.error };
      }
      
      if (result.teacher) {
        const teacher: Teacher = {
          ...result.teacher,
          role: result.teacher.role as 'teacher' | 'admin' | 'doctor'
        };
        
        setTeacher(teacher);
        setStudent(null); // Clear student state
        
        console.log('AuthContext: Teacher login successful:', teacher.name);
        return { teacher };
      }

      return { error: 'Unknown error occurred' };
    } catch (error) {
      console.error('AuthContext: Teacher login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Direct student login
  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student login attempt');

    try {
      const result = await studentSimpleLoginService(fullName, password);

      if (result.error) {
        console.log('AuthContext: Student login failed:', result.error);
        return { error: result.error };
      }
      
      if (result.student) {
        const student: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(student);
        setTeacher(null); // Clear teacher state
        
        console.log('AuthContext: Student login successful:', student.full_name);
        return { student };
      }

      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Student login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  // Student signup
  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    console.log('AuthContext: Student signup attempt');
    
    try {
      const result = await studentSignupService(fullName, school, grade, password);

      if (result.error) {
        console.log('AuthContext: Student signup failed:', result.error);
        return { error: result.error };
      }
      
      if (result.student) {
        const student: Student = {
          id: result.student.id,
          full_name: result.student.full_name,
          school: result.student.school,
          grade: result.student.grade
        };
        
        setStudent(student);
        setTeacher(null); // Clear teacher state
        
        console.log('AuthContext: Student signup successful:', student.full_name);
        return { student };
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('AuthContext: Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  // Simple logout
  const logout = async () => {
    console.log('AuthContext: Logout initiated');
    
    // Clear auth state
    setTeacher(null);
    setStudent(null);
  };

  const contextValue: AuthContextType = {
    teacher,
    student,
    isLoading,
    teacherLogin,
    studentLogin,
    studentSignup,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
