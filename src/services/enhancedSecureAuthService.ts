
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { enhancedValidateInput } from './enhancedInputValidation';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced secure authentication with additional security layers
export const enhancedSecureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Enhanced secure student login attempt');

    // Enhanced input validation with security checks
    const nameValidation = enhancedValidateInput.validateName(fullName);
    if (!nameValidation.isValid) {
      return { error: nameValidation.message };
    }

    const schoolValidation = enhancedValidateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.message };
    }

    const gradeValidation = enhancedValidateInput.validateGrade(grade);
    if (!gradeValidation.isValid) {
      return { error: gradeValidation.message };
    }

    // Check for suspicious input patterns
    const suspiciousCheck = enhancedValidateInput.detectAdvancedThreats(`${fullName} ${school} ${grade}`);
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
    const sanitizedName = enhancedValidateInput.sanitizeText(fullName);
    const sanitizedSchool = enhancedValidateInput.sanitizeText(school);
    const sanitizedGrade = enhancedValidateInput.sanitizeText(grade);

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
    const nameValidation = enhancedValidateInput.validateName(fullName);
    if (!nameValidation.isValid) {
      return { error: nameValidation.message };
    }

    const schoolValidation = enhancedValidateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.message };
    }

    const gradeValidation = enhancedValidateInput.validateGrade(grade);
    if (!gradeValidation.isValid) {
      return { error: gradeValidation.message };
    }

    // Enhanced password strength validation
    const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = enhancedValidateInput.sanitizeText(fullName);
    const sanitizedSchool = enhancedValidateInput.sanitizeText(school);
    const sanitizedGrade = enhancedValidateInput.sanitizeText(grade);

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
      type: 'login_success',
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

// Enhanced secure teacher authentication
export const enhancedSecureTeacherLogin = async (email: string, password: string) => {
  try {
    console.log('Enhanced secure teacher login attempt');

    // Enhanced input validation
    const emailValidation = enhancedValidateInput.validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: emailValidation.message };
    }

    // Check for suspicious input patterns
    const suspiciousCheck = enhancedValidateInput.detectAdvancedThreats(email);
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
    const sanitizedEmail = enhancedValidateInput.sanitizeText(email.toLowerCase());

    // Secure database query
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', sanitizedEmail)
      .limit(1);

    if (error || !teachers || teachers.length === 0) {
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher login failed: Teacher not found`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    const teacher = teachers[0];
    
    // Verify password with enhanced security
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    if (!isPasswordValid) {
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher login failed: Invalid password`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    logUserSecurityEvent({
      type: 'login_success',
      userId: teacher.id,
      timestamp: new Date().toISOString(),
      details: `Enhanced secure teacher login successful`,
      userAgent: navigator.userAgent
    });

    return { 
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      }
    };
  } catch (error) {
    console.error('Enhanced secure teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const enhancedSecureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('Enhanced secure teacher signup attempt');

    // Enhanced input validation
    const nameValidation = enhancedValidateInput.validateName(name);
    if (!nameValidation.isValid) {
      return { error: nameValidation.message };
    }

    const emailValidation = enhancedValidateInput.validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: emailValidation.message };
    }

    const schoolValidation = enhancedValidateInput.validateSchool(school);
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.message };
    }

    // Enhanced password strength validation
    const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.message };
    }

    // Sanitize inputs
    const sanitizedName = enhancedValidateInput.sanitizeText(name);
    const sanitizedEmail = enhancedValidateInput.sanitizeText(email.toLowerCase());
    const sanitizedSchool = enhancedValidateInput.sanitizeText(school);
    const sanitizedRole = enhancedValidateInput.sanitizeText(role);

    // Check for existing teacher
    const { data: existingTeachers } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', sanitizedEmail)
      .limit(1);

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'Teacher already exists with this email' };
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Create new teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        name: sanitizedName,
        email: sanitizedEmail,
        school: sanitizedSchool,
        role: sanitizedRole,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Enhanced teacher signup error:', error);
      return { error: 'Failed to create teacher account' };
    }

    logUserSecurityEvent({
      type: 'login_success',
      userId: teacher.id,
      timestamp: new Date().toISOString(),
      details: `Enhanced secure teacher signup successful`,
      userAgent: navigator.userAgent
    });

    return { 
      teacher: {
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
