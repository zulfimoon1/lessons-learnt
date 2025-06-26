
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresPasswordChange?: boolean;
}

class SecureAuthenticationService {
  async authenticateTeacher(email: string, password: string): Promise<AuthResult> {
    // Rate limiting
    const identifier = `teacher_login:${email}`;
    if (!enhancedSecurityValidationService.checkRateLimit(identifier)) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Teacher login rate limit exceeded for ${email}`,
        severity: 'medium'
      });
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    // Input validation
    const emailValidation = enhancedSecurityValidationService.validateInput(email, 'email');
    const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

    if (!emailValidation.isValid) {
      return { success: false, error: 'Invalid email format' };
    }

    try {
      // Use database function for secure authentication
      const { data, error } = await supabase
        .rpc('authenticate_teacher_working', {
          email_param: email.toLowerCase().trim(),
          password_param: password
        });

      if (error) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Teacher authentication error: ${error.message}`,
          severity: 'medium'
        });
        return { success: false, error: 'Authentication failed' };
      }

      if (!data || data.length === 0 || !data[0].password_valid) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Failed teacher login attempt for ${email}`,
          severity: 'low'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      const teacher = data[0];
      
      return {
        success: true,
        user: {
          id: teacher.teacher_id,
          name: teacher.teacher_name,
          email: teacher.teacher_email,
          school: teacher.teacher_school,
          role: teacher.teacher_role
        }
      };
    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    // Rate limiting
    const identifier = `student_login:${fullName}:${school}:${grade}`;
    if (!enhancedSecurityValidationService.checkRateLimit(identifier)) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Student login rate limit exceeded for ${fullName}`,
        severity: 'medium'
      });
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    // Input validation
    const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name');
    const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school');
    const gradeValidation = enhancedSecurityValidationService.validateInput(grade, 'grade');

    if (!nameValidation.isValid || !schoolValidation.isValid || !gradeValidation.isValid) {
      return { success: false, error: 'Invalid input provided' };
    }

    try {
      // Use database function for secure authentication
      const { data, error } = await supabase
        .rpc('authenticate_student_working', {
          name_param: enhancedSecurityValidationService.sanitizeInput(fullName),
          school_param: enhancedSecurityValidationService.sanitizeInput(school),
          grade_param: enhancedSecurityValidationService.sanitizeInput(grade),
          password_param: password
        });

      if (error) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Student authentication error: ${error.message}`,
          severity: 'medium'
        });
        return { success: false, error: 'Authentication failed' };
      }

      if (!data || data.length === 0 || !data[0].password_valid) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Failed student login attempt for ${fullName}`,
          severity: 'low'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      const student = data[0];
      
      return {
        success: true,
        user: {
          id: student.student_id,
          full_name: student.student_name,
          school: student.student_school,
          grade: student.student_grade
        }
      };
    } catch (error) {
      console.error('Student authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async registerTeacher(name: string, email: string, school: string, password: string, role: string = 'teacher'): Promise<AuthResult> {
    // Input validation
    const nameValidation = enhancedSecurityValidationService.validateInput(name, 'name');
    const emailValidation = enhancedSecurityValidationService.validateInput(email, 'email');
    const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school');
    const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

    if (!nameValidation.isValid || !emailValidation.isValid || !schoolValidation.isValid || !passwordValidation.isValid) {
      const allErrors = [
        ...nameValidation.errors,
        ...emailValidation.errors,
        ...schoolValidation.errors,
        ...passwordValidation.errors
      ];
      return { success: false, error: allErrors[0] || 'Invalid input provided' };
    }

    try {
      // Check if teacher already exists
      const { data: existingTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingTeacher) {
        return { success: false, error: 'A teacher with this email already exists' };
      }

      // Hash password (using simple hash for now - in production use bcrypt)
      const passwordHash = btoa(password + 'simple_salt_2024');

      // Insert new teacher
      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          name: enhancedSecurityValidationService.sanitizeInput(name),
          email: email.toLowerCase().trim(),
          school: enhancedSecurityValidationService.sanitizeInput(school),
          role: role,
          password_hash: passwordHash
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Registration failed' };
      }

      return {
        success: true,
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          school: data.school,
          role: data.role
        }
      };
    } catch (error) {
      console.error('Teacher registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async registerStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    // Input validation
    const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name');
    const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school');
    const gradeValidation = enhancedSecurityValidationService.validateInput(grade, 'grade');
    const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

    if (!nameValidation.isValid || !schoolValidation.isValid || !gradeValidation.isValid || !passwordValidation.isValid) {
      const allErrors = [
        ...nameValidation.errors,
        ...schoolValidation.errors,
        ...gradeValidation.errors,
        ...passwordValidation.errors
      ];
      return { success: false, error: allErrors[0] || 'Invalid input provided' };
    }

    try {
      // Check if student already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('full_name', fullName)
        .eq('school', school)
        .eq('grade', grade)
        .single();

      if (existingStudent) {
        return { success: false, error: 'A student with these details already exists' };
      }

      // Hash password (using simple hash for now - in production use bcrypt)
      const passwordHash = btoa(password + 'simple_salt_2024');

      // Insert new student
      const { data, error } = await supabase
        .from('students')
        .insert([{
          full_name: enhancedSecurityValidationService.sanitizeInput(fullName),
          school: enhancedSecurityValidationService.sanitizeInput(school),
          grade: enhancedSecurityValidationService.sanitizeInput(grade),
          password_hash: passwordHash
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Registration failed' };
      }

      return {
        success: true,
        user: {
          id: data.id,
          full_name: data.full_name,
          school: data.school,
          grade: data.grade
        }
      };
    } catch (error) {
      console.error('Student registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
