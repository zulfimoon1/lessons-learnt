
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from './securePasswordService';
import { securityValidationService } from './securityValidationService';

export const secureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    const identifier = `${fullName}-${school}-${grade}`;
    
    // Rate limiting check
    if (!securityValidationService.checkRateLimit(identifier)) {
      return { error: 'Too many login attempts. Please try again later.' };
    }

    // Enhanced input validation
    const nameValidation = securityValidationService.validateInput(fullName, 'name');
    if (!nameValidation.isValid) {
      return { error: nameValidation.errors.join(', ') };
    }

    const schoolValidation = securityValidationService.validateInput(school, 'school');
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.errors.join(', ') };
    }

    const gradeValidation = securityValidationService.validateInput(grade, 'grade');
    if (!gradeValidation.isValid) {
      return { error: gradeValidation.errors.join(', ') };
    }

    // Database query with proper error handling
    const { data: students, error } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', nameValidation.sanitizedValue)
      .eq('school', schoolValidation.sanitizedValue)
      .eq('grade', gradeValidation.sanitizedValue)
      .limit(1);

    if (error || !students || students.length === 0) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Invalid student login credentials',
        'medium'
      );
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Invalid student password',
        'medium'
      );
      return { error: 'Invalid credentials' };
    }

    // Create authenticated session using Supabase Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${student.id}@student.local`, // Virtual email for student auth
      password: password
    });

    if (signInError) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Student authentication failed',
        'medium'
      );
      return { error: 'Authentication failed' };
    }

    return { 
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        grade: student.grade,
        role: 'student'
      },
      session: signInData.session
    };
  } catch (error) {
    console.error('Secure student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const secureTeacherLogin = async (email: string, password: string) => {
  try {
    // Rate limiting check
    if (!securityValidationService.checkRateLimit(email)) {
      return { error: 'Too many login attempts. Please try again later.' };
    }

    // Enhanced input validation
    const emailValidation = securityValidationService.validateInput(email, 'email');
    if (!emailValidation.isValid) {
      return { error: emailValidation.errors.join(', ') };
    }

    const passwordValidation = securityValidationService.validateInput(password, 'password');
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.errors.join(', ') };
    }

    // Database query with proper error handling
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', emailValidation.sanitizedValue)
      .limit(1);

    if (error || !teachers || teachers.length === 0) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Invalid teacher login credentials',
        'medium'
      );
      return { error: 'Invalid credentials' };
    }

    const teacher = teachers[0];
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    if (!isPasswordValid) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Invalid teacher password',
        'medium'
      );
      return { error: 'Invalid credentials' };
    }

    // Create authenticated session using Supabase Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: teacher.email,
      password: password
    });

    if (signInError) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        'Teacher authentication failed',
        'medium'
      );
      return { error: 'Authentication failed' };
    }

    return { 
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      },
      session: signInData.session
    };
  } catch (error) {
    console.error('Secure teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    // Enhanced input validation
    const nameValidation = securityValidationService.validateInput(fullName, 'name');
    if (!nameValidation.isValid) {
      return { error: nameValidation.errors.join(', ') };
    }

    const schoolValidation = securityValidationService.validateInput(school, 'school');
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.errors.join(', ') };
    }

    const gradeValidation = securityValidationService.validateInput(grade, 'grade');
    if (!gradeValidation.isValid) {
      return { error: gradeValidation.errors.join(', ') };
    }

    const passwordValidation = securityValidationService.validateInput(password, 'password');
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.errors.join(', ') };
    }

    // Check if student already exists
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', nameValidation.sanitizedValue)
      .eq('school', schoolValidation.sanitizedValue)
      .eq('grade', gradeValidation.sanitizedValue)
      .limit(1);

    if (existingStudents && existingStudents.length > 0) {
      return { error: 'Student already exists with these details' };
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Create student record
    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        full_name: nameValidation.sanitizedValue,
        school: schoolValidation.sanitizedValue,
        grade: gradeValidation.sanitizedValue,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Student signup error:', error);
      return { error: 'Failed to create student account' };
    }

    // Create auth user for session management
    const virtualEmail = `${student.id}@student.local`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: virtualEmail,
      password: password,
      options: {
        data: {
          user_type: 'student',
          student_id: student.id,
          full_name: student.full_name,
          school: student.school,
          grade: student.grade
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      // Clean up student record if auth creation fails
      await supabase.from('students').delete().eq('id', student.id);
      return { error: 'Failed to create student account' };
    }

    return { 
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        grade: student.grade,
        role: 'student'
      },
      session: authData.session
    };
  } catch (error) {
    console.error('Secure student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    // Enhanced input validation
    const nameValidation = securityValidationService.validateInput(name, 'name');
    if (!nameValidation.isValid) {
      return { error: nameValidation.errors.join(', ') };
    }

    const emailValidation = securityValidationService.validateInput(email, 'email');
    if (!emailValidation.isValid) {
      return { error: emailValidation.errors.join(', ') };
    }

    const schoolValidation = securityValidationService.validateInput(school, 'school');
    if (!schoolValidation.isValid) {
      return { error: schoolValidation.errors.join(', ') };
    }

    const passwordValidation = securityValidationService.validateInput(password, 'password');
    if (!passwordValidation.isValid) {
      return { error: passwordValidation.errors.join(', ') };
    }

    // Validate role
    const validRoles = ['teacher', 'admin', 'doctor'];
    if (!validRoles.includes(role)) {
      return { error: 'Invalid role specified' };
    }

    // Check if teacher already exists
    const { data: existingTeachers } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', emailValidation.sanitizedValue)
      .limit(1);

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'Teacher already exists with this email' };
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Create teacher record
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        name: nameValidation.sanitizedValue,
        email: emailValidation.sanitizedValue,
        school: schoolValidation.sanitizedValue,
        role: role,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Failed to create teacher account' };
    }

    // Create auth user for session management
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailValidation.sanitizedValue,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/teacher-dashboard`,
        data: {
          user_type: 'teacher',
          teacher_id: teacher.id,
          name: teacher.name,
          school: teacher.school,
          role: teacher.role
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      // Clean up teacher record if auth creation fails
      await supabase.from('teachers').delete().eq('id', teacher.id);
      return { error: 'Failed to create teacher account' };
    }

    return { 
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role
      },
      session: authData.session
    };
  } catch (error) {
    console.error('Secure teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
