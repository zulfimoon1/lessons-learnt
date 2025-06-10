import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { sessionService } from './secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Rate limiting storage with enhanced security
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const PROGRESSIVE_DELAY = [1000, 2000, 5000, 10000, 30000]; // Progressive delays

const checkRateLimit = (identifier: string): { allowed: boolean; message?: string; delay?: number } => {
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

export const enhancedSecureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Enhanced input validation
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

    const identifier = `${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`;
    
    // Enhanced rate limiting check
    const rateCheck = checkRateLimit(identifier);
    if (!rateCheck.allowed) {
      logUserSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        details: `Student login rate limit exceeded: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: rateCheck.message };
    }

    // Apply progressive delay if needed
    if (rateCheck.delay) {
      await new Promise(resolve => setTimeout(resolve, rateCheck.delay));
    }

    console.log('Enhanced secure student login attempt:', { fullName: sanitizedName, school: sanitizedSchool, grade: sanitizedGrade });

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .single();

    if (error || !student) {
      console.log('Student not found');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Failed student login attempt: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password');
      recordFailedAttempt(identifier);
      logUserSecurityEvent({
        type: 'login_failed',
        userId: student.id,
        timestamp: new Date().toISOString(),
        details: `Invalid password for student: ${sanitizedName}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts and create secure session
    clearFailedAttempts(identifier);
    await sessionService.createSession(student.id, 'student', student.school);
    await sessionService.cleanupExpiredSessions(student.id);

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Successful student login: ${sanitizedName}`,
      userAgent: navigator.userAgent
    });

    console.log('Enhanced secure student login successful');
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
    console.error('Enhanced secure student login error:', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Student login system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Login failed. Please try again.' };
  }
};

export const enhancedSecureTeacherLogin = async (email: string, password: string) => {
  try {
    // Input validation and sanitization
    const sanitizedEmail = validateInput.sanitizeText(email).toLowerCase();
    
    if (!sanitizedEmail || !password) {
      return { error: 'Email and password are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: 'Invalid email format' };
    }

    // Enhanced rate limiting check
    const rateCheck = checkRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      logUserSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        details: `Teacher login rate limit exceeded: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: rateCheck.message };
    }

    // Apply progressive delay if needed
    if (rateCheck.delay) {
      await new Promise(resolve => setTimeout(resolve, rateCheck.delay));
    }

    console.log('Enhanced secure teacher login attempt:', sanitizedEmail);

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !teacher) {
      console.log('Teacher not found');
      recordFailedAttempt(sanitizedEmail);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Failed teacher login attempt: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Verify password securely
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password');
      recordFailedAttempt(sanitizedEmail);
      logUserSecurityEvent({
        type: 'login_failed',
        userId: teacher.id,
        timestamp: new Date().toISOString(),
        details: `Invalid password for teacher: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts and create secure session
    clearFailedAttempts(sanitizedEmail);
    await sessionService.createSession(teacher.id, 'teacher', teacher.school);
    await sessionService.cleanupExpiredSessions(teacher.id);

    logUserSecurityEvent({
      type: 'login_success',
      userId: teacher.id,
      timestamp: new Date().toISOString(),
      details: `Successful teacher login: ${sanitizedEmail}`,
      userAgent: navigator.userAgent
    });

    console.log('Enhanced secure teacher login successful');
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
    console.error('Enhanced secure teacher login error:', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Teacher login system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Login failed. Please try again.' };
  }
};

export const enhancedSecureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
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

    // Create session for new user
    await sessionService.createSession(student.id, 'student', student.school);

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Student account created: ${sanitizedName}`,
      userAgent: navigator.userAgent
    });

    console.log('Enhanced secure student signup successful');
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
    console.error('Enhanced secure student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const enhancedSecureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    // Input validation
    const nameValidation = validateInput.validateName(name);
    if (!nameValidation.isValid) {
      return { error: nameValidation.message };
    }

    const schoolValidation = validateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = validateInput.sanitizeText(name);
    const sanitizedEmail = validateInput.sanitizeText(email).toLowerCase();
    const sanitizedSchool = validateInput.sanitizeText(school);

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

    // Create session for new user
    await sessionService.createSession(teacher.id, 'teacher', teacher.school);

    logUserSecurityEvent({
      type: 'login_success',
      userId: teacher.id,
      timestamp: new Date().toISOString(),
      details: `Teacher account created: ${sanitizedEmail}`,
      userAgent: navigator.userAgent
    });

    console.log('Enhanced secure teacher signup successful');
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
    console.error('Enhanced secure teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
