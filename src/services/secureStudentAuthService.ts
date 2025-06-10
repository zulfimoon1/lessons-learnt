
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced rate limiting with server-side validation
const checkServerSideRateLimit = async (identifier: string): Promise<{ allowed: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', { 
      p_identifier: identifier 
    });
    
    if (error) {
      console.warn('Rate limit check failed:', error);
      return { allowed: true }; // Fail open for availability
    }
    
    return data || { allowed: true };
  } catch (error) {
    console.warn('Rate limit service unavailable:', error);
    return { allowed: true }; // Fail open for availability
  }
};

// Client-side rate limiting as backup (enhanced with progressive delays)
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
    
    // Enhanced rate limiting check (both server and client-side)
    const serverRateCheck = await checkServerSideRateLimit(identifier);
    if (!serverRateCheck.allowed) {
      logUserSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        details: `Server-side rate limit exceeded: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: serverRateCheck.message };
    }

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

    // Use the secure authentication function instead of direct table access
    const { data: authResult, error } = await supabase.rpc('secure_student_auth', {
      p_full_name: sanitizedName,
      p_school: sanitizedSchool,
      p_grade: sanitizedGrade,
      p_password: password
    });

    if (error || !authResult || authResult.length === 0) {
      console.log('Student authentication failed');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Failed student login attempt: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    const student = authResult[0];
    if (!student.auth_success) {
      console.log('Invalid credentials');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Invalid credentials for student: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(identifier);

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.student_id,
      timestamp: new Date().toISOString(),
      details: `Successful student login: ${sanitizedName}`,
      userAgent: navigator.userAgent
    });

    console.log('Secure student login successful');
    return { 
      user: {
        id: student.student_id,
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
      return { error: passwordValidation.message };
    }

    // Check if student already exists using secure function
    const { data: existingCheck } = await supabase.rpc('secure_student_auth', {
      p_full_name: sanitizedName,
      p_school: sanitizedSchool,
      p_grade: sanitizedGrade,
      p_password: 'dummy_password_for_existence_check'
    });

    if (existingCheck && existingCheck.length > 0 && existingCheck[0].student_id) {
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
