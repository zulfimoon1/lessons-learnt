import { supabase } from '@/integrations/supabase/client';
import { secureSessionService } from './secureSessionService';
import { securityService } from './securityService';
import bcrypt from 'bcryptjs';

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  needs_password_change?: boolean;
}

interface AuthResult {
  student?: Student;
  error?: string;
  needsPasswordChange?: boolean;
}

export const secureStudentLogin = async (
  fullName: string, 
  password: string
): Promise<AuthResult> => {
  try {
    console.log('🔐 SecureStudentAuth: Starting secure login process for:', { fullName });

    // Input validation
    const nameValidation = securityService.validateAndSanitizeInput(fullName, 'name');
    
    if (!nameValidation.isValid) {
      return { error: 'Invalid input provided' };
    }

    // Call the secure authentication function with hardcoded demo school data
    const { data: authResult, error: authError } = await supabase.rpc('authenticate_student_working', {
      name_param: nameValidation.sanitized,
      school_param: "demo school",
      grade_param: "5",
      password_param: password
    });

    console.log('🔐 SecureStudentAuth: Database function returned:', { authResult, authError });
    const loginSuccess = !authError && authResult && authResult.length > 0 && authResult[0].password_valid;
    
    try {
      await supabase.from('student_login_activity').insert({
        student_id: loginSuccess ? authResult[0].student_id : null,
        school: "demo school",
        grade: "5",
        success: loginSuccess,
        user_agent: navigator.userAgent
      });
    } catch (trackingError) {
      console.warn('Failed to track login activity:', trackingError);
    }

    if (authError) {
      console.error('❌ SecureStudentAuth: Database authentication error:', authError);
      console.error('❌ SecureStudentAuth: Full error details:', JSON.stringify(authError, null, 2));
      return { error: `Authentication failed: ${authError.message || authError}` };
    }

    if (!authResult || authResult.length === 0) {
      console.log('❌ SecureStudentAuth: No matching student found');
      return { error: 'Invalid credentials' };
    }

    const studentData = authResult[0];
    
    if (!studentData.student_id || !studentData.password_valid) {
      console.log('❌ SecureStudentAuth: Invalid credentials');
      return { error: 'Invalid credentials' };
    }

    console.log('✅ SecureStudentAuth: Student authenticated successfully');

    const student: Student = {
      id: studentData.student_id,
      full_name: studentData.student_name,
      school: studentData.student_school,
      grade: studentData.student_grade
    };

    // Create a Supabase auth session for the student
    try {
      // Sign in the student using Supabase auth with a temporary email
      const studentEmail = `${student.id}@student.local`;
      
      // First, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: 'student-temp-password'
      });

      // If sign in fails, create the user first
      if (signInError) {
        console.log('🔄 Creating Supabase user for student...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: studentEmail,
          password: 'student-temp-password',
          options: {
            data: {
              user_type: 'student',
              full_name: student.full_name,
              school: student.school,
              grade: student.grade,
              student_id: student.id
            }
          }
        });

        if (signUpError) {
          console.warn('⚠️ Could not create Supabase session, but student auth succeeded');
        } else {
          console.log('✅ Created Supabase user for student');
        }
      } else {
        console.log('✅ Student signed into Supabase successfully');
      }
    } catch (sessionError) {
      console.warn('⚠️ Supabase session creation failed, but student authentication succeeded:', sessionError);
    }

    // Store in secure session service
    secureSessionService.securelyStoreUserData('student', student);

    console.log('✅ SecureStudentAuth: Login completed successfully');
    return { student };

  } catch (error) {
    console.error('💥 SecureStudentAuth: Login failed:', error);
    
    // Track failed login attempt
    try {
      await supabase.from('student_login_activity').insert({
        school: 'Unknown',
        grade: 'Unknown',
        success: false,
        user_agent: navigator.userAgent
      });
    } catch (trackingError) {
      console.warn('Failed to track failed login:', trackingError);
    }
    
    securityService.logSecurityEvent({
      type: 'login_failed',
      timestamp: new Date().toISOString(),
      details: `Student login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userAgent: navigator.userAgent
    });
    
    return { error: 'Authentication failed' };
  }
};

// Enhanced secure student signup
export const secureStudentSignup = async (
  fullName: string,
  school: string, 
  grade: string,
  password: string
): Promise<AuthResult> => {
  try {
    console.log('📝 SecureStudentAuth: Starting secure signup process for:', { fullName, school, grade });

    // Input validation
    const nameValidation = securityService.validateAndSanitizeInput(fullName, 'name');
    const schoolValidation = securityService.validateAndSanitizeInput(school, 'school');
    const passwordValidation = securityService.validatePassword(password);
    
    if (!nameValidation.isValid || !schoolValidation.isValid || !passwordValidation.isValid) {
      return { error: passwordValidation.message || 'Invalid input provided' };
    }

    // Hash password securely
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert student record
    const { data: studentData, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: nameValidation.sanitized,
        school: schoolValidation.sanitized,
        grade: grade.trim(),
        password_hash: hashedPassword
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ SecureStudentAuth: Signup failed:', insertError);
      
      if (insertError.code === '23505') {
        return { error: 'A student with this name already exists in this school and grade' };
      }
      
      return { error: 'Registration failed' };
    }

    const student: Student = {
      id: studentData.id,
      full_name: studentData.full_name,
      school: studentData.school,
      grade: studentData.grade
    };

    // Create Supabase auth session
    try {
      const studentEmail = `${student.id}@student.local`;
      const { error: signUpError } = await supabase.auth.signUp({
        email: studentEmail,
        password: 'student-temp-password',
        options: {
          data: {
            user_type: 'student',
            full_name: student.full_name,
            school: student.school,
            grade: student.grade,
            student_id: student.id
          }
        }
      });

      if (signUpError) {
        console.warn('⚠️ Could not create Supabase session during signup');
      }
    } catch (sessionError) {
      console.warn('⚠️ Supabase session creation failed during signup:', sessionError);
    }

    // Store in secure session service
    secureSessionService.securelyStoreUserData('student', student);

    console.log('✅ SecureStudentAuth: Signup completed successfully');
    return { student };

  } catch (error) {
    console.error('💥 SecureStudentAuth: Signup failed:', error);
    return { error: 'Registration failed' };
  }
};
