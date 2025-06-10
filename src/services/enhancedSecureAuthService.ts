
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced secure authentication with additional security layers
export const enhancedSecureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Enhanced secure student login attempt');

    // Enhanced input validation with security checks
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

    // Check for suspicious input patterns
    const suspiciousCheck = validateInput.detectSuspiciousInput(`${fullName} ${school} ${grade}`);
    if (suspiciousCheck.isSuspicious) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Suspicious input detected: ${suspiciousCheck.reason}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid input detected' };
    }

    // Sanitize inputs
    const sanitizedName = validateInput.sanitizeText(fullName);
    const sanitizedSchool = validateInput.sanitizeText(school);
    const sanitizedGrade = validateInput.sanitizeText(grade);

    // Secure database query
    const { data: students, error } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', sanitizedName)
      .eq('school', sanitizedSchool)
      .eq('grade', sanitizedGrade)
      .limit(1);

    if (error || !students || students.length === 0) {
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced login failed: Student not found`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    
    // Verify password with enhanced security
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced login failed: Invalid password`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    logUserSecurityEvent({
      type: 'login_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Enhanced secure login successful`,
      userAgent: navigator.userAgent
    });

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
    console.error('Enhanced secure login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const enhancedSecureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Enhanced secure student signup attempt');

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

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = validateInput.sanitizeText(fullName);
    const sanitizedSchool = validateInput.sanitizeText(school);
    const sanitizedGrade = validateInput.sanitizeText(grade);

    // Check for existing student
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

    // Create new student
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
      console.error('Enhanced signup error:', error);
      return { error: 'Failed to create student account' };
    }

    logUserSecurityEvent({
      type: 'signup_success',
      userId: student.id,
      timestamp: new Date().toISOString(),
      details: `Enhanced secure signup successful`,
      userAgent: navigator.userAgent
    });

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
    console.error('Enhanced secure signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
