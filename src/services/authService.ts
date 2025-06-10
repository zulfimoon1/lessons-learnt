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
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

// Secure logging for development
const logSecurely = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// Teacher login with simple name/password
export const teacherSimpleLoginService = async (name: string, password: string, school: string) => {
  try {
    logSecurely('teacherSimpleLoginService: Attempting login for teacher at school:', school);

    if (!name?.trim() || !password?.trim() || !school?.trim()) {
      return { error: 'All fields are required.' };
    }

    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('name', name.trim())
      .eq('school', school.trim());

    if (searchError) {
      logSecurely('teacherSimpleLoginService: Database error:', searchError.message);
      return { error: 'Unable to connect to the database. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      return { error: 'Invalid credentials. Please check your name, school, and try again.' };
    }

    // Check password for each matching teacher
    for (const teacher of teachers) {
      if (!teacher.password_hash) {
        continue;
      }
      
      try {
        logSecurely('teacherSimpleLoginService: Comparing password for teacher:', teacher.name);
        const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
        logSecurely('teacherSimpleLoginService: Password comparison result:', isValidPassword);
        
        if (isValidPassword) {
          logSecurely('teacherSimpleLoginService: Successful login for teacher ID:', teacher.id);
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
        }
      } catch (bcryptError) {
        logSecurely('teacherSimpleLoginService: Password comparison error:', bcryptError);
        continue;
      }
    }

    return { error: 'Invalid credentials. Please check your password and try again.' };
  } catch (error) {
    logSecurely('teacherSimpleLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Teacher login with email/password for new auth system
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

// Student login with simple name/password - FIXED VERSION
export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    logSecurely('studentSimpleLoginService: Attempting login for student:', fullName);

    if (!fullName?.trim() || !password?.trim()) {
      return { error: 'Name and password are required.' };
    }

    // Query for students with matching name (case-insensitive)
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

    // Check password for the first matching student
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

// Teacher signup with enhanced security
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
    logSecurely('teacherSignupService: Creating teacher account');

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
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.trim());

    if (checkError) {
      logSecurely('teacherSignupService: Database error during duplicate check:', checkError.message);
      return { error: 'Database error. Please try again.' };
    }

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'A teacher with this email already exists.' };
    }

    // Hash the password with higher cost for better security
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: passwordHash,
        role,
        specialization: specialization?.trim() || null,
        license_number: license_number?.trim() || null
      })
      .select()
      .single();

    if (insertError) {
      logSecurely('teacherSignupService: Database error during insertion:', insertError.message);
      return { error: 'Failed to create account. Please try again.' };
    }

    logSecurely('teacherSignupService: Teacher account created successfully');
    const teacherData: Teacher = {
      id: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      school: newTeacher.school,
      role: newTeacher.role as 'teacher' | 'admin' | 'doctor',
      specialization: newTeacher.specialization,
      license_number: newTeacher.license_number,
      is_available: newTeacher.is_available
    };

    return { teacher: teacherData };
  } catch (error) {
    logSecurely('teacherSignupService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student signup with enhanced security
export const studentSignupService = async (
  fullName: string,
  school: string,
  grade: string,
  password: string
) => {
  try {
    logSecurely('studentSignupService: Creating student account');

    // Enhanced input validation
    if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
      return { error: 'All fields are required.' };
    }

    // Password strength validation
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    // Check if student already exists
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim());

    if (checkError) {
      logSecurely('studentSignupService: Database error during duplicate check:', checkError.message);
      return { error: 'Database error. Please try again.' };
    }

    if (existingStudents && existingStudents.length > 0) {
      return { error: 'A student with this name already exists at this school.' };
    }

    // Hash the password with higher cost for better security
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new student
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: passwordHash
      })
      .select()
      .single();

    if (insertError) {
      logSecurely('studentSignupService: Database error during insertion:', insertError.message);
      return { error: 'Failed to create account. Please try again.' };
    }

    logSecurely('studentSignupService: Student account created successfully');
    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    return { student: studentData };
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
