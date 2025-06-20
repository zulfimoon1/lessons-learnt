
import { supabase } from '@/integrations/supabase/client';
import { secureTeacherLogin, secureTeacherSignup } from './secureAuthService';
import { secureStudentLogin, secureStudentSignup } from './secureStudentAuthService';

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('🔐 Teacher email login service called for:', email);
    
    const result = await secureTeacherLogin(email, password);
    
    if (result.teacher) {
      console.log('✅ Teacher login successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher login failed');
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Teacher login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 Teacher signup service called for:', name);
    
    const result = await secureTeacherSignup(name, email, school, password, role);
    
    if (result.teacher) {
      console.log('✅ Teacher signup successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher signup failed');
      return { error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Teacher signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('🔐 Student simple login service called for:', fullName);
    
    // For student login, we need to find the student first by full name
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim());

    if (queryError) {
      console.error('Student query error:', queryError);
      return { error: 'Login failed' };
    }

    if (!students || students.length === 0) {
      console.log('❌ Student not found');
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    console.log('✅ Student found, attempting login');

    // Use the secure student login service
    const result = await secureStudentLogin(student.full_name, student.school, student.grade, password);
    
    if (result.student) {
      console.log('✅ Student login successful');
      return { student: result.student };
    } else {
      console.log('❌ Student login failed');
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Student login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 Student signup service called for:', fullName);
    
    const result = await secureStudentSignup(fullName, school, grade, password);
    
    if (result.student) {
      console.log('✅ Student signup successful');
      return { student: result.student };
    } else {
      console.log('❌ Student signup failed');
      return { error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Student signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};
