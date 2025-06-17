
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced client-side rate limiting with progressive delays
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const PROGRESSIVE_DELAY = [1000, 2000, 5000, 10000, 30000]; // Progressive delays

const checkClientRateLimit = (identifier: string): { allowed: boolean; message?: string; delay?: number } => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (attempts) {
    if (attempts.blocked && now - attempts.lastAttempt < LOCKOUT_DURATION) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60);
      return { 
        allowed: false, 
        message: `Account temporarily locked. Try again in ${remainingTime} minutes.` 
      };
    }
    
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(identifier);
    } else if (attempts.count > 0 && attempts.count <= PROGRESSIVE_DELAY.length) {
      const delay = PROGRESSIVE_DELAY[attempts.count - 1] || PROGRESSIVE_DELAY[PROGRESSIVE_DELAY.length - 1];
      return { allowed: true, delay };
    }
  }
  
  return { allowed: true };
};

const recordFailedAttempt = (identifier: string) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
  attempts.count++;
  attempts.lastAttempt = now;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blocked = true;
  }
  
  loginAttempts.set(identifier, attempts);
};

const clearFailedAttempts = (identifier: string) => {
  loginAttempts.delete(identifier);
};

export const secureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Enhanced input validation
    const nameValidation = validateInput.validateName(fullName);
    if (!nameValidation.isValid) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Invalid name input during login: ${nameValidation.message}`,
        userAgent: navigator.userAgent
      });
      return { error: nameValidation.message };
    }

    const schoolValidation = validateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Invalid school input during login: ${schoolValidation.message}`,
        userAgent: navigator.userAgent
      });
      return { error: schoolValidation.message };
    }

    const gradeValidation = validateInput.validateGrade(grade);
    if (!gradeValidation.isValid) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Invalid grade input during login: ${gradeValidation.message}`,
        userAgent: navigator.userAgent
      });
      return { error: gradeValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = validateInput.sanitizeText(fullName);
    const sanitizedSchool = validateInput.sanitizeText(school);
    const sanitizedGrade = validateInput.sanitizeText(grade);

    const identifier = `${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`;
    
    // Client-side rate limiting check
    const clientRateCheck = checkClientRateLimit(identifier);
    if (!clientRateCheck.allowed) {
      logUserSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        details: `Client-side rate limit exceeded: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: clientRateCheck.message };
    }

    // Apply progressive delay if needed
    if (clientRateCheck.delay) {
      await new Promise(resolve => setTimeout(resolve, clientRateCheck.delay));
    }

    console.log('Secure student login attempt:', { fullName: sanitizedName, school: sanitizedSchool, grade: sanitizedGrade });

    // Direct database query with proper validation
    const { data: students, error } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .limit(1);

    if (error || !students || students.length === 0) {
      console.log('Student not found');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Student not found: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Invalid password for student: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(identifier);

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Successful student login: ${sanitizedName}`,
      userAgent: navigator.userAgent
    });

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
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Student login system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Login failed. Please try again.' };
  }
};

export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Input validation
    const nameValidation = validateInput.validateName(fullName);
    if (!nameValidation.isValid) {
      return { error: nameValidation.message };
    }

    const schoolValidation = validateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.message };
    }

    const gradeValidation = validateInput.validateGrade(grade);
    if (!gradeValidation.isValid) {
      return { error: gradeValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = validateInput.sanitizeText(fullName);
    const sanitizedSchool = validateInput.sanitizeText(school);
    const sanitizedGrade = validateInput.sanitizeText(grade);

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.errors[0] || 'Password does not meet requirements' };
    }

    // Check if student already exists
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .limit(1);

    if (existingStudents && existingStudents.length > 0) {
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
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Student signup error: ${error.message}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Failed to create student account' };
    }

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Student account created: ${sanitizedName}`,
      userAgent: navigator.userAgent
    });

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
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Student signup system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Signup failed. Please try again.' };
  }
};
