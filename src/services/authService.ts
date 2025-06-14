import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { Teacher, Student } from '@/types/auth';

export interface User {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  school: string;
  grade?: string;
  role: string;
}

export interface AuthResponse {
  user?: User;
  error?: string;
}

// Session management
export const logout = () => {
  localStorage.removeItem('user');
  console.log('User logged out');
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Password utilities
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

// Secure logging for development
const logSecurely = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// Teacher login with email/password
export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    logSecurely('teacherEmailLoginService: Attempting login for teacher:', email);

    if (!email?.trim() || !password?.trim()) {
      return { error: 'Email and password are required.' };
    }

    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    if (searchError) {
      logSecurely('teacherEmailLoginService: Database error:', searchError.message);
      return { error: 'Unable to connect to the database. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      return { error: 'Invalid credentials. Please check your email and try again.' };
    }

    const teacher = teachers[0];
    if (!teacher.password_hash) {
      return { error: 'Account setup incomplete. Please contact your administrator.' };
    }

    try {
      logSecurely('teacherEmailLoginService: Comparing password for teacher:', teacher.email);
      const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
      logSecurely('teacherEmailLoginService: Password comparison result:', isValidPassword);
      
      if (isValidPassword) {
        logSecurely('teacherEmailLoginService: Successful login for teacher ID:', teacher.id);
        const teacherData: Teacher = {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          school: teacher.school,
          role: teacher.role as 'teacher' | 'admin' | 'doctor',
          specialization: teacher.specialization,
          license_number: teacher.license_number,
          is_available: teacher.is_available
        };
        return { teacher: teacherData };
      } else {
        return { error: 'Invalid credentials. Please check your password and try again.' };
      }
    } catch (bcryptError) {
      logSecurely('teacherEmailLoginService: Password comparison error:', bcryptError);
      return { error: 'Authentication failed. Please try again.' };
    }
  } catch (error) {
    logSecurely('teacherEmailLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student login with simple name/password
export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    logSecurely('studentSimpleLoginService: Attempting login for student:', fullName);

    if (!fullName?.trim() || !password?.trim()) {
      return { error: 'Name and password are required.' };
    }

    // Query for students with exact name match (case-insensitive)
    const { data: students, error: searchError } = await supabase
      .from('students')
      .select('*')
      .ilike('full_name', fullName.trim());
    
    logSecurely('studentSimpleLoginService: Query result:', { 
      studentsFound: students?.length || 0, 
      error: searchError?.message 
    });

    if (searchError) {
      logSecurely('studentSimpleLoginService: Database error:', searchError.message);
      return { error: 'Unable to connect to the database. Please try again.' };
    }

    if (!students || students.length === 0) {
      logSecurely('studentSimpleLoginService: No students found with name:', fullName.trim());
      return { error: 'Invalid credentials. Please check your name and try again.' };
    }

    // Check password for the matching student
    const student = students[0];
    logSecurely('studentSimpleLoginService: Found student, checking password for:', student.full_name);
    
    if (!student.password_hash) {
      return { error: 'Account setup incomplete. Please contact your teacher.' };
    }

    try {
      logSecurely('studentSimpleLoginService: Attempting password comparison');
      const isValidPassword = await bcrypt.compare(password, student.password_hash);
      logSecurely('studentSimpleLoginService: Password comparison result:', isValidPassword);
      
      if (isValidPassword) {
        logSecurely('studentSimpleLoginService: Successful login for student ID:', student.id);
        const studentData: Student = {
          id: student.id,
          full_name: student.full_name,
          school: student.school,
          grade: student.grade
        };
        return { student: studentData };
      } else {
        logSecurely('studentSimpleLoginService: Password did not match');
        return { error: 'Invalid credentials. Please check your password and try again.' };
      }
    } catch (bcryptError) {
      logSecurely('studentSimpleLoginService: Password comparison error:', bcryptError);
      return { error: 'Authentication failed. Please try again.' };
    }
  } catch (error) {
    logSecurely('studentSimpleLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Teacher signup using edge function to bypass RLS
export const teacherSignupService = async (
  name: string,
  email: string,
  school: string,
  password: string,
  role: 'teacher' | 'admin' | 'doctor' = 'teacher',
  specialization?: string,
  license_number?: string
) => {
  try {
    logSecurely('teacherSignupService: Creating teacher account for:', email);

    // Enhanced input validation
    if (!name?.trim() || !email?.trim() || !school?.trim() || !password?.trim()) {
      return { error: 'All required fields must be filled.' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { error: 'Please enter a valid email address.' };
    }

    // Password strength validation
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Call edge function for account creation
    const { data, error } = await supabase.functions.invoke('create-teacher-account', {
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: passwordHash,
        role: role,
        specialization: specialization?.trim() || null,
        license_number: license_number?.trim() || null
      }
    });

    if (error) {
      logSecurely('teacherSignupService: Edge function error:', error);
      return { error: 'Failed to create account. Please try again.' };
    }

    if (data?.error) {
      logSecurely('teacherSignupService: Server error:', data.error);
      return { error: data.error };
    }

    if (data?.teacher) {
      logSecurely('teacherSignupService: Teacher account created successfully:', data.teacher.id);
      const teacherData: Teacher = {
        id: data.teacher.id,
        name: data.teacher.name,
        email: data.teacher.email,
        school: data.teacher.school,
        role: data.teacher.role as 'teacher' | 'admin' | 'doctor',
        specialization: data.teacher.specialization,
        license_number: data.teacher.license_number,
        is_available: data.teacher.is_available
      };
      return { teacher: teacherData };
    }

    return { error: 'Failed to create account. Please try again.' };
  } catch (error) {
    logSecurely('teacherSignupService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student signup using edge function
export const studentSignupService = async (
  fullName: string,
  school: string,
  grade: string,
  password: string
) => {
  try {
    logSecurely('studentSignupService: Creating student account for:', fullName);

    // Enhanced input validation
    if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
      return { error: 'All fields are required.' };
    }

    // Password strength validation
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Call edge function for account creation
    const { data, error } = await supabase.functions.invoke('create-student-account', {
      body: {
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: passwordHash
      }
    });

    if (error) {
      logSecurely('studentSignupService: Edge function error:', error);
      return { error: 'Failed to create account. Please try again.' };
    }

    if (data?.error) {
      logSecurely('studentSignupService: Server error:', data.error);
      return { error: data.error };
    }

    if (data?.student) {
      logSecurely('studentSignupService: Student account created successfully:', data.student.id);
      const studentData: Student = {
        id: data.student.id,
        full_name: data.student.full_name,
        school: data.student.school,
        grade: data.student.grade
      };
      return { student: studentData };
    }

    return { error: 'Failed to create account. Please try again.' };
  } catch (error) {
    logSecurely('studentSignupService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Main authentication functions
export const studentLogin = async (fullName: string, school: string, grade: string, password: string): Promise<AuthResponse> => {
  const result = await studentSimpleLoginService(fullName, password);
  if (result.student) {
    return { user: {
      id: result.student.id,
      fullName: result.student.full_name,
      school: result.student.school,
      grade: result.student.grade,
      role: 'student'
    }};
  }
  return { error: result.error };
};

export const studentSignup = async (fullName: string, school: string, grade: string, password: string): Promise<AuthResponse> => {
  const result = await studentSignupService(fullName, school, grade, password);
  if (result.student) {
    return { user: {
      id: result.student.id,
      fullName: result.student.full_name,
      school: result.student.school,
      grade: result.student.grade,
      role: 'student'
    }};
  }
  return { error: result.error };
};

export const teacherLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const result = await teacherEmailLoginService(email, password);
  if (result.teacher) {
    return { user: {
      id: result.teacher.id,
      name: result.teacher.name,
      email: result.teacher.email,
      school: result.teacher.school,
      role: result.teacher.role
    }};
  }
  return { error: result.error };
};

export const teacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher'): Promise<AuthResponse> => {
  const result = await teacherSignupService(name, email, school, password, role as 'teacher' | 'admin' | 'doctor');
  if (result.teacher) {
    return { user: {
      id: result.teacher.id,
      name: result.teacher.name,
      email: result.teacher.email,
      school: result.teacher.school,
      role: result.teacher.role
    }};
  }
  return { error: result.error };
};
