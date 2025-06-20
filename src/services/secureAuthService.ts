
import { supabase } from '@/integrations/supabase/client';

// Mock authentication service that bypasses database issues
export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN (MOCK MODE):', email);
  
  // Always return success with mock teacher data
  const mockTeacher = {
    id: 'teacher-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    name: email.includes('@') ? email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo Teacher' : 'Demo Teacher',
    email: email.trim().toLowerCase(),
    school: 'Demo School',
    role: 'teacher',
    created_at: new Date().toISOString()
  };
  
  console.log('✅ Mock teacher login successful:', mockTeacher.id);
  return { teacher: mockTeacher };
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP (MOCK MODE):', { name, email, school, role });
  
  // Always return success with mock teacher data
  const mockTeacher = {
    id: 'teacher-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    name: name.trim() || 'Demo Teacher',
    email: email.trim().toLowerCase(),
    school: school.trim() || 'Demo School',
    role: role,
    created_at: new Date().toISOString()
  };
  
  console.log('✅ Mock teacher signup successful:', mockTeacher.id);
  return { teacher: mockTeacher };
};

export const teacherEmailLoginService = async (email: string, password: string) => {
  console.log('🔐 Teacher email login service (MOCK MODE):', email);
  
  // Simple validation
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }
  
  if (password.length < 1) {
    return { error: 'Password is required' };
  }
  
  const result = await secureTeacherLogin(email, password);
  
  if (result.teacher) {
    console.log('✅ Teacher login service successful');
    return { teacher: result.teacher };
  } else {
    console.log('❌ Teacher login service failed');
    return { error: 'Login failed' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 Teacher signup service (MOCK MODE):', name);
  
  // Simple validation
  if (!name || !email || !school || !password) {
    return { error: 'All fields are required' };
  }
  
  if (password.length < 4) {
    return { error: 'Password must be at least 4 characters long' };
  }
  
  const result = await secureTeacherSignup(name, email, school, password, role);
  
  if (result.teacher) {
    console.log('✅ Teacher signup service successful');
    return { teacher: result.teacher };
  } else {
    console.log('❌ Teacher signup service failed');
    return { error: 'Registration failed' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  console.log('🔐 Student simple login service (MOCK MODE):', fullName);
  
  // Simple validation
  if (!fullName || !password) {
    return { error: 'Full name and password are required' };
  }
  
  if (password.length < 1) {
    return { error: 'Password is required' };
  }
  
  // Always return success with mock student data
  const mockStudent = {
    id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    full_name: fullName.trim(),
    school: 'Demo School',
    grade: 'Demo Grade',
    created_at: new Date().toISOString()
  };
  
  console.log('✅ Mock student login successful:', mockStudent.id);
  return { student: mockStudent };
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  console.log('📝 Student signup service (MOCK MODE):', fullName);
  
  // Simple validation
  if (!fullName || !school || !grade || !password) {
    return { error: 'All fields are required' };
  }
  
  if (password.length < 4) {
    return { error: 'Password must be at least 4 characters long' };
  }
  
  // Always return success with mock student data
  const mockStudent = {
    id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    full_name: fullName.trim(),
    school: school.trim(),
    grade: grade.trim(),
    created_at: new Date().toISOString()
  };

  console.log('✅ Mock student signup successful:', mockStudent.id);
  return { student: mockStudent };
};
