
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';

// Rate limiting storage
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (identifier: string): { allowed: boolean; message?: string } => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (attempts) {
    if (now - attempts.lastAttempt < LOCKOUT_DURATION && attempts.count >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60);
      return { 
        allowed: false, 
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.` 
      };
    }
    
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(identifier);
    }
  }
  
  return { allowed: true };
};

const recordFailedAttempt = (identifier: string) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };
  attempts.count++;
  attempts.lastAttempt = now;
  loginAttempts.set(identifier, attempts);
};

const clearFailedAttempts = (identifier: string) => {
  loginAttempts.delete(identifier);
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'%;()&+]/g, '');
};

export const secureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Rate limiting check
    const rateCheck = checkRateLimit(`${fullName}-${school}-${grade}`);
    if (!rateCheck.allowed) {
      return { error: rateCheck.message };
    }

    // Input sanitization
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedSchool = sanitizeInput(school);
    const sanitizedGrade = sanitizeInput(grade);

    // Input validation
    if (!sanitizedName || !sanitizedSchool || !sanitizedGrade || !password) {
      return { error: 'All fields are required' };
    }

    console.log('Secure student login attempt:', { fullName: sanitizedName, school: sanitizedSchool, grade: sanitizedGrade });

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .single();

    if (error || !student) {
      console.log('Student not found');
      recordFailedAttempt(`${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`);
      return { error: 'Invalid credentials' };
    }

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password');
      recordFailedAttempt(`${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`);
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(`${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`);

    console.log('Secure student login successful');
    return { 
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        grade: student.grade,
        role: 'student'
      }
    };
  } catch (error) {
    console.error('Secure student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const secureTeacherLogin = async (email: string, password: string) => {
  try {
    // Rate limiting check
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return { error: rateCheck.message };
    }

    // Input sanitization and validation
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    if (!sanitizedEmail || !password) {
      return { error: 'Email and password are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: 'Invalid email format' };
    }

    console.log('Secure teacher login attempt:', sanitizedEmail);

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !teacher) {
      console.log('Teacher not found');
      recordFailedAttempt(sanitizedEmail);
      return { error: 'Invalid credentials' };
    }

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password');
      recordFailedAttempt(sanitizedEmail);
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(sanitizedEmail);

    console.log('Secure teacher login successful');
    return { 
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      }
    };
  } catch (error) {
    console.error('Secure teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Input sanitization
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedSchool = sanitizeInput(school);
    const sanitizedGrade = sanitizeInput(grade);

    // Input validation
    if (!sanitizedName || !sanitizedSchool || !sanitizedGrade || !password) {
      return { error: 'All fields are required' };
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.message };
    }

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .single();

    if (existingStudent) {
      return { error: 'Student already exists with these details' };
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        full_name: sanitizedName,
        school: sanitizedSchool,
        grade: sanitizedGrade,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Student signup error:', error);
      return { error: 'Failed to create student account' };
    }

    console.log('Secure student signup successful');
    return { 
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        grade: student.grade,
        role: 'student'
      }
    };
  } catch (error) {
    console.error('Secure student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    // Input sanitization
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedSchool = sanitizeInput(school);

    // Input validation
    if (!sanitizedName || !sanitizedEmail || !sanitizedSchool || !password) {
      return { error: 'All fields are required' };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: 'Invalid email format' };
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.message };
    }

    // Role validation
    const validRoles = ['teacher', 'admin', 'doctor'];
    if (!validRoles.includes(role)) {
      return { error: 'Invalid role specified' };
    }

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingTeacher) {
      return { error: 'Teacher already exists with this email' };
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        name: sanitizedName,
        email: sanitizedEmail,
        school: sanitizedSchool,
        password_hash: hashedPassword,
        role: role
      }])
      .select()
      .single();

    if (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Failed to create teacher account' };
    }

    console.log('Secure teacher signup successful');
    return { 
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      }
    };
  } catch (error) {
    console.error('Secure teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
