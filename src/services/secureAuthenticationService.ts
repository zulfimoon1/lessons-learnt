
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';
import bcrypt from 'bcryptjs';

interface AuthenticationResult {
  teacher?: any;
  student?: any;
  error?: string;
}

class SecureAuthenticationService {
  private readonly SALT_ROUNDS = 12;

  async authenticateTeacher(email: string, password: string): Promise<AuthenticationResult> {
    try {
      // Rate limiting check
      const rateLimitKey = `teacher_login_${email}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Input validation
      const emailValidation = enhancedSecurityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { error: 'Invalid email format' };
      }

      // Use the database function for authentication
      const { data, error } = await supabase.rpc('authenticate_teacher_working', {
        email_param: email.toLowerCase().trim(),
        password_param: password
      });

      if (error) {
        console.error('Teacher authentication error:', error);
        return { error: 'Authentication failed' };
      }

      if (!data || data.length === 0 || !data[0].password_valid) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Failed teacher login attempt for email: ${email}`,
          severity: 'medium'
        });
        return { error: 'Invalid credentials' };
      }

      const teacherData = data[0];
      
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'session_error', // Using valid type from interface
        userId: teacherData.teacher_id,
        details: 'Successful teacher authentication',
        severity: 'low'
      });

      return {
        teacher: {
          id: teacherData.teacher_id,
          name: teacherData.teacher_name,
          email: teacherData.teacher_email,
          school: teacherData.teacher_school,
          role: teacherData.teacher_role
        }
      };

    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { error: 'Authentication service unavailable' };
    }
  }

  async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthenticationResult> {
    try {
      // Rate limiting check
      const rateLimitKey = `student_login_${fullName}_${school}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Input validation
      const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name');
      const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school');
      
      if (!nameValidation.isValid || !schoolValidation.isValid) {
        return { error: 'Invalid input provided' };
      }

      // Use the database function for authentication
      const { data, error } = await supabase.rpc('authenticate_student_working', {
        name_param: fullName.trim(),
        school_param: school.trim(),
        grade_param: grade.trim(),
        password_param: password
      });

      if (error) {
        console.error('Student authentication error:', error);
        return { error: 'Authentication failed' };
      }

      if (!data || data.length === 0 || !data[0].password_valid) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Failed student login attempt for: ${fullName} at ${school}`,
          severity: 'medium'
        });
        return { error: 'Invalid credentials' };
      }

      const studentData = data[0];
      
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'session_error', // Using valid type from interface
        userId: studentData.student_id,
        details: 'Successful student authentication',
        severity: 'low'
      });

      return {
        student: {
          id: studentData.student_id,
          full_name: studentData.student_name,
          school: studentData.student_school,
          grade: studentData.student_grade
        }
      };

    } catch (error) {
      console.error('Student authentication error:', error);
      return { error: 'Authentication service unavailable' };
    }
  }

  async registerTeacher(name: string, email: string, school: string, password: string, role: string = 'teacher'): Promise<AuthenticationResult> {
    try {
      // Enhanced input validation
      const nameValidation = enhancedSecurityValidationService.validateInput(name, 'name', { maxLength: 100 });
      const emailValidation = enhancedSecurityValidationService.validateInput(email, 'email');
      const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school', { maxLength: 100 });
      const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

      if (!nameValidation.isValid) {
        return { error: nameValidation.errors.join(', ') };
      }
      if (!emailValidation.isValid) {
        return { error: emailValidation.errors.join(', ') };
      }
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.errors.join(', ') };
      }
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors.join(', ') };
      }

      // Check if teacher already exists
      const { data: existingTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingTeacher) {
        return { error: 'An account with this email already exists' };
      }

      // Hash password securely
      const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Insert new teacher
      const { data: newTeacher, error } = await supabase
        .from('teachers')
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          school: school.trim(),
          password_hash: passwordHash,
          role: role
        })
        .select()
        .single();

      if (error) {
        console.error('Teacher registration error:', error);
        return { error: 'Registration failed' };
      }

      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'session_error', // Using valid type
        userId: newTeacher.id,
        details: 'New teacher account created',
        severity: 'low'
      });

      return { teacher: newTeacher };

    } catch (error) {
      console.error('Teacher registration error:', error);
      return { error: 'Registration service unavailable' };
    }
  }

  async registerStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthenticationResult> {
    try {
      // Enhanced input validation
      const nameValidation = enhancedSecurityValidationService.validateInput(fullName, 'name', { maxLength: 100 });
      const schoolValidation = enhancedSecurityValidationService.validateInput(school, 'school', { maxLength: 100 });
      const gradeValidation = enhancedSecurityValidationService.validateInput(grade, 'grade', { maxLength: 10 });
      const passwordValidation = enhancedSecurityValidationService.validatePassword(password);

      if (!nameValidation.isValid) {
        return { error: nameValidation.errors.join(', ') };
      }
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.errors.join(', ') };
      }
      if (!gradeValidation.isValid) {
        return { error: gradeValidation.errors.join(', ') };
      }
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors.join(', ') };
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
        return { error: 'A student with this name already exists in this school and grade' };
      }

      // Hash password securely
      const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

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
        return { error: 'Registration failed' };
      }

      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'session_error', // Using valid type
        userId: newStudent.id,
        details: 'New student account created',
        severity: 'low'
      });

      return { student: newStudent };

    } catch (error) {
      console.error('Student registration error:', error);
      return { error: 'Registration service unavailable' };
    }
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
