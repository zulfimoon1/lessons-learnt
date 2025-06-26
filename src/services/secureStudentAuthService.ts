import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

interface StudentAuthResult {
  student?: any;
  error?: string;
}

export const secureStudentLogin = async (fullName: string, school: string, grade: string, password: string): Promise<StudentAuthResult> => {
  try {
    console.log('secureStudentLogin: Attempting login with:', { fullName, school, grade });

    // Rate limiting check
    const rateLimitKey = `student_secure_login_${fullName}_${school}`;
    if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    // Input validation
    const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name');
    const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school');
    
    if (!nameValidation.isValid || !schoolValidation.isValid) {
      throw new Error('Invalid input provided');
    }

    // Debug: Check what students exist in database
    console.log('secureStudentLogin: Querying database for students...');
    const { data: allStudents, error: queryError } = await supabase
      .from('students')
      .select('id, full_name, school, grade')
      .limit(10);
    
    if (queryError) {
      console.error('secureStudentLogin: Error querying students:', queryError);
    } else {
      console.log('secureStudentLogin: Found students in database:', allStudents);
    }

    // Find student in database
    console.log('secureStudentLogin: Looking for exact match:', {
      full_name: fullName.trim(),
      school: school.trim(),
      grade: grade.trim()
    });

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    console.log('secureStudentLogin: Database query result:', { student, error });

    if (error || !student) {
      console.log('secureStudentLogin: No student found or error:', error);
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Failed student login attempt for: ${fullName} at ${school}`,
        severity: 'medium'
      });
      throw new Error('Invalid credentials');
    }

    console.log('secureStudentLogin: Found student:', {
      id: student.id,
      full_name: student.full_name,
      school: student.school,
      grade: student.grade
    });

    // Verify password using bcrypt
    console.log('secureStudentLogin: Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    console.log('secureStudentLogin: Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Invalid password for student: ${fullName}`,
        severity: 'medium'
      });
      throw new Error('Invalid credentials');
    }

    await enhancedSecurityValidationService.logSecurityEvent({
      type: 'session_error', // Using valid type
      userId: student.id,
      details: 'Successful secure student authentication',
      severity: 'low'
    });

    console.log('secureStudentLogin: Login successful');
    return { student };

  } catch (error) {
    console.error('Secure student login error:', error);
    throw error;
  }
};

export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string): Promise<StudentAuthResult> => {
  try {
    // Enhanced input validation
    const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name', { maxLength: 100 });
    const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school', { maxLength: 100 });
    const gradeValidation = enhancedSecurityValidationService.validateInput(grade, 'grade', { maxLength: 10 });
    const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }
    if (!schoolValidation.isValid) {
      throw new Error(schoolValidation.errors.join(', '));
    }
    if (!gradeValidation.isValid) {
      throw new Error(gradeValidation.errors.join(', '));
    }
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (existingStudent) {
      throw new Error('A student with this name already exists in this school and grade');
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) {
      console.error('Student registration error:', error);
      throw new Error('Registration failed');
    }

    await enhancedSecurityValidationService.logSecurityEvent({
      type: 'session_error', // Using valid type
      userId: newStudent.id,
      details: 'New secure student account created',
      severity: 'low'
    });

    return { student: newStudent };

  } catch (error) {
    console.error('Secure student signup error:', error);
    throw error;
  }
};
